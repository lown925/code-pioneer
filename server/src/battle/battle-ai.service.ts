import { ConflictException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
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
import type {
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
      await this.battleSkillService.assertAvailableSkill(skillCode, tx);
      await this.battleDomainService.assertUserHasNoActiveBattle(
        currentUser.id,
        tx,
      );

      const room = await tx.battleRoom.create({
        data: {
          mode: BattleMode.AI,
          skillCode,
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
          status: BattleParticipantStatus.JOINED,
          result: BattleResult.NONE,
        },
      });

      const snapshots =
        await this.battleQuestionService.createQuestionSnapshots(tx, {
          battleId: room.id,
          questionCount: DEFAULT_BATTLE_QUESTION_COUNT,
          durationSeconds: BATTLE_DURATION_SECONDS,
          now,
          skillCode,
        });
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
    });

    return {
      success: true as const,
      data,
    };
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
}
