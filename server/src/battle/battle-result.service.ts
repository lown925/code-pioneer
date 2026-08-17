import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
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
          questionCount: true,
          status: true,
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

        return {
          battleId: room.id,
          mode: room.mode,
          skill: room.skillCode,
          status: room.status,
          completed: false,
          totalQuestions: room.questionCount,
          myAnsweredCount,
          opponentAnsweredCount,
          mySubmitted: isParticipantSubmitted(currentParticipant),
          opponentSubmitted: opponentParticipant
            ? isParticipantSubmitted(opponentParticipant)
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

      if (room.mode === BattleMode.RANKED && room.skillCode) {
        const ratingLogs = await tx.battleRatingLog.findMany({
          where: {
            userId: currentUserId,
            skillCode: room.skillCode,
            reason: BattleRatingReason.BATTLE_RESULT,
          },
          select: {
            id: true,
            userId: true,
            battleRoomId: true,
            skillCode: true,
            createdAt: true,
          },
        });
        const orderedRatingLogs = ratingLogs
          .filter(
            (log) =>
              log.userId === currentUserId && log.skillCode === room.skillCode,
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
        title = createBattleCompetitiveTitle(room.skill.name, star);
        beforeStar = competitiveChange.beforeStar;
        afterStar = competitiveChange.afterStar;
        tierChange = competitiveChange.change;
      }

      return {
        battleId: room.id,
        mode: room.mode,
        skill: room.skillCode,
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
          userId: opponentParticipant.user.id,
          nickname: opponentParticipant.user.nickname,
          avatarUrl: opponentParticipant.user.avatarUrl,
        },
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
}
