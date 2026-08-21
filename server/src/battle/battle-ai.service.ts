import { ConflictException, Injectable, Optional } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  BattleMatchQueueStatus,
  BattleMode,
  BattleParticipantStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import type { CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  AI_DISPLAY_NAME,
  AI_STRATEGY_VERSION,
  AI_UNLOCK_SECONDS,
  BATTLE_CORRECT_SCORE,
  BATTLE_DURATION_SECONDS,
  BATTLE_UNANSWERED_SCORE,
  BATTLE_WRONG_SCORE,
  DEFAULT_BATTLE_QUESTION_COUNT,
} from './battle.constants';
import { BattleDomainService } from './battle-domain.service';
import {
  generateBattleAiPlan,
  parseBattleAiAnswerPlan,
  projectBattleAiProgress,
} from './battle-ai-plan';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleQuestionService } from './battle-question.service';
import { BattleSkillService } from './battle-skill.service';
import { BattleTrackService, DEFAULT_PROFESSIONAL_TRACK_KEY } from './battle-track.service';
import type {
  BattleAiMatchmakingResolutionPayload,
  BattleAiStartPayload,
  BattleTransactionClient,
} from './battle.types';

@Injectable()
export class BattleAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleDomainService: BattleDomainService,
    private readonly battleSkillService: BattleSkillService,
    private readonly battleQuestionService: BattleQuestionService,
    @Optional() private readonly battleTrackService?: BattleTrackService,
  ) {}

  async createAiBattle(
    currentUser: CurrentUserContext,
    requestedSkillCode: string,
  ) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const skillCode =
        this.battleSkillService.normalizeSkillCode(requestedSkillCode);

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
      await this.battleSkillService.assertAvailableSkill(skillCode, tx);
      await this.battleDomainService.assertUserHasNoActiveBattle(
        currentUser.id,
        tx,
      );

      return this.createAiBattleWithClient(currentUser.id, skillCode, DEFAULT_PROFESSIONAL_TRACK_KEY, now, tx);
    });

    return {
      success: true as const,
      data,
    };
  }

  async switchFromMatchmaking(currentUser: CurrentUserContext) {
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

      const activeBattle =
        await this.battleDomainService.getActiveBattleForUser(
          currentUser.id,
          tx,
        );

      if (activeBattle) {
        if (activeBattle.mode === BattleMode.AI) {
          return this.createResolution('AI', activeBattle.battleRoomId, now);
        }

        if (activeBattle.mode === BattleMode.RANKED) {
          return this.createResolution('HUMAN', activeBattle.battleRoomId, now);
        }

        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_ALREADY_ACTIVE);
      }

      let queue = await tx.battleMatchQueue.findUnique({
        where: { userId: currentUser.id },
        select: {
          userId: true,
          skillCode: true,
          professionalTrackKey: true,
          status: true,
          searchStartedAt: true,
          expiresAt: true,
        },
      });

      if (
        queue?.status === BattleMatchQueueStatus.SEARCHING &&
        queue.expiresAt &&
        queue.expiresAt.getTime() <= now.getTime()
      ) {
        const expired = await tx.battleMatchQueue.updateMany({
          where: {
            userId: currentUser.id,
            status: BattleMatchQueueStatus.SEARCHING,
            expiresAt: { lte: now },
          },
          data: {
            status: BattleMatchQueueStatus.EXPIRED,
            matchedBattleRoomId: null,
            matchedAt: null,
          },
        });

        if (expired.count !== 1) {
          throw new ConflictException(
            BATTLE_ERROR_CODES.BATTLE_AI_NOT_AVAILABLE,
          );
        }

        queue = {
          ...queue,
          status: BattleMatchQueueStatus.EXPIRED,
        };
      }

      if (
        !queue ||
        (queue.status !== BattleMatchQueueStatus.SEARCHING &&
          queue.status !== BattleMatchQueueStatus.EXPIRED) ||
        !queue.searchStartedAt ||
        !queue.skillCode ||
        now.getTime() - queue.searchStartedAt.getTime() <
          AI_UNLOCK_SECONDS * 1000
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_NOT_AVAILABLE);
      }

      const skillCode = this.battleSkillService.normalizeSkillCode(
        queue.skillCode,
      );
      await this.battleSkillService.assertAvailableSkill(skillCode, tx);

      const queueStatus = queue.status;
      const cancelled = await tx.battleMatchQueue.updateMany({
        where: {
          userId: currentUser.id,
          status: queueStatus,
          ...(queueStatus === BattleMatchQueueStatus.SEARCHING
            ? { expiresAt: { gt: now } }
            : {}),
        },
        data: {
          status: BattleMatchQueueStatus.CANCELLED,
          cancelledAt: now,
          matchedAt: null,
          matchedBattleRoomId: null,
        },
      });

      if (cancelled.count !== 1) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_NOT_AVAILABLE);
      }

      const battle = await this.createAiBattleWithClient(
        currentUser.id,
        skillCode,
        queue.professionalTrackKey ?? DEFAULT_PROFESSIONAL_TRACK_KEY,
        now,
        tx,
      );

      return this.createResolution('AI', battle.battleId, now);
    });

    return {
      success: true as const,
      data,
    };
  }

  private async createAiBattleWithClient(
    userId: string,
    skillCode: string,
    professionalTrackKey: string,
    now: Date,
    tx: BattleTransactionClient,
  ): Promise<BattleAiStartPayload> {
    const room = await tx.battleRoom.create({
      data: {
        mode: BattleMode.AI,
        skillCode,
        professionalTrackKey: this.battleTrackService?.normalize(professionalTrackKey) ?? DEFAULT_PROFESSIONAL_TRACK_KEY,
        status: BattleRoomStatus.WAITING,
        questionCount: DEFAULT_BATTLE_QUESTION_COUNT,
        durationSeconds: BATTLE_DURATION_SECONDS,
        correctScore: BATTLE_CORRECT_SCORE,
        wrongScore: BATTLE_WRONG_SCORE,
        unansweredScore: BATTLE_UNANSWERED_SCORE,
        createdByUserId: userId,
      },
      select: { id: true },
    });

    await tx.battleParticipant.create({
      data: {
        battleRoomId: room.id,
        userId,
        seat: 1,
        status: BattleParticipantStatus.JOINED,
        result: BattleResult.NONE,
      },
    });

    const snapshots = await this.battleQuestionService.createQuestionSnapshots(
      tx,
      {
        battleId: room.id,
        questionCount: DEFAULT_BATTLE_QUESTION_COUNT,
        durationSeconds: BATTLE_DURATION_SECONDS,
        now,
        skillCode,
        professionalTrackKey,
      },
    );
    const seed = this.createSeed();
    const plan = generateBattleAiPlan({
      seed,
      strategyVersion: AI_STRATEGY_VERSION,
      durationSeconds: BATTLE_DURATION_SECONDS,
      snapshots,
    });

    await tx.battleAiOpponent.create({
      data: {
        battleRoomId: room.id,
        displayName: AI_DISPLAY_NAME,
        strategyVersion: AI_STRATEGY_VERSION,
        seed,
        answerPlan: plan.answerPlan,
        plannedSubmittedOffsetMs: plan.plannedSubmittedOffsetMs,
      },
    });

    return {
      battleId: room.id,
      mode: BattleMode.AI,
      skill: skillCode,
      status: BattleRoomStatus.WAITING,
      opponent: {
        displayName: AI_DISPLAY_NAME,
      },
      serverTime: now,
    } satisfies BattleAiStartPayload;
  }

  async getProgress(
    battleId: string,
    serverTime: Date,
    client?: BattleTransactionClient,
  ) {
    const prisma = client ?? this.prisma;
    const room = await prisma.battleRoom.findUnique({
      where: { id: battleId },
      select: {
        startedAt: true,
        aiOpponent: {
          select: {
            answerPlan: true,
            plannedSubmittedOffsetMs: true,
          },
        },
      },
    });

    if (!room?.aiOpponent) {
      return null;
    }

    const answerPlan = parseBattleAiAnswerPlan(room.aiOpponent.answerPlan);

    if (!answerPlan) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID);
    }

    return projectBattleAiProgress({
      startedAt: room.startedAt,
      serverTime,
      answerPlan,
      plannedSubmittedOffsetMs: room.aiOpponent.plannedSubmittedOffsetMs,
    });
  }

  protected createSeed() {
    return randomBytes(16).toString('hex');
  }

  private createResolution(
    resolvedTo: BattleAiMatchmakingResolutionPayload['resolvedTo'],
    battleId: string,
    serverTime: Date,
  ): BattleAiMatchmakingResolutionPayload {
    return {
      resolvedTo,
      battleId,
      serverTime,
    };
  }
}
