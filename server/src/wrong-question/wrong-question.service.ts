import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import {
  BattleEndReason,
  BattleMode,
  BattleResult,
  BattleRoomStatus,
  QuestionType,
} from '../../generated/prisma/enums';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { isTextQuestionType, parseAcceptedAnswers } from '../question/question-answer';
import { GetWrongQuestionsQueryDto } from './dto/get-wrong-questions-query.dto';
import { type WrongQuestionSource } from './wrong-question.types';
import type {
  BattleAnswerPayload,
  BattleQuestionOptionSnapshot,
  ContentBlock,
} from '../battle/battle.types';
import { canonicalizeQuestionBlocks } from '../question/content-blocks';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

type LearningAggregateRow = {
  questionId: string;
  wrongCount: number | bigint;
  lastWrongAt: Date;
  selectedOptionId?: string | null;
  answerText?: string | null;
};

type PracticeAggregateRow = LearningAggregateRow;

type LearningAnswerPayload =
  | {
      type: 'SINGLE_CHOICE' | 'TRUE_FALSE';
      optionId: string;
    }
  | {
      type: 'FILL_BLANK' | 'CODE_FILL';
      value: string;
    };

type LearningQuestionRecord = {
  id: string;
  type: QuestionType;
  content: string;
  explanation: string | null;
  stemBlocks: unknown;
  explanationBlocks: unknown;
  acceptedAnswers: unknown;
  programmingLanguage: string | null;
  options: Array<{
    id: string;
    content: string;
    contentBlocks: unknown;
    isCorrect: boolean;
    sortOrder: number;
  }>;
  quiz: {
    chapterId: string;
    chapter: {
      title: string;
      courseId: string;
      course: {
        title: string;
      };
    };
  };
};

type WrongQuestionStatisticsRow = {
  totalWrongQuestions: number;
  totalWrongAnswers: number;
  courseCount: number;
  latestWrongAt: Date | null;
};

type BattleRoomRecord = {
  id: string;
  mode: string;
  status: BattleRoomStatus;
  completedAt: Date | null;
  endReason: BattleEndReason | null;
  participants: Array<{
    id: string;
    userId: string;
    score: number;
    result: BattleResult;
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
  }>;
  questionSnapshots: Array<{
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
  }>;
  answers: Array<{
    battleRoomId: string;
    participantId: string;
    battleQuestionSnapshotId: string;
    answerPayload: unknown;
    submittedAt: Date;
    timeSpentMs: number | null;
    isCorrect: boolean;
    scoreDelta: number;
  }>;
};

type UnifiedWrongQuestionItem = {
  source: WrongQuestionSource;
  questionId: string;
  battleQuestionSnapshotId: string | null;
  questionType: QuestionType | string;
  questionContent: string;
  content: string;
  courseId: string | null;
  courseTitle: string | null;
  chapterId: string | null;
  chapterTitle: string | null;
  wrongCount: number;
  lastWrongAt: Date;
  latestWrongAt: Date;
  presentation: string | null;
  difficulty: string | null;
  programmingLanguage: string | null;
  stem: ContentBlock[] | null;
  options: Array<{
    optionId: string;
    content: string;
    order: number;
  }> | null;
  optionSnapshots: BattleQuestionOptionSnapshot[] | null;
  correctOptionId: string | null;
  correctAnswer: unknown;
  explanation: string | ContentBlock[] | null;
  explanationBlocks: ContentBlock[] | null;
  latestWrongAnswer: BattleAnswerPayload | LearningAnswerPayload | null;
  sourceQuizQuestionId: string | null;
  battle: {
    battleId: string;
    completedAt: Date | null;
    opponent: {
      userId: string;
      nickname: string | null;
      avatarUrl: string | null;
    } | null;
  } | null;
  knowledgeTags?: string[];
};

@Injectable()
export class WrongQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(
    currentUser: CurrentUserContext,
    query: GetWrongQuestionsQueryDto,
  ) {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const filters = await this.resolveFilters(query.courseId, query.chapterId);

    const items = await this.loadUnifiedWrongQuestions(
      currentUser.id,
      filters,
      query.source,
    );

    const total = items.length;
    const start = (page - 1) * pageSize;
    const pagedItems = items.slice(start, start + pageSize).map((item) =>
      this.toListItem(item),
    );

    return {
      success: true as const,
      data: {
        items: pagedItems,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        },
      },
    };
  }

  async getStatistics(currentUser: CurrentUserContext) {
    const items = await this.loadUnifiedWrongQuestions(currentUser.id, {});

    const totalWrongQuestions = items.length;
    const totalWrongAnswers = items.reduce(
      (sum, item) => sum + item.wrongCount,
      0,
    );
    const courseCount = new Set(
      items
        .map((item) => item.courseId)
        .filter((courseId): courseId is string => Boolean(courseId)),
    ).size;
    const latestWrongAt =
      items.length === 0
        ? null
        : items[0]?.latestWrongAt ?? null;

    return {
      success: true as const,
      data: {
        totalWrongQuestions,
        totalWrongAnswers,
        courseCount,
        latestWrongAt,
      } satisfies WrongQuestionStatisticsRow,
    };
  }

  async getDetail(
    currentUser: CurrentUserContext,
    questionId: string,
    source?: WrongQuestionSource,
  ) {
    const items = await this.loadUnifiedWrongQuestions(
      currentUser.id,
      {},
      source,
    );

    const matched = items.filter((item) => item.questionId === questionId);

    if (matched.length === 0) {
      throw new NotFoundException('WRONG_QUESTION_NOT_FOUND');
    }

    const item =
      matched.length === 1
        ? matched[0]!
        : matched.sort((left, right) => {
            const diff = right.latestWrongAt.getTime() - left.latestWrongAt.getTime();

            if (diff !== 0) {
              return diff;
            }

            return left.source.localeCompare(right.source);
          })[0]!;

    return {
      success: true as const,
      data: this.toDetailItem(item),
    };
  }

  private async loadUnifiedWrongQuestions(
    currentUserId: string,
    filters: { courseId?: string; chapterId?: string },
    source?: WrongQuestionSource,
  ) {
    const items: UnifiedWrongQuestionItem[] = [];

    if (!source || source === 'LEARNING') {
      items.push(
        ...(await this.loadLearningWrongQuestions(currentUserId, filters)),
      );
    }

    if (!source || source === 'PRACTICE') {
      items.push(
        ...(await this.loadPracticeWrongQuestions(currentUserId, filters)),
      );
    }

    if ((!source || source === 'BATTLE') && this.hasBattleReadModels()) {
      items.push(
        ...(await this.loadBattleWrongQuestions(currentUserId, filters)),
      );
    }

    return items.sort((left, right) => {
      const diff = right.latestWrongAt.getTime() - left.latestWrongAt.getTime();

      if (diff !== 0) {
        return diff;
      }

      if (left.source !== right.source) {
        return left.source.localeCompare(right.source);
      }

      return left.questionId.localeCompare(right.questionId);
    });
  }

  private async loadPracticeWrongQuestions(
    currentUserId: string,
    filters: { courseId?: string; chapterId?: string },
  ) {
    const clauses = [
      Prisma.sql`answer.user_id = ${currentUserId}::uuid`,
      Prisma.sql`answer.is_correct = false`,
    ];

    if (filters.courseId) {
      clauses.push(Prisma.sql`chapter.course_id = ${filters.courseId}::uuid`);
    }

    if (filters.chapterId) {
      clauses.push(Prisma.sql`quiz.chapter_id = ${filters.chapterId}::uuid`);
    }

    const aggregateRows = await this.prisma.$queryRaw<PracticeAggregateRow[]>(
      Prisma.sql`
        SELECT
          answer.question_id AS "questionId",
          COUNT(*)::int AS "wrongCount",
          MAX(answer.answered_at) AS "lastWrongAt",
          (ARRAY_AGG(answer.selected_option_id ORDER BY answer.answered_at DESC))[1] AS "selectedOptionId",
          (ARRAY_AGG(answer.answer_text ORDER BY answer.answered_at DESC))[1] AS "answerText"
        FROM practice_answers answer
        INNER JOIN quiz_questions question ON question.id = answer.question_id
        INNER JOIN quizzes quiz ON quiz.id = question.quiz_id
        INNER JOIN course_chapters chapter ON chapter.id = quiz.chapter_id
        WHERE ${Prisma.join(clauses, ' AND ')}
        GROUP BY answer.question_id
        ORDER BY MAX(answer.answered_at) DESC, answer.question_id ASC
      `,
    );

    if (aggregateRows.length === 0) {
      return [];
    }

    const questions = (await this.prisma.quizQuestion.findMany({
      where: { id: { in: aggregateRows.map((row) => row.questionId) } },
      select: {
        id: true,
        type: true,
        content: true,
        explanation: true,
        stemBlocks: true,
        explanationBlocks: true,
        acceptedAnswers: true,
        programmingLanguage: true,
        options: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            content: true,
            contentBlocks: true,
            isCorrect: true,
            sortOrder: true,
          },
        },
        quiz: {
          select: {
            chapterId: true,
            chapter: {
              select: {
                title: true,
                courseId: true,
                course: { select: { title: true } },
              },
            },
          },
        },
      },
    })) as LearningQuestionRecord[];
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    return aggregateRows.map((row) => {
      const question = questionMap.get(row.questionId);
      const textQuestion = question ? isTextQuestionType(question.type) : false;
      const correctOptions = question?.options.filter((option) => option.isCorrect) ?? [];
      const acceptedAnswers = question
        ? parseAcceptedAnswers(question.acceptedAnswers)
        : [];

      if (
        !question ||
        (textQuestion ? acceptedAnswers.length === 0 : correctOptions.length !== 1)
      ) {
        throw new BadRequestException('QUIZ_NOT_READY');
      }

      const correctOption = textQuestion ? null : correctOptions[0]!;

      return {
        source: 'PRACTICE' as const,
        questionId: question.id,
        battleQuestionSnapshotId: null,
        questionType: question.type,
        questionContent: question.content,
        content: question.content,
        courseId: question.quiz.chapter.courseId,
        courseTitle: question.quiz.chapter.course.title,
        chapterId: question.quiz.chapterId,
        chapterTitle: question.quiz.chapter.title,
        wrongCount: this.toNumber(row.wrongCount),
        lastWrongAt: row.lastWrongAt,
        latestWrongAt: row.lastWrongAt,
        presentation: null,
        difficulty: null,
        programmingLanguage: question.programmingLanguage ?? null,
        stem: canonicalizeQuestionBlocks(question.stemBlocks, question.content),
        options: question.options.map((option) => ({
          optionId: option.id,
          content: option.content,
          contentBlocks: canonicalizeQuestionBlocks(option.contentBlocks, option.content),
          order: option.sortOrder,
        })),
        optionSnapshots: null,
        correctOptionId: correctOption?.id ?? null,
        correctAnswer: textQuestion
          ? { type: question.type, acceptedAnswers }
          : { type: question.type, optionId: correctOption!.id },
        explanation: question.explanation,
        explanationBlocks: canonicalizeQuestionBlocks(
          question.explanationBlocks,
          question.explanation,
        ),
        latestWrongAnswer: textQuestion
          ? {
              type: question.type as 'FILL_BLANK' | 'CODE_FILL',
              value: row.answerText ?? '',
            }
          : row.selectedOptionId
            ? {
                type: question.type as 'SINGLE_CHOICE' | 'TRUE_FALSE',
                optionId: row.selectedOptionId,
              }
            : null,
        sourceQuizQuestionId: question.id,
        knowledgeTags: [],
        battle: null,
      } satisfies UnifiedWrongQuestionItem;
    });
  }

  private async loadLearningWrongQuestions(
    currentUserId: string,
    filters: { courseId?: string; chapterId?: string },
  ) {
    const aggregateRows = await this.prisma.$queryRaw<LearningAggregateRow[]>(
      Prisma.sql`
        SELECT
          qa.question_id AS "questionId",
          COUNT(*)::int AS "wrongCount",
          MAX(attempt.submitted_at) AS "lastWrongAt",
          (ARRAY_AGG(qa.selected_option_id ORDER BY attempt.submitted_at DESC))[1] AS "selectedOptionId",
          (ARRAY_AGG(qa.answer_text ORDER BY attempt.submitted_at DESC))[1] AS "answerText"
        FROM quiz_answers qa
        INNER JOIN quiz_attempts attempt ON attempt.id = qa.attempt_id
        INNER JOIN quiz_questions question ON question.id = qa.question_id
        INNER JOIN quizzes quiz ON quiz.id = question.quiz_id
        INNER JOIN course_chapters chapter ON chapter.id = quiz.chapter_id
        WHERE ${this.buildLearningWhereClause(currentUserId, filters)}
        GROUP BY qa.question_id
        ORDER BY MAX(attempt.submitted_at) DESC, qa.question_id ASC
      `,
    );

    if (aggregateRows.length === 0) {
      return [];
    }

    const questionIds = aggregateRows.map((row) => row.questionId);
    const questions = (await this.prisma.quizQuestion.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      select: {
        id: true,
        type: true,
        content: true,
        explanation: true,
        stemBlocks: true,
        explanationBlocks: true,
        acceptedAnswers: true,
        programmingLanguage: true,
        options: {
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            id: true,
            content: true,
            contentBlocks: true,
            isCorrect: true,
            sortOrder: true,
          },
        },
        quiz: {
          select: {
            chapterId: true,
            chapter: {
              select: {
                title: true,
                courseId: true,
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    })) as LearningQuestionRecord[];
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    return aggregateRows.map((row) => {
      const question = questionMap.get(row.questionId);

      if (!question) {
        throw new BadRequestException('QUIZ_NOT_READY');
      }

      const textQuestion = isTextQuestionType(question.type);
      const correctOptions = question.options.filter((option) => option.isCorrect);
      const acceptedAnswers = parseAcceptedAnswers(question.acceptedAnswers);

      if (textQuestion ? acceptedAnswers.length === 0 : correctOptions.length !== 1) {
        throw new BadRequestException('QUIZ_NOT_READY');
      }

      const correctOption = textQuestion ? null : correctOptions[0]!;

      return {
        source: 'LEARNING' as const,
        questionId: question.id,
        battleQuestionSnapshotId: null,
        questionType: question.type,
        questionContent: question.content,
        content: question.content,
        courseId: question.quiz.chapter.courseId,
        courseTitle: question.quiz.chapter.course.title,
        chapterId: question.quiz.chapterId,
        chapterTitle: question.quiz.chapter.title,
        wrongCount: this.toNumber(row.wrongCount),
        lastWrongAt: row.lastWrongAt,
        latestWrongAt: row.lastWrongAt,
        presentation: null,
        difficulty: null,
        programmingLanguage: question.programmingLanguage ?? null,
        stem: canonicalizeQuestionBlocks(question.stemBlocks, question.content),
        options: question.options.map((option) => ({
          optionId: option.id,
          content: option.content,
          contentBlocks: canonicalizeQuestionBlocks(option.contentBlocks, option.content),
          order: option.sortOrder,
        })),
        optionSnapshots: null,
        correctOptionId: correctOption?.id ?? null,
        correctAnswer: textQuestion
          ? { type: question.type, acceptedAnswers }
          : { type: question.type, optionId: correctOption!.id },
        explanation: question.explanation,
        explanationBlocks: canonicalizeQuestionBlocks(
          question.explanationBlocks,
          question.explanation,
        ),
        latestWrongAnswer: textQuestion
          ? {
              type: question.type as 'FILL_BLANK' | 'CODE_FILL',
              value: row.answerText ?? '',
            }
          : row.selectedOptionId
            ? {
                type: question.type as 'SINGLE_CHOICE' | 'TRUE_FALSE',
                optionId: row.selectedOptionId,
              }
            : null,
        sourceQuizQuestionId: null,
        knowledgeTags: [],
        battle: null,
      } satisfies UnifiedWrongQuestionItem;
    });
  }

  private async loadBattleWrongQuestions(
    currentUserId: string,
    filters: { courseId?: string; chapterId?: string },
  ) {
    const rooms = (await this.prisma.battleRoom.findMany({
      where: {
        status: BattleRoomStatus.COMPLETED,
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
        completedAt: true,
        endReason: true,
        participants: {
          select: {
            id: true,
            userId: true,
            score: true,
            result: true,
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
      },
    })) as BattleRoomRecord[];

    if (rooms.length === 0) {
      return [];
    }

    const items = new Map<string, UnifiedWrongQuestionItem>();

    for (const room of rooms) {
      if (room.endReason === BattleEndReason.SYSTEM_CANCELLED) {
        continue;
      }

      const currentParticipant = room.participants.find(
        (participant) => participant.userId === currentUserId,
      );
      const opponentParticipant = room.participants.find(
        (participant) => participant.userId !== currentUserId,
      );

      if (
        !currentParticipant ||
        (room.mode !== BattleMode.TRAINING &&
          currentParticipant.result === BattleResult.NONE)
      ) {
        continue;
      }

      const snapshotMap = new Map(
        room.questionSnapshots.map((snapshot) => [snapshot.id, snapshot] as const),
      );

      const answers = room.answers
        .filter((answer) => answer.participantId === currentParticipant.id)
        .filter((answer) => answer.isCorrect === false)
        .sort((left, right) => {
          const diff = right.submittedAt.getTime() - left.submittedAt.getTime();

          if (diff !== 0) {
            return diff;
          }

          return right.battleQuestionSnapshotId.localeCompare(
            left.battleQuestionSnapshotId,
          );
        });

      for (const answer of answers) {
        const snapshot = snapshotMap.get(answer.battleQuestionSnapshotId);

        if (!snapshot) {
          continue;
        }

        if (
          filters.courseId &&
          snapshot.courseIdSnapshot !== filters.courseId
        ) {
          continue;
        }

        if (
          filters.chapterId &&
          snapshot.chapterIdSnapshot !== filters.chapterId
        ) {
          continue;
        }

        const questionId = snapshot.sourceQuizQuestionId ?? snapshot.id;
        const key = this.buildBattleKey(questionId);
        const nextItem = this.buildBattleWrongQuestionItem(
          room,
          opponentParticipant,
          snapshot,
          answer,
          questionId,
        );
        const existing = items.get(key);

        if (!existing) {
          items.set(key, nextItem);
          continue;
        }

        existing.wrongCount += 1;

        if (nextItem.latestWrongAt > existing.latestWrongAt) {
          items.set(key, {
            ...existing,
            ...nextItem,
            wrongCount: existing.wrongCount,
          });
        }
      }
    }

    return [...items.values()];
  }

  private buildBattleWrongQuestionItem(
    room: BattleRoomRecord,
    opponentParticipant: BattleRoomRecord['participants'][number] | undefined,
    snapshot: BattleRoomRecord['questionSnapshots'][number],
    answer: BattleRoomRecord['answers'][number],
    questionId: string,
  ): UnifiedWrongQuestionItem {
    const correctAnswer = snapshot.correctAnswerSnapshot;
    const acceptedAnswers = this.asStringArray(snapshot.acceptedAnswersSnapshot);
    const correctOptionId =
      typeof correctAnswer === 'object' &&
      correctAnswer !== null &&
      'type' in correctAnswer &&
      (correctAnswer as { type?: string }).type === 'SINGLE_CHOICE'
        ? (correctAnswer as { optionId?: string }).optionId ?? null
        : null;

    const stem = this.asContentBlocks(snapshot.stemSnapshot);
    const optionSnapshots = this.asOptionSnapshots(snapshot.optionsSnapshot);
    const options = optionSnapshots.map((option) => ({
      optionId: option.id,
      content: this.previewBlocks(option.blocks),
      order: option.orderIndex,
    }));

    const resolvedCorrectAnswer =
      typeof correctAnswer === 'object' &&
      correctAnswer !== null &&
      'type' in correctAnswer &&
      (correctAnswer as { type?: string }).type === 'CODE_FILL'
        ? { ...(correctAnswer as object), acceptedAnswers }
        : correctAnswer;

    return {
      source: 'BATTLE',
      questionId,
      battleQuestionSnapshotId: snapshot.id,
      questionType: snapshot.questionType,
      questionContent: this.previewBlocks(stem),
      content: this.previewBlocks(stem),
      courseId: snapshot.courseIdSnapshot,
      courseTitle: snapshot.sourceQuizQuestion?.quiz.chapter.course.title ?? null,
      chapterId: snapshot.chapterIdSnapshot,
      chapterTitle: snapshot.sourceQuizQuestion?.quiz.chapter.title ?? null,
      wrongCount: 1,
      lastWrongAt: answer.submittedAt,
      latestWrongAt: answer.submittedAt,
      presentation: snapshot.presentation,
      difficulty: snapshot.difficulty,
      programmingLanguage: snapshot.programmingLanguage,
      stem,
      options,
      optionSnapshots,
      correctOptionId,
      correctAnswer: resolvedCorrectAnswer,
      explanation: this.asMaybeContentBlocks(snapshot.explanationSnapshot),
      explanationBlocks: this.asMaybeContentBlocks(snapshot.explanationSnapshot),
      latestWrongAnswer: answer.answerPayload as BattleAnswerPayload,
      sourceQuizQuestionId: snapshot.sourceQuizQuestionId,
      knowledgeTags: this.asStringArray(snapshot.knowledgeTagsSnapshot),
      battle: {
        battleId: room.id,
        completedAt: room.completedAt,
        opponent: opponentParticipant
          ? {
              userId: opponentParticipant.user.id,
              nickname: opponentParticipant.user.nickname,
              avatarUrl: opponentParticipant.user.avatarUrl,
            }
          : null,
      },
    };
  }

  private toListItem(item: UnifiedWrongQuestionItem) {
    return {
      source: item.source,
      questionId: item.questionId,
      battleQuestionSnapshotId: item.battleQuestionSnapshotId,
      questionType: item.questionType,
      questionContent: item.questionContent,
      courseId: item.courseId,
      courseTitle: item.courseTitle,
      chapterId: item.chapterId,
      chapterTitle: item.chapterTitle,
      wrongCount: item.wrongCount,
      lastWrongAt: item.lastWrongAt,
      latestWrongAt: item.latestWrongAt,
      presentation: item.presentation,
      difficulty: item.difficulty,
      programmingLanguage: item.programmingLanguage,
      battle: item.battle,
    };
  }

  private toDetailItem(item: UnifiedWrongQuestionItem) {
    if (item.source === 'LEARNING') {
      return {
        source: item.source,
        questionId: item.questionId,
        battleQuestionSnapshotId: item.battleQuestionSnapshotId,
        questionType: item.questionType,
        content: item.content,
        questionContent: item.questionContent,
        courseId: item.courseId,
        courseTitle: item.courseTitle,
        chapterId: item.chapterId,
        chapterTitle: item.chapterTitle,
        options: item.options,
        correctOptionId: item.correctOptionId,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        explanationBlocks: item.explanationBlocks,
        wrongCount: item.wrongCount,
        lastWrongAt: item.lastWrongAt,
        latestWrongAt: item.latestWrongAt,
        presentation: item.presentation,
        difficulty: item.difficulty,
        programmingLanguage: item.programmingLanguage,
        stem: item.stem,
        optionSnapshots: item.optionSnapshots,
        latestWrongAnswer: item.latestWrongAnswer,
        sourceQuizQuestionId: item.sourceQuizQuestionId,
        knowledgeTags: item.knowledgeTags ?? [],
        battle: item.battle,
      };
    }

    return {
      source: item.source,
      questionId: item.questionId,
      battleQuestionSnapshotId: item.battleQuestionSnapshotId,
      questionType: item.questionType,
      content: item.content,
      questionContent: item.questionContent,
      courseId: item.courseId,
      courseTitle: item.courseTitle,
      chapterId: item.chapterId,
      chapterTitle: item.chapterTitle,
      options: item.options,
      correctOptionId: item.correctOptionId,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      explanationBlocks: item.explanationBlocks,
      wrongCount: item.wrongCount,
      lastWrongAt: item.lastWrongAt,
      latestWrongAt: item.latestWrongAt,
      presentation: item.presentation,
      difficulty: item.difficulty,
      programmingLanguage: item.programmingLanguage,
      stem: item.stem,
      optionSnapshots: item.optionSnapshots,
      latestWrongAnswer: item.latestWrongAnswer,
      sourceQuizQuestionId: item.sourceQuizQuestionId,
      knowledgeTags: item.knowledgeTags ?? [],
      battle: item.battle,
    };
  }

  private buildLearningWhereClause(
    userId: string,
    filters: { courseId?: string; chapterId?: string },
  ) {
    const clauses = [
      Prisma.sql`attempt.user_id = ${userId}::uuid`,
      Prisma.sql`qa.is_correct = false`,
    ];

    if (filters.courseId) {
      clauses.push(Prisma.sql`chapter.course_id = ${filters.courseId}::uuid`);
    }

    if (filters.chapterId) {
      clauses.push(Prisma.sql`quiz.chapter_id = ${filters.chapterId}::uuid`);
    }

    return Prisma.join(clauses, ' AND ');
  }

  private async resolveFilters(courseId?: string, chapterId?: string) {
    const [course, chapter] = await Promise.all([
      courseId
        ? this.prisma.course.findFirst({
            where: {
              id: courseId,
              deletedAt: null,
            },
            select: {
              id: true,
            },
          })
        : Promise.resolve(null),
      chapterId
        ? this.prisma.courseChapter.findFirst({
            where: {
              id: chapterId,
              deletedAt: null,
            },
            select: {
              id: true,
              courseId: true,
            },
          })
        : Promise.resolve(null),
    ]);

    if (courseId && !course) {
      throw new NotFoundException('COURSE_NOT_FOUND');
    }

    if (chapterId && !chapter) {
      throw new NotFoundException('CHAPTER_NOT_FOUND');
    }

    if (course && chapter && chapter.courseId !== course.id) {
      throw new BadRequestException('WRONG_QUESTION_FILTER_MISMATCH');
    }

    return {
      courseId: course?.id,
      chapterId: chapter?.id,
    };
  }

  private hasBattleReadModels() {
    return Boolean(
      (this.prisma as {
        battleRoom?: { findMany?: unknown };
      }).battleRoom?.findMany,
    );
  }

  private buildBattleKey(questionId: string) {
    return `BATTLE:${questionId}`;
  }

  private previewBlocks(blocks: ContentBlock[]) {
    return blocks
      .map((block) => {
        if (block.type === 'TEXT') {
          return block.text;
        }

        if (block.type === 'CODE') {
          return block.code;
        }

        return block.alt ?? block.url;
      })
      .join('\n')
      .trim();
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

  private toNumber(value: number | bigint) {
    return typeof value === 'bigint' ? Number(value) : value;
  }
}
