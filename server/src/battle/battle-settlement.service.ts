import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  BattleEndReason,
  BattleMode,
  BattleParticipantStatus,
  BattleRatingReason,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BATTLE_SETTLEMENT_STALE_SECONDS } from './battle.constants';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleDomainService } from './battle-domain.service';
import { BattleRatingService } from './battle-rating.service';
import { BattleScoreService } from './battle-score.service';
import { PrismaService } from '../prisma/prisma.service';
import type { BattleTransactionClient } from './battle.types';

type BattleClient = PrismaService | BattleTransactionClient;

type RoomRecord = {
  id: string;
  mode: BattleMode;
  status: BattleRoomStatus;
  questionCount: number;
  correctScore: number;
  wrongScore: number;
  unansweredScore: number;
  startedAt: Date | null;
  expiresAt: Date | null;
  settledAt: Date | null;
  completedAt: Date | null;
  endReason: BattleEndReason | null;
  updatedAt: Date;
  winnerUserId: string | null;
  participants: ParticipantRecord[];
};

type ParticipantRecord = {
  id: string;
  userId: string;
  status: BattleParticipantStatus;
  result: BattleResult;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  ratingBefore: number | null;
  ratingDelta: number;
  ratingAfter: number | null;
  submittedAt: Date | null;
  forfeitedAt: Date | null;
  completedAt: Date | null;
};

type AnswerAggregateRecord = {
  participantId: string;
  isCorrect: boolean;
};

type SettledParticipant = {
  id: string;
  userId: string;
  status: BattleParticipantStatus;
  result: BattleResult;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  ratingBefore: number;
  ratingDelta: number;
  ratingAfter: number;
  submittedAt: Date | null;
  forfeitedAt: Date | null;
};

@Injectable()
export class BattleSettlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleScoreService: BattleScoreService,
    private readonly battleRatingService: BattleRatingService,
    private readonly battleDomainService: BattleDomainService,
  ) {}

  async normalizeBattleState(
    battleId: string,
    now: Date,
    client?: BattleClient,
  ) {
    if (client) {
      return this.normalizeBattleStateWithClient(battleId, now, client);
    }

    return this.prisma.$transaction((tx) =>
      this.normalizeBattleStateWithClient(battleId, now, tx),
    );
  }

  async assertParticipantBattle(
    battleId: string,
    currentUserId: string,
    client?: BattleClient,
  ) {
    const prisma = client ?? this.prisma;
    const room = await prisma.battleRoom.findFirst({
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
        status: true,
        participants: {
          select: {
            id: true,
            userId: true,
            status: true,
            result: true,
            score: true,
            correctCount: true,
            wrongCount: true,
            unansweredCount: true,
            ratingBefore: true,
            ratingDelta: true,
            ratingAfter: true,
            submittedAt: true,
            forfeitedAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!room) {
      throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
    }

    const participant = room.participants.find(
      (item) => item.userId === currentUserId,
    );

    if (!participant) {
      throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
    }

    return {
      room,
      participant,
    };
  }

  private async normalizeBattleStateWithClient(
    battleId: string,
    now: Date,
    prisma: BattleClient,
  ) {
    const room = await this.loadRoom(battleId, prisma);

    if (!room) {
      return null;
    }

    if (
      room.status === BattleRoomStatus.COMPLETED ||
      room.status === BattleRoomStatus.CANCELLED ||
      room.status === BattleRoomStatus.EXPIRED
    ) {
      return room;
    }

    if (this.isTimeoutCandidate(room, now)) {
      const openStatuses: BattleParticipantStatus[] = [
        BattleParticipantStatus.JOINED,
        BattleParticipantStatus.READY,
        BattleParticipantStatus.PLAYING,
      ];

      await prisma.battleParticipant.updateMany({
        where: {
          battleRoomId: battleId,
          status: {
            in: openStatuses,
          },
        },
        data: {
          status: BattleParticipantStatus.SUBMITTED,
          submittedAt: room.expiresAt ?? now,
        },
      });
    }

    const latestRoom = await this.loadRoom(battleId, prisma);

    if (!latestRoom) {
      return null;
    }

    if (!this.shouldSettle(latestRoom, now)) {
      return latestRoom;
    }

    return this.claimAndSettle(latestRoom, now, prisma);
  }

  private async claimAndSettle(
    room: RoomRecord,
    now: Date,
    prisma: BattleClient,
  ) {
    const claimed =
      room.status === BattleRoomStatus.SETTLING
        ? await prisma.battleRoom.updateMany({
            where: {
              id: room.id,
              status: BattleRoomStatus.SETTLING,
              updatedAt: {
                lte: this.getSettlementStaleCutoff(now),
              },
            },
            data: {
              updatedAt: now,
            },
          })
        : await prisma.battleRoom.updateMany({
            where: {
              id: room.id,
              status: {
                in: [BattleRoomStatus.COUNTDOWN, BattleRoomStatus.IN_PROGRESS],
              },
            },
            data: {
              status: BattleRoomStatus.SETTLING,
              updatedAt: now,
            },
          });

    if (claimed.count !== 1) {
      return this.loadRoom(room.id, prisma);
    }

    return this.finalizeSettlement(room.id, now, prisma);
  }

  private async finalizeSettlement(
    battleId: string,
    now: Date,
    prisma: BattleClient,
  ) {
    const room = await this.loadRoom(battleId, prisma);

    if (!room) {
      throw new InternalServerErrorException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    if (room.status === BattleRoomStatus.COMPLETED) {
      return room;
    }

    if (room.participants.length !== 2) {
      throw new InternalServerErrorException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    const answers = (await prisma.battleAnswer.findMany({
      where: {
        battleRoomId: battleId,
      },
      select: {
        participantId: true,
        isCorrect: true,
      },
    })) as AnswerAggregateRecord[];

    const participants = room.participants.map((participant) =>
      this.buildParticipantSettlement(participant, room, answers),
    );
    const [leftParticipant, rightParticipant] = participants;

    const winner = this.resolveWinner(room, leftParticipant, rightParticipant);
    const ratingSnapshots = await Promise.all(
      participants.map((participant) =>
        this.battleDomainService.ensureBattleProfile(participant.userId, prisma),
      ),
    );

    const ratingResults =
      room.mode === BattleMode.RANKED
        ? this.calculateRankedRatings(
            participants,
            ratingSnapshots.map((item) => item.rating),
          )
        : this.calculateFriendRatings(ratingSnapshots.map((item) => item.rating));

    for (const [index, participant] of participants.entries()) {
      const ratingResult = ratingResults[index];

      await prisma.battleParticipant.update({
        where: {
          id: participant.id,
        },
        data: {
          status: BattleParticipantStatus.COMPLETED,
          result: participant.result,
          score: participant.score,
          correctCount: participant.correctCount,
          wrongCount: participant.wrongCount,
          unansweredCount: participant.unansweredCount,
          ratingBefore: ratingResult.ratingBefore,
          ratingDelta: ratingResult.ratingDelta,
          ratingAfter: ratingResult.ratingAfter,
          completedAt: now,
        },
      });
    }

    for (const [index, participant] of participants.entries()) {
      const ratingResult = ratingResults[index];
      const existingProfile = ratingSnapshots[index];

      await prisma.battleProfile.update({
        where: {
          userId: participant.userId,
        },
        data: {
          totalBattles: {
            increment: 1,
          },
          rankedBattles:
            room.mode === BattleMode.RANKED
              ? {
                  increment: 1,
                }
              : undefined,
          friendBattles:
            room.mode === BattleMode.FRIEND
              ? {
                  increment: 1,
                }
              : undefined,
          wins:
            participant.result === BattleResult.WIN
              ? {
                  increment: 1,
                }
              : undefined,
          losses:
            participant.result === BattleResult.LOSS
              ? {
                  increment: 1,
                }
              : undefined,
          draws:
            participant.result === BattleResult.DRAW
              ? {
                  increment: 1,
                }
              : undefined,
          currentWinStreak:
            participant.result === BattleResult.WIN
              ? {
                  increment: 1,
                }
              : 0,
          bestWinStreak:
            participant.result === BattleResult.WIN
              ? Math.max(
                  existingProfile.bestWinStreak,
                  existingProfile.currentWinStreak + 1,
                )
              : existingProfile.bestWinStreak,
          rating:
            room.mode === BattleMode.RANKED
              ? ratingResult.ratingAfter
              : existingProfile.rating,
          highestRating:
            room.mode === BattleMode.RANKED
              ? Math.max(
                  existingProfile.highestRating,
                  ratingResult.ratingAfter,
                )
              : existingProfile.highestRating,
        },
      });

      if (room.mode === BattleMode.RANKED) {
        await prisma.battleRatingLog.create({
          data: {
            userId: participant.userId,
            battleRoomId: battleId,
            participantId: participant.id,
            reason: BattleRatingReason.BATTLE_RESULT,
            ratingBefore: ratingResult.ratingBefore,
            ratingDelta: ratingResult.ratingDelta,
            ratingAfter: ratingResult.ratingAfter,
          },
        });
      }
    }

    await prisma.battleRoom.update({
      where: {
        id: battleId,
      },
      data: {
        status: BattleRoomStatus.COMPLETED,
        winnerUserId: winner.userId,
        settledAt: now,
        completedAt: now,
        endReason: winner.endReason,
      },
    });

    return this.loadRoom(battleId, prisma);
  }

  private buildParticipantSettlement(
    participant: ParticipantRecord,
    room: RoomRecord,
    answers: AnswerAggregateRecord[],
  ): SettledParticipant {
    const myAnswers = answers.filter(
      (answer) => answer.participantId === participant.id,
    );
    const correctCount = myAnswers.filter((answer) => answer.isCorrect).length;
    const wrongCount = myAnswers.filter((answer) => !answer.isCorrect).length;
    const answeredCount = correctCount + wrongCount;

    if (answeredCount > room.questionCount) {
      throw new InternalServerErrorException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    const unansweredCount = room.questionCount - answeredCount;
    const scoreSummary = this.battleScoreService.calculateBattleScore({
      correctCount,
      wrongCount,
      unansweredCount,
      questionCount: room.questionCount,
      correctScore: room.correctScore,
      wrongScore: room.wrongScore,
      unansweredScore: room.unansweredScore,
    });

    return {
      id: participant.id,
      userId: participant.userId,
      status: participant.status,
      result: participant.result,
      score: scoreSummary.score,
      correctCount,
      wrongCount,
      unansweredCount,
      ratingBefore: participant.ratingBefore ?? 0,
      ratingDelta: participant.ratingDelta,
      ratingAfter: participant.ratingAfter ?? 0,
      submittedAt: participant.submittedAt,
      forfeitedAt: participant.forfeitedAt,
    };
  }

  private resolveWinner(
    room: RoomRecord,
    leftParticipant: SettledParticipant,
    rightParticipant: SettledParticipant,
  ) {
    const forfeitedParticipants = [leftParticipant, rightParticipant].filter(
      (participant) => participant.status === BattleParticipantStatus.FORFEITED,
    );

    if (forfeitedParticipants.length > 0) {
      const loser = this.resolveForfeitLoser(forfeitedParticipants);
      const winner =
        loser.id === leftParticipant.id ? rightParticipant : leftParticipant;

      leftParticipant.result =
        loser.id === leftParticipant.id
          ? BattleResult.LOSS
          : BattleResult.WIN;
      rightParticipant.result =
        loser.id === rightParticipant.id
          ? BattleResult.LOSS
          : BattleResult.WIN;

      return {
        userId: winner.userId,
        endReason: BattleEndReason.USER_FORFEIT,
      };
    }

    if (leftParticipant.score > rightParticipant.score) {
      leftParticipant.result = BattleResult.WIN;
      rightParticipant.result = BattleResult.LOSS;

      return {
        userId: leftParticipant.userId,
        endReason: this.isTimeoutSettlement(room)
          ? BattleEndReason.EXPIRED
          : BattleEndReason.NORMAL,
      };
    }

    if (leftParticipant.score < rightParticipant.score) {
      leftParticipant.result = BattleResult.LOSS;
      rightParticipant.result = BattleResult.WIN;

      return {
        userId: rightParticipant.userId,
        endReason: this.isTimeoutSettlement(room)
          ? BattleEndReason.EXPIRED
          : BattleEndReason.NORMAL,
      };
    }

    leftParticipant.result = BattleResult.DRAW;
    rightParticipant.result = BattleResult.DRAW;

    return {
      userId: null,
      endReason: this.isTimeoutSettlement(room)
        ? BattleEndReason.EXPIRED
        : BattleEndReason.NORMAL,
    };
  }

  private calculateRankedRatings(
    participants: SettledParticipant[],
    ratings: number[],
  ) {
    const [leftParticipant, rightParticipant] = participants;
    const [leftRating, rightRating] = ratings;

    const left = this.battleRatingService.calculateWithDefaultKFactor({
      playerRating: leftRating,
      opponentRating: rightRating,
      result: this.assertResolvedResult(leftParticipant.result),
    });
    const right = this.battleRatingService.calculateWithDefaultKFactor({
      playerRating: rightRating,
      opponentRating: leftRating,
      result: this.assertResolvedResult(rightParticipant.result),
    });

    leftParticipant.ratingBefore = left.ratingBefore;
    leftParticipant.ratingDelta = left.ratingDelta;
    leftParticipant.ratingAfter = left.ratingAfter;

    rightParticipant.ratingBefore = right.ratingBefore;
    rightParticipant.ratingDelta = right.ratingDelta;
    rightParticipant.ratingAfter = right.ratingAfter;

    return [left, right];
  }

  private calculateFriendRatings(ratings: number[]) {
    return ratings.map((rating) =>
      this.battleRatingService.createNoRatingChange(rating),
    );
  }

  private resolveForfeitLoser(participants: SettledParticipant[]) {
    return [...participants].sort((left, right) => {
      const leftAt = left.forfeitedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightAt = right.forfeitedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

      if (leftAt !== rightAt) {
        return leftAt - rightAt;
      }

      return left.id.localeCompare(right.id);
    })[0]!;
  }

  private shouldSettle(room: RoomRecord, now: Date) {
    if (room.status === BattleRoomStatus.SETTLING) {
      return this.isStaleSettling(room, now);
    }

    if (
      room.status !== BattleRoomStatus.COUNTDOWN &&
      room.status !== BattleRoomStatus.IN_PROGRESS
    ) {
      return false;
    }

    if (this.isTimeoutCandidate(room, now)) {
      return true;
    }

    if (
      room.participants.some(
        (participant) => participant.status === BattleParticipantStatus.FORFEITED,
      )
    ) {
      return true;
    }

    return room.participants.every((participant) =>
      (
        [
          BattleParticipantStatus.SUBMITTED,
          BattleParticipantStatus.FORFEITED,
          BattleParticipantStatus.COMPLETED,
        ] as BattleParticipantStatus[]
      ).includes(participant.status),
    );
  }

  private isTimeoutCandidate(room: RoomRecord, now: Date) {
    return (
      Boolean(room.expiresAt) &&
      now.getTime() >= room.expiresAt!.getTime() &&
      (room.status === BattleRoomStatus.COUNTDOWN ||
        room.status === BattleRoomStatus.IN_PROGRESS)
    );
  }

  private isTimeoutSettlement(room: RoomRecord) {
    if (!room.expiresAt) {
      return false;
    }

    return room.participants.some(
      (participant) =>
        participant.submittedAt?.getTime() === room.expiresAt!.getTime(),
    );
  }

  private isStaleSettling(room: RoomRecord, now: Date) {
    return room.updatedAt.getTime() <= this.getSettlementStaleCutoff(now).getTime();
  }

  private getSettlementStaleCutoff(now: Date) {
    return new Date(now.getTime() - BATTLE_SETTLEMENT_STALE_SECONDS * 1000);
  }

  private async loadRoom(battleId: string, prisma: BattleClient) {
    return prisma.battleRoom.findUnique({
      where: { id: battleId },
      select: {
        id: true,
        mode: true,
        status: true,
        questionCount: true,
        correctScore: true,
        wrongScore: true,
        unansweredScore: true,
        startedAt: true,
        expiresAt: true,
        settledAt: true,
        completedAt: true,
        endReason: true,
        updatedAt: true,
        winnerUserId: true,
        participants: {
          select: {
            id: true,
            userId: true,
            status: true,
            result: true,
            score: true,
            correctCount: true,
            wrongCount: true,
            unansweredCount: true,
            ratingBefore: true,
            ratingDelta: true,
            ratingAfter: true,
            submittedAt: true,
            forfeitedAt: true,
            completedAt: true,
          },
        },
      },
    }) as Promise<RoomRecord | null>;
  }

  private assertResolvedResult(result: BattleResult) {
    if (result === BattleResult.NONE) {
      throw new InternalServerErrorException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    return result;
  }
}
