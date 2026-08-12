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
import type { BattleHistoryDetailPayload, BattleHistoryPayload } from './battle.types';
import type { BattleHistoryQueryDto } from './dto/battle-history-query.dto';
import type {
  BattleAnswerPayload,
  BattleHistoryQuestionPayload,
  BattleHistorySummaryPayload,
  BattleHistoryOpponentSummaryPayload,
  BattleQuestionOptionSnapshot,
  ContentBlock,
} from './battle.types';

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
  programmingLanguage: string | null;
  courseIdSnapshot: string | null;
  chapterIdSnapshot: string | null;
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
  status: BattleRoomStatus;
  startedAt: Date | null;
  expiresAt: Date | null;
  completedAt: Date | null;
  endReason: BattleEndReason | null;
  durationSeconds: number;
  unansweredScore: number;
  participants: BattleHistoryParticipantRecord[];
  questionSnapshots: BattleHistorySnapshotRecord[];
  answers: BattleHistoryAnswerRecord[];
};

@Injectable()
export class BattleHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(
    currentUserId: string,
    query: BattleHistoryQueryDto,
  ) {
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

    if (
      !opponentParticipant ||
      currentParticipant.result === BattleResult.NONE ||
      opponentParticipant.result === BattleResult.NONE
    ) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_HISTORY_NOT_COMPLETED,
      );
    }

    const answersBySnapshotId = new Map(
      room.answers
        .filter((answer) => answer.participantId === currentParticipant.id)
        .sort((left, right) => {
          const diff =
            right.submittedAt.getTime() - left.submittedAt.getTime();

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
      .map((snapshot) => this.toHistoryQuestion(room, snapshot, answersBySnapshotId));

    return {
      success: true as const,
      data: {
        battleId: room.id,
        mode: room.mode,
        skill: room.skillCode,
        status: room.status,
        result: currentParticipant.result,
        startedAt: room.startedAt,
        durationSeconds: room.durationSeconds,
        myScore: currentParticipant.score,
        opponentScore: opponentParticipant.score,
        myCorrectCount: currentParticipant.correctCount,
        myWrongCount: currentParticipant.wrongCount,
        myUnansweredCount: currentParticipant.unansweredCount,
        opponentCorrectCount: opponentParticipant.correctCount,
        opponentWrongCount: opponentParticipant.wrongCount,
        opponentUnansweredCount: opponentParticipant.unansweredCount,
        ratingBefore: currentParticipant.ratingBefore ?? 0,
        ratingDelta: currentParticipant.ratingDelta,
        ratingAfter: currentParticipant.ratingAfter ?? 0,
        opponent: {
          userId: opponentParticipant.user.id,
          nickname: opponentParticipant.user.nickname,
          avatarUrl: opponentParticipant.user.avatarUrl,
        },
        mySummary: this.toSummary(currentParticipant),
        opponentSummary: this.toOpponentSummary(opponentParticipant),
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
        room.participants.some((participant) => participant.userId === currentUserId),
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

    if (
      !currentParticipant ||
      !opponentParticipant ||
      currentParticipant.result === BattleResult.NONE ||
      opponentParticipant.result === BattleResult.NONE
    ) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_HISTORY_NOT_COMPLETED,
      );
    }

    return {
      battleId: room.id,
      mode: room.mode,
      skill: room.skillCode,
      result: currentParticipant.result,
      opponent: {
        userId: opponentParticipant.user.id,
        nickname: opponentParticipant.user.nickname,
        avatarUrl: opponentParticipant.user.avatarUrl,
      },
      myScore: currentParticipant.score,
      opponentScore: opponentParticipant.score,
      myCorrectCount: currentParticipant.correctCount,
      myWrongCount: currentParticipant.wrongCount,
      myUnansweredCount: currentParticipant.unansweredCount,
      ratingBefore: currentParticipant.ratingBefore ?? 0,
      ratingDelta: currentParticipant.ratingDelta,
      ratingAfter: currentParticipant.ratingAfter ?? 0,
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
    const correctAnswer = snapshot.correctAnswerSnapshot as BattleHistoryQuestionPayload['correctAnswer'];
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
      courseId: snapshot.courseIdSnapshot,
      courseTitle: null,
      chapterId: snapshot.chapterIdSnapshot,
      chapterTitle: null,
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

  private readonly roomSelect = {
    id: true,
    mode: true,
    skillCode: true,
    status: true,
    startedAt: true,
    expiresAt: true,
    completedAt: true,
    endReason: true,
    durationSeconds: true,
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
        programmingLanguage: true,
        courseIdSnapshot: true,
        chapterIdSnapshot: true,
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
  } as const;
}
