import { ConflictException, Injectable, Optional } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  BATTLE_CORRECT_SCORE,
  BATTLE_DURATION_SECONDS,
  BATTLE_UNANSWERED_SCORE,
  BATTLE_WRONG_SCORE,
  DEFAULT_BATTLE_QUESTION_COUNT,
  TRAINING_SKILL_CODE,
  TRAINING_UNLOCK_SECONDS,
} from './battle.constants';
import { BattleDomainService } from './battle-domain.service';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleQuestionService } from './battle-question.service';
import { BattleSkillService } from './battle-skill.service';
import type { BattleTrainingStartPayload } from './battle.types';
import { BattleTrackService, DEFAULT_PROFESSIONAL_TRACK_KEY } from './battle-track.service';

@Injectable()
export class BattleTrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleDomainService: BattleDomainService,
    private readonly battleSkillService: BattleSkillService,
    private readonly battleQuestionService: BattleQuestionService,
    @Optional() private readonly battleTrackService?: BattleTrackService,
  ) {}

  async startTraining(currentUser: CurrentUserContext, requestedTrack = DEFAULT_PROFESSIONAL_TRACK_KEY) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const professionalTrackKey = this.battleTrackService?.normalize(requestedTrack) ?? DEFAULT_PROFESSIONAL_TRACK_KEY;
      const unlockedAt = new Date(
        now.getTime() - TRAINING_UNLOCK_SECONDS * 1000,
      );

      await this.battleDomainService.acquireUserBattleLock(currentUser.id, tx);
      await this.battleDomainService.normalizeExpiredFriendRoomsForUser(
        currentUser.id,
        now,
        tx,
      );
      await this.battleSkillService.assertAvailableSkill(
        TRAINING_SKILL_CODE,
        tx,
      );
      await this.battleDomainService.assertUserHasNoActiveBattle(
        currentUser.id,
        tx,
      );

      const queue = await tx.battleMatchQueue.findUnique({
        where: { userId: currentUser.id },
        select: {
          status: true,
          skillCode: true,
          professionalTrackKey: true,
          searchStartedAt: true,
          expiresAt: true,
        },
      });

      if (
        queue?.status !== 'SEARCHING' ||
        queue.skillCode !== TRAINING_SKILL_CODE ||
        (queue.professionalTrackKey && queue.professionalTrackKey !== professionalTrackKey) ||
        !queue.searchStartedAt ||
        queue.searchStartedAt > unlockedAt ||
        !queue.expiresAt ||
        queue.expiresAt <= now
      ) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_TRAINING_NOT_AVAILABLE,
        );
      }

      const cancelled = await tx.battleMatchQueue.updateMany({
        where: {
          userId: currentUser.id,
          status: 'SEARCHING',
          skillCode: TRAINING_SKILL_CODE,
          professionalTrackKey,
          searchStartedAt: { lte: unlockedAt },
          expiresAt: { gt: now },
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: now,
          matchedAt: null,
          matchedBattleRoomId: null,
        },
      });

      if (cancelled.count !== 1) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_TRAINING_NOT_AVAILABLE,
        );
      }

      const room = await tx.battleRoom.create({
        data: {
          mode: BattleMode.TRAINING,
          skillCode: TRAINING_SKILL_CODE,
          professionalTrackKey,
          status: BattleRoomStatus.WAITING,
          questionCount: DEFAULT_BATTLE_QUESTION_COUNT,
          durationSeconds: BATTLE_DURATION_SECONDS,
          correctScore: BATTLE_CORRECT_SCORE,
          wrongScore: BATTLE_WRONG_SCORE,
          unansweredScore: BATTLE_UNANSWERED_SCORE,
          createdByUserId: currentUser.id,
        },
        select: { id: true },
      });

      await tx.battleParticipant.create({
        data: {
          battleRoomId: room.id,
          userId: currentUser.id,
          seat: 1,
          status: BattleParticipantStatus.READY,
          result: BattleResult.NONE,
          readyAt: now,
        },
      });

      const timing =
        await this.battleQuestionService.createQuestionSnapshotsAndStartCountdown(
          tx,
          {
            battleId: room.id,
            questionCount: DEFAULT_BATTLE_QUESTION_COUNT,
            durationSeconds: BATTLE_DURATION_SECONDS,
            now,
            skillCode: TRAINING_SKILL_CODE,
            professionalTrackKey,
          },
        );

      return {
        battleId: room.id,
        mode: BattleMode.TRAINING,
        skill: TRAINING_SKILL_CODE,
        professionalTrackKey,
        status: BattleRoomStatus.COUNTDOWN,
        startedAt: timing.startedAt,
        expiresAt: timing.expiresAt,
        serverTime: now,
      } satisfies BattleTrainingStartPayload;
    });

    return {
      success: true as const,
      data,
    };
  }
}
