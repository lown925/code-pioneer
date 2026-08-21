import { ConflictException, Injectable, Optional } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import {
  BATTLE_CORRECT_SCORE,
  BATTLE_DURATION_SECONDS,
  BATTLE_UNANSWERED_SCORE,
  BATTLE_WRONG_SCORE,
  DEFAULT_BATTLE_QUESTION_COUNT,
  INITIAL_MATCH_RATING_RANGE,
  AI_UNLOCK_SECONDS,
  MATCHMAKING_HEARTBEAT_TTL_SECONDS,
  MATCHMAKING_TTL_SECONDS,
  MATCH_RANGE_EXPANSION,
  MATCH_RANGE_EXPANSION_INTERVAL_SECONDS,
  RANKED_MATCH_READY_TTL_SECONDS,
} from './battle.constants';
import { BattleDomainService } from './battle-domain.service';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { BattleSkillService } from './battle-skill.service';
import {
  BattleTrackService,
  DEFAULT_BATTLE_RATING,
  DEFAULT_PROFESSIONAL_TRACK_KEY,
} from './battle-track.service';
import type {
  BattleTransactionClient,
  MatchmakingStatusPayload,
  MatchmakingViewStatus,
} from './battle.types';

type QueueRecord = {
  userId: string;
  skillCode: string | null;
  professionalTrackKey: string | null;
  status: 'SEARCHING' | 'MATCHED' | 'CANCELLED' | 'EXPIRED';
  ratingSnapshot: number;
  matchedBattleRoomId: string | null;
  searchStartedAt: Date | null;
  matchedAt: Date | null;
  cancelledAt: Date | null;
  expiresAt: Date | null;
  updatedAt: Date;
};

@Injectable()
export class BattleMatchmakingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleDomainService: BattleDomainService,
    private readonly battleSkillService: BattleSkillService,
    @Optional() private readonly battleTrackService?: BattleTrackService,
  ) {}

  async joinMatchmaking(
    currentUser: CurrentUserContext,
    requestedSkill = 'PYTHON',
    requestedTrack = DEFAULT_PROFESSIONAL_TRACK_KEY,
  ) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const professionalTrackKey = this.normalizeTrack(requestedTrack);
      await this.battleDomainService.acquireUserBattleLock(currentUser.id, tx);
      const skill = await this.battleSkillService.assertAvailableSkill(
        requestedSkill,
        tx,
      );
      const ratingSnapshot = this.battleTrackService
        ? (await this.battleTrackService.getRating(currentUser.id, professionalTrackKey, tx))?.rating ?? DEFAULT_BATTLE_RATING
        : (await this.battleSkillService.ensureUserSkillRating(currentUser.id, skill.code, tx)).rating;

      await this.battleDomainService.normalizeExpiredFriendRoomsForUser(
        currentUser.id,
        now,
        tx,
      );
      await this.battleDomainService.normalizeExpiredRankedMatchRoomsForUser(
        currentUser.id,
        now,
        tx,
      );

      let queue = await this.findQueueByUserId(tx, currentUser.id);
      queue = await this.normalizeQueueState(tx, queue, now);

      if (
        queue?.status === 'MATCHED' &&
        queue.matchedBattleRoomId &&
        (await this.isActiveBattleRoom(tx, queue.matchedBattleRoomId))
      ) {
        return this.createPayload('MATCHED', {
          skill: queue.skillCode,
          professionalTrackKey: queue.professionalTrackKey,
          battleId: queue.matchedBattleRoomId,
          searchStartedAt: queue.searchStartedAt,
          expiresAt: queue.expiresAt,
          serverTime: now,
        });
      }

      await this.battleDomainService.assertUserHasNoActiveBattle(
        currentUser.id,
        tx,
      );

      if (queue?.status === 'SEARCHING') {
        if (
          (queue.professionalTrackKey && queue.professionalTrackKey !== professionalTrackKey) ||
          (!queue.professionalTrackKey && queue.skillCode !== skill.code)
        ) {
          throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_SKILL_LOCKED);
        }

        await this.touchQueueHeartbeat(tx, currentUser.id, now);
        queue = { ...queue, updatedAt: now };

        const matchResult = await this.tryMatchUser(tx, {
          currentUserId: currentUser.id,
          skillCode: skill.code,
          professionalTrackKey: queue.professionalTrackKey ?? professionalTrackKey,
          useLegacySkillIsolation:
            !this.battleTrackService || !queue.professionalTrackKey,
          currentRating: queue.ratingSnapshot,
          searchStartedAt: queue.searchStartedAt ?? now,
          expiresAt: queue.expiresAt ?? this.createExpiry(now),
          now,
        });

        return (
          matchResult ??
          this.createPayload('SEARCHING', {
            skill: skill.code,
            professionalTrackKey: queue.professionalTrackKey ?? professionalTrackKey,
            searchStartedAt: queue.searchStartedAt,
            expiresAt: queue.expiresAt,
            serverTime: now,
          })
        );
      }

      const searchStartedAt = now;
      const expiresAt = this.createExpiry(now);

      if (queue) {
        await tx.battleMatchQueue.update({
          where: { userId: currentUser.id },
          data: {
            status: 'SEARCHING',
            skillCode: skill.code,
            professionalTrackKey,
            ratingSnapshot,
            searchStartedAt,
            matchedAt: null,
            cancelledAt: null,
            matchedBattleRoomId: null,
            expiresAt,
          },
        });
      } else {
        await tx.battleMatchQueue.create({
          data: {
            userId: currentUser.id,
            skillCode: skill.code,
            professionalTrackKey,
            status: 'SEARCHING',
            ratingSnapshot,
            searchStartedAt,
            expiresAt,
          },
        });
      }

      const matchResult = await this.tryMatchUser(tx, {
        currentUserId: currentUser.id,
        skillCode: skill.code,
        professionalTrackKey,
        useLegacySkillIsolation: !this.battleTrackService,
        currentRating: ratingSnapshot,
        searchStartedAt,
        expiresAt,
        now,
      });

      return (
        matchResult ??
        this.createPayload('SEARCHING', {
          skill: skill.code,
          professionalTrackKey,
          searchStartedAt,
          expiresAt,
          serverTime: now,
        })
      );
    });
    const waitingCount = await this.countWaitingUsers(data.skill, data.professionalTrackKey);

    return {
      success: true as const,
      data: {
        ...data,
        waitingCount,
      },
    };
  }

  async getMatchmakingStatus(
    currentUser: CurrentUserContext,
    requestedSkill = 'PYTHON',
    requestedTrack = DEFAULT_PROFESSIONAL_TRACK_KEY,
  ) {
    const normalizedRequestedSkill = (requestedSkill || 'PYTHON')
      .trim()
      .toUpperCase();
    const normalizedTrack = this.normalizeTrack(requestedTrack);
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleDomainService.acquireUserBattleLock(currentUser.id, tx);
      await this.battleDomainService.normalizeExpiredFriendRoomsForUser(
        currentUser.id,
        now,
        tx,
      );
      await this.battleDomainService.normalizeExpiredRankedMatchRoomsForUser(
        currentUser.id,
        now,
        tx,
      );
      let queue = await this.findQueueByUserId(tx, currentUser.id);

      if (!queue) {
        return this.createPayload('IDLE', {
          skill: normalizedRequestedSkill,
          professionalTrackKey: normalizedTrack,
          serverTime: now,
        });
      }

      queue = await this.normalizeQueueState(tx, queue, now);

      if (!queue) {
        return this.createPayload('IDLE', {
          skill: normalizedRequestedSkill,
          professionalTrackKey: normalizedTrack,
          serverTime: now,
        });
      }

      if (queue.status === 'SEARCHING') {
        await this.touchQueueHeartbeat(tx, currentUser.id, now);
        queue = { ...queue, updatedAt: now };

        const matchResult = await this.tryMatchUser(tx, {
          currentUserId: currentUser.id,
          skillCode: queue.skillCode,
          professionalTrackKey: queue.professionalTrackKey ?? normalizedTrack,
          useLegacySkillIsolation:
            !this.battleTrackService || !queue.professionalTrackKey,
          currentRating: queue.ratingSnapshot,
          searchStartedAt: queue.searchStartedAt ?? now,
          expiresAt: queue.expiresAt ?? this.createExpiry(now),
          now,
        });

        return (
          matchResult ??
          this.createPayload('SEARCHING', {
            skill: queue.skillCode,
            professionalTrackKey: queue.professionalTrackKey ?? normalizedTrack,
            searchStartedAt: queue.searchStartedAt,
            expiresAt: queue.expiresAt,
            serverTime: now,
          })
        );
      }

      if (
        queue.status === 'MATCHED' &&
        queue.matchedBattleRoomId &&
        (await this.isActiveBattleRoom(tx, queue.matchedBattleRoomId))
      ) {
        return this.createPayload('MATCHED', {
          skill: queue.skillCode,
          professionalTrackKey: queue.professionalTrackKey ?? normalizedTrack,
          battleId: queue.matchedBattleRoomId,
          searchStartedAt: queue.searchStartedAt,
          expiresAt: queue.expiresAt,
          serverTime: now,
        });
      }

      return this.createPayload(queue.status, {
        skill: queue.skillCode,
        professionalTrackKey: queue.professionalTrackKey ?? normalizedTrack,
        searchStartedAt: queue.searchStartedAt,
        expiresAt: queue.expiresAt,
        serverTime: now,
      });
    });
    const waitingCount = await this.countWaitingUsers(data.skill, data.professionalTrackKey);

    return {
      success: true as const,
      data: {
        ...data,
        waitingCount,
      },
    };
  }

  async cancelMatchmaking(currentUser: CurrentUserContext) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleDomainService.acquireUserBattleLock(currentUser.id, tx);
      await this.battleDomainService.normalizeExpiredFriendRoomsForUser(
        currentUser.id,
        now,
        tx,
      );
      await this.battleDomainService.normalizeExpiredRankedMatchRoomsForUser(
        currentUser.id,
        now,
        tx,
      );
      let queue = await this.findQueueByUserId(tx, currentUser.id);

      if (!queue) {
        return this.createPayload('IDLE', { serverTime: now });
      }

      queue = await this.normalizeQueueState(tx, queue, now);

      if (!queue) {
        return this.createPayload('IDLE', { serverTime: now });
      }

      if (queue.status === 'MATCHED' && queue.matchedBattleRoomId) {
        const activeBattle =
          await this.battleDomainService.getActiveBattleForUser(
            currentUser.id,
            tx,
          );

        if (activeBattle) {
          const released =
            await this.battleDomainService.cancelCancellableBattleRoomForUser(
              currentUser.id,
              now,
              tx,
            );

          if (!released) {
            throw new ConflictException(
              BATTLE_ERROR_CODES.BATTLE_MATCH_ALREADY_COMPLETED,
            );
          }
        }

        await tx.battleMatchQueue.update({
          where: { userId: currentUser.id },
          data: {
            status: 'CANCELLED',
            matchedBattleRoomId: null,
            matchedAt: null,
            cancelledAt: now,
          },
        });

        return this.createPayload('CANCELLED', {
          skill: queue.skillCode,
          professionalTrackKey: queue.professionalTrackKey,
          searchStartedAt: queue.searchStartedAt,
          expiresAt: queue.expiresAt,
          serverTime: now,
        });
      }

      if (queue.status === 'SEARCHING') {
        const updated = await tx.battleMatchQueue.updateMany({
          where: {
            userId: currentUser.id,
            status: 'SEARCHING',
            expiresAt: {
              gt: now,
            },
          },
          data: {
            status: 'CANCELLED',
            cancelledAt: now,
            matchedAt: null,
            matchedBattleRoomId: null,
          },
        });

        if (updated.count === 0) {
          throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_MATCH_EXPIRED);
        }

        return this.createPayload('CANCELLED', {
          skill: queue.skillCode,
          professionalTrackKey: queue.professionalTrackKey,
          searchStartedAt: queue.searchStartedAt,
          expiresAt: queue.expiresAt,
          serverTime: now,
        });
      }

      return this.createPayload(queue.status, {
        skill: queue.skillCode,
        professionalTrackKey: queue.professionalTrackKey,
        searchStartedAt: queue.searchStartedAt,
        expiresAt: queue.expiresAt,
        serverTime: now,
      });
    });
    const waitingCount = await this.countWaitingUsers(
      data.skill,
      data.professionalTrackKey,
    );

    return {
      success: true as const,
      data: {
        ...data,
        waitingCount,
      },
    };
  }

  private async tryMatchUser(
    tx: BattleTransactionClient,
    input: {
      currentUserId: string;
      skillCode: string | null;
      professionalTrackKey: string;
      useLegacySkillIsolation: boolean;
      currentRating: number;
      searchStartedAt: Date;
      expiresAt: Date;
      now: Date;
    },
  ) {
    const {
      currentUserId,
      skillCode,
      professionalTrackKey,
      useLegacySkillIsolation,
      currentRating,
      searchStartedAt,
      expiresAt,
      now,
    } = input;

    const candidates = (await tx.battleMatchQueue.findMany({
      where: {
        status: 'SEARCHING',
        userId: {
          not: currentUserId,
        },
        ...(useLegacySkillIsolation
          ? { skillCode }
          : { professionalTrackKey }),
        expiresAt: {
          gt: now,
        },
      },
      select: {
        userId: true,
        skillCode: true,
        professionalTrackKey: true,
        status: true,
        ratingSnapshot: true,
        searchStartedAt: true,
        expiresAt: true,
        matchedBattleRoomId: true,
        matchedAt: true,
        cancelledAt: true,
        updatedAt: true,
      },
      orderBy: [{ searchStartedAt: 'asc' }, { userId: 'asc' }],
    })) as QueueRecord[];

    const scopedCandidates = candidates.filter((candidate) =>
      this.battleTrackService && !useLegacySkillIsolation
        ? candidate.professionalTrackKey === professionalTrackKey
        : candidate.skillCode === skillCode,
    );
    const sortedCandidates = scopedCandidates
      .filter((candidate) =>
        this.isCandidateWithinRange({
          currentRating,
          currentSearchStartedAt: searchStartedAt,
          candidateRating: candidate.ratingSnapshot,
          candidateSearchStartedAt: candidate.searchStartedAt ?? now,
          now,
        }),
      )
      .sort((left, right) => {
        const ratingDiff =
          Math.abs(left.ratingSnapshot - currentRating) -
          Math.abs(right.ratingSnapshot - currentRating);

        if (ratingDiff !== 0) {
          return ratingDiff;
        }

        const leftTime = left.searchStartedAt?.getTime() ?? 0;
        const rightTime = right.searchStartedAt?.getTime() ?? 0;

        if (leftTime !== rightTime) {
          return leftTime - rightTime;
        }

        return left.userId.localeCompare(right.userId);
      });

    for (const candidate of sortedCandidates) {
      const candidateLockAcquired =
        await this.battleDomainService.tryAcquireUserBattleLock(
          candidate.userId,
          tx,
        );

      if (!candidateLockAcquired) {
        continue;
      }

      await this.battleDomainService.normalizeExpiredFriendRoomsForUser(
        candidate.userId,
        now,
        tx,
      );
      const candidateActiveBattle =
        await this.battleDomainService.getActiveBattleForUser(
          candidate.userId,
          tx,
        );

      if (candidateActiveBattle) {
        await tx.battleMatchQueue.updateMany({
          where: {
            userId: candidate.userId,
            status: 'SEARCHING',
          },
          data: {
            status: 'CANCELLED',
            cancelledAt: now,
            matchedBattleRoomId: null,
            matchedAt: null,
          },
        });
        continue;
      }

      const currentClaim = await tx.battleMatchQueue.updateMany({
        where: {
          userId: currentUserId,
            ...(useLegacySkillIsolation ? { skillCode } : { professionalTrackKey }),
          status: 'SEARCHING',
          expiresAt: {
            gt: now,
          },
        },
        data: {
          status: 'MATCHED',
          matchedAt: now,
        },
      });

      if (currentClaim.count !== 1) {
        return null;
      }

      const candidateClaim = await tx.battleMatchQueue.updateMany({
        where: {
          userId: candidate.userId,
          ...(useLegacySkillIsolation ? { skillCode } : { professionalTrackKey }),
          status: 'SEARCHING',
          expiresAt: {
            gt: now,
          },
        },
        data: {
          status: 'MATCHED',
          matchedAt: now,
        },
      });

      if (candidateClaim.count !== 1) {
        await tx.battleMatchQueue.update({
          where: { userId: currentUserId },
          data: {
            status: 'SEARCHING',
            matchedAt: null,
          },
        });
        continue;
      }

      const room = await tx.battleRoom.create({
        data: {
          mode: BattleMode.RANKED,
          skillCode,
          professionalTrackKey,
          status: BattleRoomStatus.WAITING,
          questionCount: DEFAULT_BATTLE_QUESTION_COUNT,
          durationSeconds: BATTLE_DURATION_SECONDS,
          correctScore: BATTLE_CORRECT_SCORE,
          wrongScore: BATTLE_WRONG_SCORE,
          unansweredScore: BATTLE_UNANSWERED_SCORE,
          expiresAt: new Date(
            now.getTime() + RANKED_MATCH_READY_TTL_SECONDS * 1000,
          ),
          createdByUserId: currentUserId,
        },
        select: {
          id: true,
        },
      });

      await tx.battleParticipant.createMany({
        data: [
          {
            battleRoomId: room.id,
            userId: currentUserId,
            seat: 1,
            status: BattleParticipantStatus.JOINED,
            result: BattleResult.NONE,
          },
          {
            battleRoomId: room.id,
            userId: candidate.userId,
            seat: 2,
            status: BattleParticipantStatus.JOINED,
            result: BattleResult.NONE,
          },
        ],
      });

      await tx.battleMatchQueue.updateMany({
        where: {
          userId: {
            in: [currentUserId, candidate.userId],
          },
        },
        data: {
          status: 'MATCHED',
          matchedBattleRoomId: room.id,
          matchedAt: now,
        },
      });

      return this.createPayload('MATCHED', {
        skill: skillCode,
        battleId: room.id,
        professionalTrackKey: useLegacySkillIsolation ? null : professionalTrackKey,
        searchStartedAt,
        expiresAt,
        serverTime: now,
      });
    }

    return null;
  }

  private async normalizeQueueState(
    tx: BattleTransactionClient,
    queue: QueueRecord | null,
    now: Date,
  ) {
    if (!queue) {
      return null;
    }

    if (
      queue.status === 'SEARCHING' &&
      queue.expiresAt &&
      queue.expiresAt.getTime() <= now.getTime()
    ) {
      await tx.battleMatchQueue.update({
        where: { userId: queue.userId },
        data: {
          status: 'EXPIRED',
          matchedBattleRoomId: null,
          matchedAt: null,
        },
      });

      return {
        ...queue,
        status: 'EXPIRED' as const,
        matchedBattleRoomId: null,
        matchedAt: null,
      };
    }

    if (queue.status === 'MATCHED') {
      if (
        !queue.matchedBattleRoomId ||
        !(await this.isActiveBattleRoom(tx, queue.matchedBattleRoomId))
      ) {
        await tx.battleMatchQueue.update({
          where: { userId: queue.userId },
          data: {
            status: 'CANCELLED',
            matchedBattleRoomId: null,
            matchedAt: null,
          },
        });

        return {
          ...queue,
          status: 'CANCELLED' as const,
          matchedBattleRoomId: null,
          matchedAt: null,
        };
      }
    }

    return queue;
  }

  private async isActiveBattleRoom(
    tx: BattleTransactionClient,
    battleId: string,
  ) {
    const room = await tx.battleRoom.findUnique({
      where: { id: battleId },
      select: { status: true },
    });

    return room
      ? this.battleDomainService.isActiveRoomStatus(room.status)
      : false;
  }

  private createExpiry(now: Date) {
    return new Date(now.getTime() + MATCHMAKING_TTL_SECONDS * 1000);
  }

  private normalizeTrack(trackKey?: string) {
    return this.battleTrackService?.normalize(trackKey) ?? DEFAULT_PROFESSIONAL_TRACK_KEY;
  }

  private async touchQueueHeartbeat(
    tx: BattleTransactionClient,
    userId: string,
    now: Date,
  ) {
    await tx.battleMatchQueue.updateMany({
      where: {
        userId,
        status: 'SEARCHING',
        expiresAt: { gt: now },
      },
      data: { updatedAt: now },
    });
  }

  private getAllowedRange(searchStartedAt: Date, now: Date) {
    const waitSeconds = Math.max(
      0,
      Math.floor((now.getTime() - searchStartedAt.getTime()) / 1000),
    );

    return (
      INITIAL_MATCH_RATING_RANGE +
      Math.floor(waitSeconds / MATCH_RANGE_EXPANSION_INTERVAL_SECONDS) *
        MATCH_RANGE_EXPANSION
    );
  }

  private isCandidateWithinRange(input: {
    currentRating: number;
    currentSearchStartedAt: Date;
    candidateRating: number;
    candidateSearchStartedAt: Date;
    now: Date;
  }) {
    const currentAllowedRange = this.getAllowedRange(
      input.currentSearchStartedAt,
      input.now,
    );
    const candidateAllowedRange = this.getAllowedRange(
      input.candidateSearchStartedAt,
      input.now,
    );

    return (
      Math.abs(input.candidateRating - input.currentRating) <=
      Math.max(currentAllowedRange, candidateAllowedRange)
    );
  }

  private createPayload(
    status: MatchmakingViewStatus,
    input: Partial<MatchmakingStatusPayload> & { serverTime: Date },
  ): MatchmakingStatusPayload {
    const searchStartedAt = input.searchStartedAt ?? null;
    const expiresAt = input.expiresAt ?? null;
    const elapsedMs = searchStartedAt
      ? Math.max(0, input.serverTime.getTime() - searchStartedAt.getTime())
      : 0;
    const remainingSearchMs = expiresAt
      ? Math.max(0, expiresAt.getTime() - input.serverTime.getTime())
      : 0;

    return {
      status,
      battleId: input.battleId ?? null,
      searchStartedAt,
      expiresAt,
      serverTime: input.serverTime,
      skill: input.skill ?? null,
      professionalTrackKey: input.professionalTrackKey ?? null,
      waitingCount: input.waitingCount ?? 0,
      elapsedMs,
      remainingSearchMs,
      aiAvailable: elapsedMs >= AI_UNLOCK_SECONDS * 1000,
    };
  }

  private countWaitingUsers(skillCode: string | null, professionalTrackKey?: string | null, now = new Date()) {
    return this.prisma.battleMatchQueue.count({
      where: {
        status: 'SEARCHING',
        ...(this.battleTrackService && professionalTrackKey ? { professionalTrackKey } : { skillCode }),
        expiresAt: {
          gt: now,
        },
      },
    });
  }

  private async findQueueByUserId(tx: BattleTransactionClient, userId: string) {
    return tx.battleMatchQueue.findUnique({
      where: { userId },
      select: {
        userId: true,
        skillCode: true,
        professionalTrackKey: true,
        status: true,
        ratingSnapshot: true,
        matchedBattleRoomId: true,
        searchStartedAt: true,
        matchedAt: true,
        cancelledAt: true,
        expiresAt: true,
        updatedAt: true,
      },
    }) as Promise<QueueRecord | null>;
  }
}
