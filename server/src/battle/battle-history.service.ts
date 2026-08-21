import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BattleEndReason,
  BattleMode,
  BattleParticipantStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { PrismaService } from '../prisma/prisma.service';
import { getProfessionalTrackIdentity } from '../course/course-catalog';
import type {
  BattleHistoryDetailPayload,
  BattleHistoryPayload,
} from './battle.types';
import type { BattleHistoryQueryDto } from './dto/battle-history-query.dto';
import type {
  BattleAiCompletedOpponentPayload,
  BattleAiResultReason,
  BattleAnswerPayload,
  BattleHistoryQuestionPayload,
  BattleHistorySummaryPayload,
  BattleHistoryOpponentSummaryPayload,
  BattleQuestionOptionSnapshot,
  ContentBlock,
} from './battle.types';
import {
  calculateBattleAiFinalStats,
  isBattleAiPlanValid,
  parseBattleAiAnswerPlan,
  resolveBattleAiOutcome,
} from './battle-ai-plan';
import { calculateBattleScore } from './battle-score.service';

type BattleHistoryParticipantRecord = {
  id: string;
  userId: string;
  seat: number;
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
  user: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
};

type BattleHistorySnapshotRecord = {
  id: string;
  battleRoomId: string;
  sourceQuizQuestionId: string | null;
  orderIndex: number;
  questionType: string;
  presentation: string;
  difficulty: string | null;
  stemSnapshot: unknown;
  optionsSnapshot: unknown;
  correctAnswerSnapshot: unknown;
  explanationSnapshot: unknown;
  acceptedAnswersSnapshot: unknown;
  knowledgeTagsSnapshot: unknown;
  programmingLanguage: string | null;
  courseIdSnapshot: string | null;
  chapterIdSnapshot: string | null;
  sourceQuizQuestion: {
    quiz: {
      chapter: {
        title: string;
        course: { title: string };
      };
    };
  } | null;
};

type BattleHistoryAnswerRecord = {
  battleRoomId: string;
  participantId: string;
  battleQuestionSnapshotId: string;
  answerPayload: unknown;
  submittedAt: Date;
  timeSpentMs: number | null;
  isCorrect: boolean;
  scoreDelta: number;
};

type BattleHistoryRoomRecord = {
  id: string;
  mode: BattleMode;
  skillCode: string | null;
  professionalTrackKey: string | null;
  status: BattleRoomStatus;
  startedAt: Date | null;
  expiresAt: Date | null;
  completedAt: Date | null;
  endReason: BattleEndReason | null;
  durationSeconds: number;
  questionCount: number;
  correctScore: number;
  wrongScore: number;
  unansweredScore: number;
  participants: BattleHistoryParticipantRecord[];
  questionSnapshots: BattleHistorySnapshotRecord[];
  answers: BattleHistoryAnswerRecord[];
  aiOpponent: {
    displayName: string;
    strategyVersion: string;
    answerPlan: unknown;
    plannedSubmittedOffsetMs: number;
  } | null;
};

@Injectable()
export class BattleHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(currentUserId: string, query: BattleHistoryQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const rooms = await this.loadCompletedRooms(currentUserId);

    const items = rooms
      .filter((room) => this.matchesHistoryFilter(room, query, currentUserId))
      .sort((left, right) => this.compareRoomHistory(left, right))
      .map((room) => this.toHistoryListItem(room, currentUserId));

    const total = items.length;
    const start = (page - 1) * pageSize;
    const pagedItems = items.slice(start, start + pageSize);

    return {
      success: true as const,
      data: {
        items: pagedItems,
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        serverTime: new Date(),
      } satisfies BattleHistoryPayload,
    };
  }

  async getHistoryDetail(currentUserId: string, battleId: string) {
    const room = await this.loadRoomForHistory(battleId);

    if (!room) {
      throw new NotFoundException(BATTLE_ERROR_CODES.BATTLE_HISTORY_NOT_FOUND);
    }

    const currentParticipant = room.participants.find(
      (participant) => participant.userId === currentUserId,
    );

    if (!currentParticipant) {
      throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
    }

    if (room.status !== BattleRoomStatus.COMPLETED) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_HISTORY_NOT_COMPLETED,
      );
    }

    if (room.endReason === BattleEndReason.SYSTEM_CANCELLED) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_HISTORY_NOT_COMPLETED,
      );
    }

    const opponentParticipant = room.participants.find(
      (participant) => participant.userId !== currentUserId,
    );
    const isTraining = room.mode === BattleMode.TRAINING;
    const isAi = room.mode === BattleMode.AI;

    if (
      (isTraining &&
        (opponentParticipant ||
          currentParticipant.result !== BattleResult.NONE)) ||
      (isAi &&
        (opponentParticipant ||
          !room.aiOpponent ||
          currentParticipant.result === BattleResult.NONE)) ||
      (!isTraining &&
        !isAi &&
        (!opponentParticipant ||
          currentParticipant.result === BattleResult.NONE ||
          opponentParticipant.result === BattleResult.NONE))
    ) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_HISTORY_NOT_COMPLETED,
      );
    }

    const answersBySnapshotId = new Map(
      room.answers
        .filter((answer) => answer.participantId === currentParticipant.id)
        .sort((left, right) => {
          const diff = right.submittedAt.getTime() - left.submittedAt.getTime();

          if (diff !== 0) {
            return diff;
          }

          return right.battleQuestionSnapshotId.localeCompare(
            left.battleQuestionSnapshotId,
          );
        })
        .map((answer) => [answer.battleQuestionSnapshotId, answer] as const),
    );

    const questions = [...room.questionSnapshots]
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map((snapshot) =>
        this.toHistoryQuestion(room, snapshot, answersBySnapshotId),
      );
    const aiProjection = isAi ? this.toCompletedAiOpponent(room) : null;
    const resultReason = isAi
      ? this.getAiResultReason(room, currentParticipant, aiProjection!)
      : null;
    const myCompletionTimeMs = isAi
      ? this.getParticipantCompletionTimeMs(room, currentParticipant)
      : null;

    return {
      success: true as const,
      data: {
        battleId: room.id,
        mode: room.mode,
        skill: room.skillCode,
        professionalTrackKey: room.professionalTrackKey,
        professionalTrack: getProfessionalTrackIdentity(room.professionalTrackKey),
        status: room.status,
        result: currentParticipant.result,
        startedAt: room.startedAt,
        durationSeconds: room.durationSeconds,
        myScore: currentParticipant.score,
        opponentScore:
          aiProjection?.score ?? opponentParticipant?.score ?? null,
        myCorrectCount: currentParticipant.correctCount,
        myWrongCount: currentParticipant.wrongCount,
        myUnansweredCount: currentParticipant.unansweredCount,
        opponentCorrectCount:
          aiProjection?.correctCount ??
          opponentParticipant?.correctCount ??
          null,
        opponentWrongCount:
          aiProjection?.wrongCount ?? opponentParticipant?.wrongCount ?? null,
        opponentUnansweredCount:
          aiProjection?.unansweredCount ??
          opponentParticipant?.unansweredCount ??
          null,
        ratingBefore: currentParticipant.ratingBefore ?? 0,
        ratingDelta: currentParticipant.ratingDelta,
        ratingAfter: currentParticipant.ratingAfter ?? 0,
        opponent:
          aiProjection ??
          (opponentParticipant
            ? {
                type: 'HUMAN',
                userId: opponentParticipant.user.id,
                nickname: opponentParticipant.user.nickname,
                avatarUrl: opponentParticipant.user.avatarUrl,
              }
            : null),
        mySummary: this.toSummary(currentParticipant),
        opponentSummary:
          aiProjection ??
          (opponentParticipant
            ? this.toOpponentSummary(opponentParticipant)
            : null),
        resultReason,
        myCompletionTimeMs,
        opponentCompletionTimeMs: aiProjection?.completionTimeMs ?? null,
        endReason: room.endReason,
        completedAt: room.completedAt ?? new Date(),
        serverTime: new Date(),
        questions,
      } satisfies BattleHistoryDetailPayload,
    };
  }

  private async loadCompletedRooms(currentUserId: string) {
    const rooms = (await this.prisma.battleRoom.findMany({
      where: {
        status: BattleRoomStatus.COMPLETED,
        participants: {
          some: {
            userId: currentUserId,
          },
        },
      },
      select: this.roomSelect,
    })) as BattleHistoryRoomRecord[];

    return rooms.filter(
      (room) =>
        room.endReason !== BattleEndReason.SYSTEM_CANCELLED &&
        room.participants.some(
          (participant) => participant.userId === currentUserId,
        ),
    );
  }

  private async loadRoomForHistory(battleId: string) {
    return (await this.prisma.battleRoom.findUnique({
      where: {
        id: battleId,
      },
      select: this.roomSelect,
    })) as BattleHistoryRoomRecord | null;
  }

  private matchesHistoryFilter(
    room: BattleHistoryRoomRecord,
    query: BattleHistoryQueryDto,
    currentUserId: string,
  ) {
    if (query.mode && room.mode !== query.mode) {
      return false;
    }

    if (query.result) {
      const currentParticipant = room.participants.find(
        (participant) => participant.userId === currentUserId,
      );

      if (!currentParticipant || currentParticipant.result !== query.result) {
        return false;
      }
    }

    return true;
  }

  private compareRoomHistory(
    left: BattleHistoryRoomRecord,
    right: BattleHistoryRoomRecord,
  ) {
    const leftCompletedAt = left.completedAt?.getTime() ?? 0;
    const rightCompletedAt = right.completedAt?.getTime() ?? 0;

    if (leftCompletedAt !== rightCompletedAt) {
      return rightCompletedAt - leftCompletedAt;
    }

    return right.id.localeCompare(left.id);
  }

  private toHistoryListItem(
    room: BattleHistoryRoomRecord,
    currentUserId: string,
  ) {
    const currentParticipant = room.participants.find(
      (participant) => participant.userId === currentUserId,
    );
    const opponentParticipant = room.participants.find(
      (participant) => participant.userId !== currentUserId,
    );
    const isTraining = room.mode === BattleMode.TRAINING;
    const isAi = room.mode === BattleMode.AI;

    if (
      !currentParticipant ||
      (isTraining &&
        (opponentParticipant ||
          currentParticipant.result !== BattleResult.NONE)) ||
      (isAi &&
        (opponentParticipant ||
          !room.aiOpponent ||
          currentParticipant.result === BattleResult.NONE)) ||
      (!isTraining &&
        !isAi &&
        (!opponentParticipant ||
          currentParticipant.result === BattleResult.NONE ||
          opponentParticipant.result === BattleResult.NONE))
    ) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_HISTORY_NOT_COMPLETED,
      );
    }

    const aiProjection = isAi ? this.toCompletedAiOpponent(room) : null;

    return {
      battleId: room.id,
      mode: room.mode,
      skill: room.skillCode,
      professionalTrackKey: room.professionalTrackKey,
      professionalTrack: getProfessionalTrackIdentity(room.professionalTrackKey),
      result: currentParticipant.result,
      opponent:
        aiProjection ??
        (opponentParticipant
          ? {
              type: 'HUMAN',
              userId: opponentParticipant.user.id,
              nickname: opponentParticipant.user.nickname,
              avatarUrl: opponentParticipant.user.avatarUrl,
            }
          : null),
      myScore: currentParticipant.score,
      opponentScore: aiProjection?.score ?? opponentParticipant?.score ?? null,
      myCorrectCount: currentParticipant.correctCount,
      myWrongCount: currentParticipant.wrongCount,
      myUnansweredCount: currentParticipant.unansweredCount,
      ratingBefore: currentParticipant.ratingBefore ?? 0,
      ratingDelta: currentParticipant.ratingDelta,
      ratingAfter: currentParticipant.ratingAfter ?? 0,
      resultReason: isAi
        ? this.getAiResultReason(room, currentParticipant, aiProjection!)
        : null,
      myCompletionTimeMs: isAi
        ? this.getParticipantCompletionTimeMs(room, currentParticipant)
        : null,
      opponentCompletionTimeMs: aiProjection?.completionTimeMs ?? null,
      endReason: room.endReason,
      completedAt: room.completedAt ?? new Date(),
    };
  }

  private toHistoryQuestion(
    room: BattleHistoryRoomRecord,
    snapshot: BattleHistorySnapshotRecord,
    answersBySnapshotId: Map<string, BattleHistoryAnswerRecord>,
  ): BattleHistoryQuestionPayload {
    const answer = answersBySnapshotId.get(snapshot.id) ?? null;
    const snapshotCorrectAnswer =
      snapshot.correctAnswerSnapshot as BattleHistoryQuestionPayload['correctAnswer'];
    const acceptedAnswers = this.asStringArray(snapshot.acceptedAnswersSnapshot);
    const correctAnswer =
      snapshotCorrectAnswer.type === 'CODE_FILL' && acceptedAnswers.length > 0
        ? { ...snapshotCorrectAnswer, acceptedAnswers }
        : snapshotCorrectAnswer;
    const options = this.asOptionSnapshots(snapshot.optionsSnapshot);
    const correctOptionId =
      correctAnswer.type === 'SINGLE_CHOICE' ? correctAnswer.optionId : null;

    return {
      battleQuestionSnapshotId: snapshot.id,
      questionId: snapshot.sourceQuizQuestionId ?? snapshot.id,
      sourceQuizQuestionId: snapshot.sourceQuizQuestionId,
      source: 'BATTLE',
      questionType: snapshot.questionType,
      presentation: snapshot.presentation,
      difficulty: snapshot.difficulty,
      stem: this.asContentBlocks(snapshot.stemSnapshot),
      options,
      myAnswer: answer
        ? {
            answer: answer.answerPayload as BattleAnswerPayload,
            submittedAt: answer.submittedAt,
            timeSpentMs: answer.timeSpentMs,
          }
        : null,
      correctAnswer,
      correctOptionId,
      isCorrect: answer ? answer.isCorrect : null,
      scoreDelta: answer ? answer.scoreDelta : room.unansweredScore,
      explanation: this.asMaybeContentBlocks(snapshot.explanationSnapshot),
      knowledgeTags: this.asStringArray(snapshot.knowledgeTagsSnapshot),
      courseId: snapshot.courseIdSnapshot,
      courseTitle: snapshot.sourceQuizQuestion?.quiz.chapter.course.title ?? null,
      chapterId: snapshot.chapterIdSnapshot,
      chapterTitle: snapshot.sourceQuizQuestion?.quiz.chapter.title ?? null,
      orderIndex: snapshot.orderIndex,
    };
  }

  private toSummary(
    participant: BattleHistoryParticipantRecord,
  ): BattleHistorySummaryPayload {
    return {
      score: participant.score,
      correctCount: participant.correctCount,
      wrongCount: participant.wrongCount,
      unansweredCount: participant.unansweredCount,
      ratingBefore: participant.ratingBefore ?? 0,
      ratingDelta: participant.ratingDelta,
      ratingAfter: participant.ratingAfter ?? 0,
    };
  }

  private toOpponentSummary(
    participant: BattleHistoryParticipantRecord,
  ): BattleHistoryOpponentSummaryPayload {
    return {
      type: 'HUMAN',
      userId: participant.user.id,
      nickname: participant.user.nickname,
      avatarUrl: participant.user.avatarUrl,
      score: participant.score,
      correctCount: participant.correctCount,
      wrongCount: participant.wrongCount,
      unansweredCount: participant.unansweredCount,
      ratingBefore: participant.ratingBefore ?? 0,
      ratingDelta: participant.ratingDelta,
      ratingAfter: participant.ratingAfter ?? 0,
    };
  }

  private toCompletedAiOpponent(
    room: BattleHistoryRoomRecord,
  ): BattleAiCompletedOpponentPayload {
    if (!room.aiOpponent) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID);
    }

    const stats = this.getAiFinalStats(room);
    const score = calculateBattleScore({
      correctCount: stats.correctCount,
      wrongCount: stats.wrongCount,
      unansweredCount: stats.unansweredCount,
      questionCount: room.questionCount,
      correctScore: room.correctScore,
      wrongScore: room.wrongScore,
      unansweredScore: room.unansweredScore,
    }).score;

    return {
      type: 'AI',
      displayName: room.aiOpponent.displayName,
      ...stats,
      score,
    };
  }

  private getAiFinalStats(room: BattleHistoryRoomRecord) {
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

  private getAiResultReason(
    room: BattleHistoryRoomRecord,
    participant: BattleHistoryParticipantRecord,
    opponent: BattleAiCompletedOpponentPayload,
  ): BattleAiResultReason {
    return resolveBattleAiOutcome({
      userCorrectCount: participant.correctCount,
      userCompletionTimeMs: this.getParticipantCompletionTimeMs(
        room,
        participant,
      ),
      aiCorrectCount: opponent.correctCount,
      aiCompletionTimeMs: opponent.completionTimeMs,
      userForfeited: room.endReason === BattleEndReason.USER_FORFEIT,
    }).reason;
  }

  private getParticipantCompletionTimeMs(
    room: BattleHistoryRoomRecord,
    participant: BattleHistoryParticipantRecord,
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

  private asContentBlocks(value: unknown): ContentBlock[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as ContentBlock[];
  }

  private asMaybeContentBlocks(value: unknown): ContentBlock[] | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (!Array.isArray(value)) {
      return null;
    }

    return value as ContentBlock[];
  }

  private asOptionSnapshots(value: unknown): BattleQuestionOptionSnapshot[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as BattleQuestionOptionSnapshot[];
  }

  private asStringArray(value: unknown) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private readonly roomSelect = {
    id: true,
    mode: true,
    skillCode: true,
    professionalTrackKey: true,
    status: true,
    startedAt: true,
    expiresAt: true,
    completedAt: true,
    endReason: true,
    durationSeconds: true,
    questionCount: true,
    correctScore: true,
    wrongScore: true,
    unansweredScore: true,
    participants: {
      select: {
        id: true,
        userId: true,
        seat: true,
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
        battleRoomId: true,
        sourceQuizQuestionId: true,
        orderIndex: true,
        questionType: true,
        presentation: true,
        difficulty: true,
        stemSnapshot: true,
        optionsSnapshot: true,
        correctAnswerSnapshot: true,
        explanationSnapshot: true,
        acceptedAnswersSnapshot: true,
        knowledgeTagsSnapshot: true,
        programmingLanguage: true,
        courseIdSnapshot: true,
        chapterIdSnapshot: true,
        sourceQuizQuestion: {
          select: {
            quiz: {
              select: {
                chapter: {
                  select: {
                    title: true,
                    course: { select: { title: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        orderIndex: 'asc' as const,
      },
    },
    answers: {
      select: {
        battleRoomId: true,
        participantId: true,
        battleQuestionSnapshotId: true,
        answerPayload: true,
        submittedAt: true,
        timeSpentMs: true,
        isCorrect: true,
        scoreDelta: true,
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
  } as const;
}
