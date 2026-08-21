import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  BattleEndReason,
  BattleMode,
  BattleParticipantStatus,
  BattleRatingReason,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleRoomService } from './battle-room.service';
import { BattleSettlementService } from './battle-settlement.service';
import { PrismaService } from '../prisma/prisma.service';
import { getProfessionalTrackIdentity } from '../course/course-catalog';
import type { BattleResultPayload } from './battle.types';
import {
  calculateBattleCompetitiveTierChange,
  createBattleCompetitiveTitle,
} from './battle-competitive-tier';
import type {
  BattleCompetitiveStar,
  BattleCompetitiveTierChange,
} from './battle-competitive-tier';
import {
  calculateBattlePerformance,
  calculateBestCombo,
} from './battle-performance';
import {
  calculateBattleAiFinalStats,
  isBattleAiPlanValid,
  parseBattleAiAnswerPlan,
  projectBattleAiProgress,
  resolveBattleAiOutcome,
} from './battle-ai-plan';
import { calculateBattleScore } from './battle-score.service';

function isParticipantSubmitted(participant: {
  status: string;
  submittedAt: Date | null;
}) {
  return (
    participant.submittedAt !== null ||
    participant.status === BattleParticipantStatus.SUBMITTED ||
    participant.status === BattleParticipantStatus.FORFEITED ||
    participant.status === BattleParticipantStatus.COMPLETED
  );
}

@Injectable()
export class BattleResultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleRoomService: BattleRoomService,
    private readonly battleSettlementService: BattleSettlementService,
  ) {}

  async getBattleResult(currentUserId: string, battleId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleRoomService.advanceRoomStateIfNeeded(battleId, now, tx);
      await this.battleSettlementService.normalizeBattleState(
        battleId,
        now,
        tx,
      );

      const room = await tx.battleRoom.findFirst({
        where: {
          id: battleId,
          participants: {
            some: {
              userId: currentUserId,
            },
          },
        },
        select: {
          id: true,
          mode: true,
          skillCode: true,
          professionalTrackKey: true,
          questionCount: true,
          durationSeconds: true,
          correctScore: true,
          wrongScore: true,
          unansweredScore: true,
          status: true,
          startedAt: true,
          expiresAt: true,
          endReason: true,
          completedAt: true,
          skill: {
            select: {
              name: true,
            },
          },
          participants: {
            select: {
              id: true,
              userId: true,
              status: true,
              submittedAt: true,
              forfeitedAt: true,
              result: true,
              score: true,
              correctCount: true,
              wrongCount: true,
              unansweredCount: true,
              ratingBefore: true,
              ratingDelta: true,
              ratingAfter: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  avatarUrl: true,
                },
              },
            },
          },
          questionSnapshots: {
            select: {
              id: true,
              orderIndex: true,
            },
          },
          aiOpponent: {
            select: {
              displayName: true,
              strategyVersion: true,
              answerPlan: true,
              plannedSubmittedOffsetMs: true,
            },
          },
          answers: {
            select: {
              participantId: true,
              battleQuestionSnapshotId: true,
              isCorrect: true,
            },
          },
        },
      });

      if (!room) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      if (
        room.status === BattleRoomStatus.WAITING ||
        room.status === BattleRoomStatus.READY
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_NOT_STARTED);
      }

      const currentParticipant = room.participants.find(
        (participant) => participant.userId === currentUserId,
      );
      const opponentParticipant = room.participants.find(
        (participant) => participant.userId !== currentUserId,
      );

      if (!currentParticipant) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
        );
      }

      if (
        room.status === BattleRoomStatus.COUNTDOWN ||
        room.status === BattleRoomStatus.IN_PROGRESS ||
        room.status === BattleRoomStatus.SETTLING
      ) {
        const myAnsweredCount = room.answers.filter(
          (answer) => answer.participantId === currentParticipant.id,
        ).length;
        const opponentAnsweredCount = opponentParticipant
          ? room.answers.filter(
              (answer) => answer.participantId === opponentParticipant.id,
            ).length
          : null;
        const aiOpponent = this.toPendingAiOpponent(room, now);

        return {
          battleId: room.id,
          mode: room.mode,
          skill: room.skillCode,
          professionalTrackKey: room.professionalTrackKey,
          professionalTrack: getProfessionalTrackIdentity(room.professionalTrackKey),
          status: room.status,
          completed: false,
          totalQuestions: room.questionCount,
          myAnsweredCount,
          opponentAnsweredCount:
            room.mode === BattleMode.AI
              ? (aiOpponent?.answeredCount ?? null)
              : opponentAnsweredCount,
          mySubmitted: isParticipantSubmitted(currentParticipant),
          opponentSubmitted:
            room.mode === BattleMode.AI
              ? (aiOpponent?.submitted ?? null)
              : opponentParticipant
                ? isParticipantSubmitted(opponentParticipant)
                : null,
          opponent:
            room.mode === BattleMode.AI
              ? aiOpponent
              : opponentParticipant
                ? this.toHumanOpponent(opponentParticipant)
                : null,
          serverTime: now,
        } satisfies BattleResultPayload;
      }

      if (!room.completedAt) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
        );
      }

      const currentPerformance = calculateBattlePerformance(
        currentParticipant.correctCount,
        currentParticipant.wrongCount,
        room.questionCount,
      );
      const currentAnswers = room.answers.filter(
        (answer) => answer.participantId === currentParticipant.id,
      );
      const bestCombo = calculateBestCombo(
        room.questionSnapshots,
        currentAnswers,
      );

      if (room.mode === BattleMode.TRAINING) {
        if (
          opponentParticipant ||
          currentParticipant.result !== BattleResult.NONE
        ) {
          throw new ConflictException(
            BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
          );
        }

        return {
          battleId: room.id,
          mode: room.mode,
          skill: room.skillCode,
          professionalTrackKey: room.professionalTrackKey,
          professionalTrack: getProfessionalTrackIdentity(room.professionalTrackKey),
          status: BattleRoomStatus.COMPLETED,
          completed: true,
          result: BattleResult.NONE,
          myScore: currentParticipant.score,
          opponentScore: null,
          myCorrectCount: currentParticipant.correctCount,
          myWrongCount: currentParticipant.wrongCount,
          myUnansweredCount: currentParticipant.unansweredCount,
          answeredCount: currentPerformance.answeredCount,
          accuracy: currentPerformance.accuracy,
          completionRate: currentPerformance.completionRate,
          bestCombo,
          opponentCorrectCount: null,
          opponentWrongCount: null,
          opponentUnansweredCount: null,
          opponentAnsweredCount: null,
          opponentAccuracy: null,
          opponentCompletionRate: null,
          scoreDifference: null,
          ratingBefore: currentParticipant.ratingBefore ?? 0,
          ratingDelta: 0,
          ratingAfter: currentParticipant.ratingAfter ?? 0,
          star: null,
          title: null,
          beforeStar: null,
          afterStar: null,
          tierChange: null,
          opponent: null,
          resultReason: null,
          myCompletionTimeMs: null,
          opponentCompletionTimeMs: null,
          endReason: room.endReason,
          completedAt: room.completedAt,
          serverTime: now,
        } satisfies BattleResultPayload;
      }

      if (room.mode === BattleMode.AI) {
        if (
          opponentParticipant ||
          currentParticipant.result === BattleResult.NONE ||
          !room.aiOpponent
        ) {
          throw new ConflictException(
            BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
          );
        }

        const aiStats = this.getAiFinalStats(room);
        const aiScore = calculateBattleScore({
          correctCount: aiStats.correctCount,
          wrongCount: aiStats.wrongCount,
          unansweredCount: aiStats.unansweredCount,
          questionCount: room.questionCount,
          correctScore: room.correctScore,
          wrongScore: room.wrongScore,
          unansweredScore: room.unansweredScore,
        }).score;
        const myCompletionTimeMs = this.getParticipantCompletionTimeMs(
          room,
          currentParticipant,
        );
        const outcome = resolveBattleAiOutcome({
          userCorrectCount: currentParticipant.correctCount,
          userCompletionTimeMs: myCompletionTimeMs,
          aiCorrectCount: aiStats.correctCount,
          aiCompletionTimeMs: aiStats.completionTimeMs,
          userForfeited: room.endReason === BattleEndReason.USER_FORFEIT,
        });

        if (outcome.userResult !== currentParticipant.result) {
          throw new ConflictException(
            BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
          );
        }

        const aiPerformance = calculateBattlePerformance(
          aiStats.correctCount,
          aiStats.wrongCount,
          room.questionCount,
        );

        return {
          battleId: room.id,
          mode: room.mode,
          skill: room.skillCode,
          professionalTrackKey: room.professionalTrackKey,
          professionalTrack: getProfessionalTrackIdentity(room.professionalTrackKey),
          status: BattleRoomStatus.COMPLETED,
          completed: true,
          result: currentParticipant.result,
          myScore: currentParticipant.score,
          opponentScore: aiScore,
          myCorrectCount: currentParticipant.correctCount,
          myWrongCount: currentParticipant.wrongCount,
          myUnansweredCount: currentParticipant.unansweredCount,
          answeredCount: currentPerformance.answeredCount,
          accuracy: currentPerformance.accuracy,
          completionRate: currentPerformance.completionRate,
          bestCombo,
          opponentCorrectCount: aiStats.correctCount,
          opponentWrongCount: aiStats.wrongCount,
          opponentUnansweredCount: aiStats.unansweredCount,
          opponentAnsweredCount: aiStats.answeredCount,
          opponentAccuracy: aiPerformance.accuracy,
          opponentCompletionRate: aiPerformance.completionRate,
          scoreDifference: currentParticipant.score - aiScore,
          ratingBefore: 0,
          ratingDelta: 0,
          ratingAfter: 0,
          star: null,
          title: null,
          beforeStar: null,
          afterStar: null,
          tierChange: null,
          opponent: {
            type: 'AI',
            displayName: room.aiOpponent.displayName,
            ...aiStats,
            score: aiScore,
          },
          resultReason: outcome.reason,
          myCompletionTimeMs,
          opponentCompletionTimeMs: aiStats.completionTimeMs,
          endReason: room.endReason,
          completedAt: room.completedAt,
          serverTime: now,
        } satisfies BattleResultPayload;
      }

      if (
        !opponentParticipant ||
        currentParticipant.result === BattleResult.NONE ||
        opponentParticipant.result === BattleResult.NONE
      ) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
        );
      }

      const opponentPerformance = calculateBattlePerformance(
        opponentParticipant.correctCount,
        opponentParticipant.wrongCount,
        room.questionCount,
      );
      let star: BattleCompetitiveStar | null = null;
      let title: string | null = null;
      let beforeStar: BattleCompetitiveStar | null = null;
      let afterStar: BattleCompetitiveStar | null = null;
      let tierChange: BattleCompetitiveTierChange | null = null;

      if (room.mode === BattleMode.RANKED && (room.professionalTrackKey || room.skillCode)) {
        const usesTrackRating = Boolean(room.professionalTrackKey);
        const ratingLogs = await tx.battleRatingLog.findMany({
          where: {
            userId: currentUserId,
            ...(usesTrackRating
              ? { professionalTrackKey: room.professionalTrackKey }
              : { skillCode: room.skillCode }),
            reason: BattleRatingReason.BATTLE_RESULT,
          },
          select: {
            id: true,
            userId: true,
            battleRoomId: true,
            skillCode: true,
            professionalTrackKey: true,
            createdAt: true,
          },
        });
        const orderedRatingLogs = ratingLogs
          .filter(
            (log) =>
              log.userId === currentUserId &&
              (usesTrackRating
                ? log.professionalTrackKey === room.professionalTrackKey
                : log.skillCode === room.skillCode),
          )
          .sort(
            (left, right) =>
              left.createdAt.getTime() - right.createdAt.getTime() ||
              left.id.localeCompare(right.id),
          );
        const currentLogIndex = orderedRatingLogs.findIndex(
          (log) => log.battleRoomId === room.id,
        );

        if (currentLogIndex < 0 || !room.skill) {
          throw new ConflictException(
            BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
          );
        }

        const competitiveChange = calculateBattleCompetitiveTierChange(
          currentParticipant.ratingBefore ?? 0,
          currentParticipant.ratingAfter ?? 0,
          currentLogIndex === 0,
        );
        star = competitiveChange.afterStar;
        title = createBattleCompetitiveTitle(
          getProfessionalTrackIdentity(room.professionalTrackKey)?.shortName ??
            room.skill.name,
          star,
        );
        beforeStar = competitiveChange.beforeStar;
        afterStar = competitiveChange.afterStar;
        tierChange = competitiveChange.change;
      }

      return {
        battleId: room.id,
        mode: room.mode,
        skill: room.skillCode,
        professionalTrackKey: room.professionalTrackKey,
        professionalTrack: getProfessionalTrackIdentity(room.professionalTrackKey),
        status: BattleRoomStatus.COMPLETED,
        completed: true,
        result: currentParticipant.result,
        myScore: currentParticipant.score,
        opponentScore: opponentParticipant.score,
        myCorrectCount: currentParticipant.correctCount,
        myWrongCount: currentParticipant.wrongCount,
        myUnansweredCount: currentParticipant.unansweredCount,
        answeredCount: currentPerformance.answeredCount,
        accuracy: currentPerformance.accuracy,
        completionRate: currentPerformance.completionRate,
        bestCombo,
        opponentCorrectCount: opponentParticipant.correctCount,
        opponentWrongCount: opponentParticipant.wrongCount,
        opponentUnansweredCount: opponentParticipant.unansweredCount,
        opponentAnsweredCount: opponentPerformance.answeredCount,
        opponentAccuracy: opponentPerformance.accuracy,
        opponentCompletionRate: opponentPerformance.completionRate,
        scoreDifference: currentParticipant.score - opponentParticipant.score,
        ratingBefore: currentParticipant.ratingBefore ?? 0,
        ratingDelta: currentParticipant.ratingDelta,
        ratingAfter: currentParticipant.ratingAfter ?? 0,
        star,
        title,
        beforeStar,
        afterStar,
        tierChange,
        opponent: {
          type: 'HUMAN',
          userId: opponentParticipant.user.id,
          nickname: opponentParticipant.user.nickname,
          avatarUrl: opponentParticipant.user.avatarUrl,
        },
        resultReason: null,
        myCompletionTimeMs: null,
        opponentCompletionTimeMs: null,
        endReason: room.endReason,
        completedAt: room.completedAt,
        serverTime: now,
      } satisfies BattleResultPayload;
    });

    return {
      success: true as const,
      data,
    };
  }

  private toHumanOpponent(participant: {
    user: { id: string; nickname: string | null; avatarUrl: string | null };
  }) {
    return {
      type: 'HUMAN' as const,
      userId: participant.user.id,
      nickname: participant.user.nickname,
      avatarUrl: participant.user.avatarUrl,
    };
  }

  private toPendingAiOpponent(
    room: {
      mode: BattleMode;
      startedAt: Date | null;
      aiOpponent: {
        displayName: string;
        answerPlan: unknown;
        plannedSubmittedOffsetMs: number;
      } | null;
    },
    serverTime: Date,
  ) {
    if (room.mode !== BattleMode.AI) {
      return null;
    }

    if (!room.aiOpponent) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID);
    }

    const answerPlan = parseBattleAiAnswerPlan(room.aiOpponent.answerPlan);

    if (!answerPlan) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID);
    }

    const progress = projectBattleAiProgress({
      startedAt: room.startedAt,
      serverTime,
      answerPlan,
      plannedSubmittedOffsetMs: room.aiOpponent.plannedSubmittedOffsetMs,
    });

    return {
      type: 'AI' as const,
      displayName: room.aiOpponent.displayName,
      answeredCount: progress.answeredCount,
      submitted: progress.submitted,
    };
  }

  private getAiFinalStats(room: {
    durationSeconds: number;
    questionCount: number;
    questionSnapshots: Array<{ id: string; orderIndex: number }>;
    aiOpponent: {
      strategyVersion: string;
      answerPlan: unknown;
      plannedSubmittedOffsetMs: number;
    } | null;
  }) {
    if (
      !room.aiOpponent ||
      room.questionSnapshots.length !== room.questionCount ||
      !isBattleAiPlanValid({
        value: room.aiOpponent.answerPlan,
        strategyVersion: room.aiOpponent.strategyVersion,
        plannedSubmittedOffsetMs: room.aiOpponent.plannedSubmittedOffsetMs,
        durationSeconds: room.durationSeconds,
        snapshots: room.questionSnapshots,
      })
    ) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID);
    }

    const answerPlan = parseBattleAiAnswerPlan(room.aiOpponent.answerPlan);

    if (!answerPlan) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID);
    }

    return calculateBattleAiFinalStats({
      answerPlan,
      plannedSubmittedOffsetMs: room.aiOpponent.plannedSubmittedOffsetMs,
      durationSeconds: room.durationSeconds,
    });
  }

  private getParticipantCompletionTimeMs(
    room: { startedAt: Date | null; expiresAt: Date | null },
    participant: {
      submittedAt: Date | null;
      forfeitedAt: Date | null;
      status: string;
    },
  ) {
    if (!room.startedAt) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    const completedAt = participant.forfeitedAt ?? participant.submittedAt;

    if (!completedAt) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    return Math.max(
      0,
      Math.min(
        completedAt.getTime(),
        room.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER,
      ) - room.startedAt.getTime(),
    );
  }
}
