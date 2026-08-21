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
import {
  calculateBattleAiFinalStats,
  isBattleAiPlanValid,
  parseBattleAiAnswerPlan,
  resolveBattleAiOutcome,
} from './battle-ai-plan';
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
  skillCode: string | null;
  professionalTrackKey: string | null;
  status: BattleRoomStatus;
  questionCount: number;
  durationSeconds: number;
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
  questionSnapshots: Array<{ id: string; orderIndex: number }>;
  aiOpponent: {
    displayName: string;
    strategyVersion: string;
    answerPlan: unknown;
    plannedSubmittedOffsetMs: number;
  } | null;
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

    if (room.mode === BattleMode.AI) {
      if (this.isTimeoutCandidate(room, now)) {
        await this.submitOpenParticipantsAtDeadline(room, prisma);
      }

      const latestAiRoom = await this.loadRoom(battleId, prisma);

      if (!latestAiRoom || !this.shouldAttemptAiSettlement(latestAiRoom, now)) {
        return latestAiRoom;
      }

      return this.claimAndSettle(latestAiRoom, now, prisma);
    }

    if (this.isTimeoutCandidate(room, now)) {
      await this.submitOpenParticipantsAtDeadline(room, prisma);
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

    const expectedParticipantCount =
      room.mode === BattleMode.TRAINING || room.mode === BattleMode.AI ? 1 : 2;

    if (room.participants.length !== expectedParticipantCount) {
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

    if (room.mode === BattleMode.TRAINING) {
      return this.finalizeTrainingSettlement(room, answers, now, prisma);
    }

    if (room.mode === BattleMode.AI) {
      return this.finalizeAiSettlement(room, answers, now, prisma);
    }

    const participants = room.participants.map((participant) =>
      this.buildParticipantSettlement(participant, room, answers),
    );
    const [leftParticipant, rightParticipant] = participants;

    const winner = this.resolveWinner(room, leftParticipant, rightParticipant);
    const usesTrackRating =
      room.mode === BattleMode.RANKED && Boolean(room.professionalTrackKey);
    const usesSkillRating =
      room.mode === BattleMode.RANKED && Boolean(room.skillCode);
    const profileSnapshots = await Promise.all(
      participants.map((participant) =>
        this.battleDomainService.ensureBattleProfile(
          participant.userId,
          prisma,
        ),
      ),
    );
    const skillRatingSnapshots = usesSkillRating && !usesTrackRating
      ? await Promise.all(
          participants.map((participant) =>
            prisma.userBattleSkillRating.upsert({
              where: {
                userId_skillCode: {
                  userId: participant.userId,
                  skillCode: room.skillCode!,
                },
              },
              update: {},
              create: {
                userId: participant.userId,
                skillCode: room.skillCode!,
              },
            }),
          ),
        )
      : null;
    const trackRatingSnapshots = usesTrackRating
      ? await Promise.all(
          participants.map((participant) =>
            prisma.userBattleTrackRating.upsert({
              where: {
                userId_trackKey: {
                  userId: participant.userId,
                  trackKey: room.professionalTrackKey!,
                },
              },
              update: {},
              create: {
                userId: participant.userId,
                trackKey: room.professionalTrackKey!,
              },
            }),
          ),
        )
      : null;
    const ratingSnapshots = trackRatingSnapshots ?? skillRatingSnapshots ?? profileSnapshots;

    if (!ratingSnapshots) {
      throw new InternalServerErrorException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    const ratingResults = this.calculateRatingsForRoom(
      room,
      participants,
      ratingSnapshots.map((item) => item.rating),
    );

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
      const existingRating = ratingSnapshots[index];

      if (usesTrackRating) {
        await prisma.userBattleTrackRating.update({
          where: {
            userId_trackKey: {
              userId: participant.userId,
              trackKey: room.professionalTrackKey!,
            },
          },
          data: this.createSkillRatingUpdate(
            participant,
            existingRating,
            ratingResult.ratingAfter,
          ),
        });
      } else if (usesSkillRating) {
        await prisma.userBattleSkillRating.update({
          where: {
            userId_skillCode: {
              userId: participant.userId,
              skillCode: room.skillCode!,
            },
          },
          data: this.createSkillRatingUpdate(
            participant,
            existingRating,
            ratingResult.ratingAfter,
          ),
        });
      }

      await prisma.battleProfile.update({
        where: {
          userId: participant.userId,
        },
        data: usesSkillRating || usesTrackRating
          ? this.createBattleProfileAggregateUpdate(
              room,
              participant,
              profileSnapshots[index],
            )
          : this.createLegacyProfileUpdate(
              room,
              participant,
              profileSnapshots[index],
              ratingResult.ratingAfter,
            ),
      });

      if (room.mode === BattleMode.RANKED) {
        await prisma.battleRatingLog.create({
          data: {
            userId: participant.userId,
            battleRoomId: battleId,
            participantId: participant.id,
            skillCode: room.skillCode,
            professionalTrackKey: room.professionalTrackKey,
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

  private async finalizeTrainingSettlement(
    room: RoomRecord,
    answers: AnswerAggregateRecord[],
    now: Date,
    prisma: BattleClient,
  ) {
    const participant = this.buildParticipantSettlement(
      room.participants[0]!,
      room,
      answers,
    );
    const profile = await this.battleDomainService.ensureBattleProfile(
      participant.userId,
      prisma,
    );

    await prisma.battleParticipant.update({
      where: { id: participant.id },
      data: {
        status: BattleParticipantStatus.COMPLETED,
        result: BattleResult.NONE,
        score: participant.score,
        correctCount: participant.correctCount,
        wrongCount: participant.wrongCount,
        unansweredCount: participant.unansweredCount,
        ratingBefore: profile.rating,
        ratingDelta: 0,
        ratingAfter: profile.rating,
        completedAt: now,
      },
    });

    await prisma.battleProfile.update({
      where: { userId: participant.userId },
      data: {
        totalBattles: { increment: 1 },
        trainingBattles: { increment: 1 },
      },
    });

    await prisma.battleRoom.update({
      where: { id: room.id },
      data: {
        status: BattleRoomStatus.COMPLETED,
        winnerUserId: null,
        settledAt: now,
        completedAt: now,
        endReason: this.isTimeoutSettlement(room)
          ? BattleEndReason.EXPIRED
          : BattleEndReason.NORMAL,
      },
    });

    return this.loadRoom(room.id, prisma);
  }

  private async finalizeAiSettlement(
    room: RoomRecord,
    answers: AnswerAggregateRecord[],
    now: Date,
    prisma: BattleClient,
  ) {
    const participant = this.buildParticipantSettlement(
      room.participants[0]!,
      room,
      answers,
    );
    const aiStats = this.getAiFinalStats(room);
    const userCompletionTimeMs = this.getParticipantCompletionTimeMs(
      room,
      participant,
    );
    const outcome = resolveBattleAiOutcome({
      userCorrectCount: participant.correctCount,
      userCompletionTimeMs,
      aiCorrectCount: aiStats.correctCount,
      aiCompletionTimeMs: aiStats.completionTimeMs,
      userForfeited: participant.status === BattleParticipantStatus.FORFEITED,
    });

    participant.result = outcome.userResult;
    await this.battleDomainService.ensureBattleProfile(
      participant.userId,
      prisma,
    );

    await prisma.battleParticipant.update({
      where: { id: participant.id },
      data: {
        status: BattleParticipantStatus.COMPLETED,
        result: participant.result,
        score: participant.score,
        correctCount: participant.correctCount,
        wrongCount: participant.wrongCount,
        unansweredCount: participant.unansweredCount,
        ratingBefore: null,
        ratingDelta: 0,
        ratingAfter: null,
        completedAt: now,
      },
    });

    await prisma.battleProfile.update({
      where: { userId: participant.userId },
      data: {
        totalBattles: { increment: 1 },
        wins:
          participant.result === BattleResult.WIN
            ? { increment: 1 }
            : undefined,
        losses:
          participant.result === BattleResult.LOSS
            ? { increment: 1 }
            : undefined,
        draws:
          participant.result === BattleResult.DRAW
            ? { increment: 1 }
            : undefined,
      },
    });

    await prisma.battleRoom.update({
      where: { id: room.id },
      data: {
        status: BattleRoomStatus.COMPLETED,
        winnerUserId:
          participant.result === BattleResult.WIN ? participant.userId : null,
        settledAt: now,
        completedAt: now,
        endReason:
          participant.status === BattleParticipantStatus.FORFEITED
            ? BattleEndReason.USER_FORFEIT
            : this.isTimeoutSettlement(room)
              ? BattleEndReason.EXPIRED
              : BattleEndReason.NORMAL,
      },
    });

    return this.loadRoom(room.id, prisma);
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
        loser.id === leftParticipant.id ? BattleResult.LOSS : BattleResult.WIN;
      rightParticipant.result =
        loser.id === rightParticipant.id ? BattleResult.LOSS : BattleResult.WIN;

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

  private calculateRatingsForRoom(
    room: RoomRecord,
    participants: SettledParticipant[],
    ratings: number[],
  ) {
    if (room.mode === BattleMode.RANKED) {
      return this.calculateRankedRatings(participants, ratings);
    }

    if (room.mode === BattleMode.FRIEND) {
      return this.calculateFriendRatings(ratings);
    }

    throw new InternalServerErrorException(
      BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
    );
  }

  private createSkillRatingUpdate(
    participant: SettledParticipant,
    existingRating: {
      highestRating: number;
      currentWinStreak: number;
      bestWinStreak: number;
    },
    ratingAfter: number,
  ) {
    return {
      rating: ratingAfter,
      highestRating: Math.max(existingRating.highestRating, ratingAfter),
      rankedBattles: { increment: 1 },
      wins:
        participant.result === BattleResult.WIN ? { increment: 1 } : undefined,
      losses:
        participant.result === BattleResult.LOSS ? { increment: 1 } : undefined,
      draws:
        participant.result === BattleResult.DRAW ? { increment: 1 } : undefined,
      currentWinStreak:
        participant.result === BattleResult.WIN ? { increment: 1 } : 0,
      bestWinStreak:
        participant.result === BattleResult.WIN
          ? Math.max(
              existingRating.bestWinStreak,
              existingRating.currentWinStreak + 1,
            )
          : existingRating.bestWinStreak,
    };
  }

  private createLegacyProfileUpdate(
    room: RoomRecord,
    participant: SettledParticipant,
    existingProfile: {
      rating: number;
      highestRating: number;
      currentWinStreak: number;
      bestWinStreak: number;
    },
    ratingAfter: number,
  ) {
    return {
      totalBattles: { increment: 1 },
      rankedBattles:
        room.mode === BattleMode.RANKED ? { increment: 1 } : undefined,
      friendBattles:
        room.mode === BattleMode.FRIEND ? { increment: 1 } : undefined,
      wins:
        participant.result === BattleResult.WIN ? { increment: 1 } : undefined,
      losses:
        participant.result === BattleResult.LOSS ? { increment: 1 } : undefined,
      draws:
        participant.result === BattleResult.DRAW ? { increment: 1 } : undefined,
      currentWinStreak:
        participant.result === BattleResult.WIN ? { increment: 1 } : 0,
      bestWinStreak:
        participant.result === BattleResult.WIN
          ? Math.max(
              existingProfile.bestWinStreak,
              existingProfile.currentWinStreak + 1,
            )
          : existingProfile.bestWinStreak,
      rating:
        room.mode === BattleMode.RANKED ? ratingAfter : existingProfile.rating,
      highestRating:
        room.mode === BattleMode.RANKED
          ? Math.max(existingProfile.highestRating, ratingAfter)
          : existingProfile.highestRating,
    };
  }

  private createBattleProfileAggregateUpdate(
    room: RoomRecord,
    participant: SettledParticipant,
    existingProfile: {
      currentWinStreak: number;
      bestWinStreak: number;
    },
  ) {
    return {
      totalBattles: { increment: 1 },
      rankedBattles:
        room.mode === BattleMode.RANKED ? { increment: 1 } : undefined,
      friendBattles:
        room.mode === BattleMode.FRIEND ? { increment: 1 } : undefined,
      wins:
        participant.result === BattleResult.WIN ? { increment: 1 } : undefined,
      losses:
        participant.result === BattleResult.LOSS ? { increment: 1 } : undefined,
      draws:
        participant.result === BattleResult.DRAW ? { increment: 1 } : undefined,
      currentWinStreak:
        participant.result === BattleResult.WIN ? { increment: 1 } : 0,
      bestWinStreak:
        participant.result === BattleResult.WIN
          ? Math.max(
              existingProfile.bestWinStreak,
              existingProfile.currentWinStreak + 1,
            )
          : existingProfile.bestWinStreak,
    };
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
        (participant) =>
          participant.status === BattleParticipantStatus.FORFEITED,
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

  private shouldAttemptAiSettlement(room: RoomRecord, now: Date) {
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
        (participant) =>
          participant.status === BattleParticipantStatus.FORFEITED,
      )
    ) {
      return true;
    }

    const participant = room.participants[0];

    if (
      !participant ||
      (participant.status !== BattleParticipantStatus.SUBMITTED &&
        participant.status !== BattleParticipantStatus.COMPLETED) ||
      !room.startedAt ||
      !room.aiOpponent
    ) {
      return false;
    }

    return true;
  }

  private async submitOpenParticipantsAtDeadline(
    room: RoomRecord,
    prisma: BattleClient,
  ) {
    const openStatuses: BattleParticipantStatus[] = [
      BattleParticipantStatus.JOINED,
      BattleParticipantStatus.READY,
      BattleParticipantStatus.PLAYING,
    ];

    await prisma.battleParticipant.updateMany({
      where: {
        battleRoomId: room.id,
        status: {
          in: openStatuses,
        },
      },
      data: {
        status: BattleParticipantStatus.SUBMITTED,
        submittedAt: room.expiresAt,
      },
    });
  }

  private getAiFinalStats(room: RoomRecord) {
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
    room: RoomRecord,
    participant: SettledParticipant,
  ) {
    if (!room.startedAt) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    const completedAt =
      participant.status === BattleParticipantStatus.FORFEITED
        ? participant.forfeitedAt
        : participant.submittedAt;

    if (!completedAt) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
      );
    }

    const deadline = room.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return Math.max(
      0,
      Math.min(completedAt.getTime(), deadline) - room.startedAt.getTime(),
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
    return (
      room.updatedAt.getTime() <= this.getSettlementStaleCutoff(now).getTime()
    );
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
        skillCode: true,
        professionalTrackKey: true,
        status: true,
        questionCount: true,
        durationSeconds: true,
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
