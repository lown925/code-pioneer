/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import {
  ForbiddenException,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { Prisma } from '../generated/prisma/client';
import {
  ChapterStatus,
  CourseStatus,
  LearningStatus,
  QuestionType,
  QuizStatus,
} from '../generated/prisma/enums';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { PrismaService } from './../src/prisma/prisma.service';

type CourseRecord = {
  id: string;
  title: string;
  coverUrl: string | null;
  status: CourseStatus;
  deletedAt: Date | null;
};

type ChapterRecord = {
  id: string;
  courseId: string;
  title: string;
  sortOrder: number;
  status: ChapterStatus;
  deletedAt: Date | null;
};

type CourseLearningRecord = {
  id: string;
  userId: string;
  courseId: string;
  status: LearningStatus;
  completedChapterCount: number;
  totalChapterCountSnapshot: number;
  progressPercent: Prisma.Decimal;
  lastChapterId: string | null;
  startedAt: Date;
  lastLearnedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ChapterLearningRecord = {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  status: LearningStatus;
  firstStartedAt: Date;
  lastLearnedAt: Date;
  completedAt: Date | null;
  quizCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type QuizRecord = {
  id: string;
  chapterId: string;
  title: string;
  description: string | null;
  passScorePercent: number;
  status: QuizStatus;
};

type QuizQuestionRecord = {
  id: string;
  quizId: string;
  type: QuestionType;
  content: string;
  explanation: string | null;
  score: number;
  sortOrder: number;
};

type QuizOptionRecord = {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
};

type QuizAttemptRecord = {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalScore: number;
  passed: boolean;
  submittedAt: Date;
  createdAt: Date;
};

type QuizAnswerRecord = {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  scoreAwarded: number;
  createdAt: Date;
};

const USER_A = {
  id: '99999999-9999-4999-8999-999999999999',
  sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const USER_B = {
  id: '88888888-8888-4888-8888-888888888888',
  sessionId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const USER_A_TOKEN = 'user-a-token';
const USER_B_TOKEN = 'user-b-token';
const DELETED_USER_TOKEN = 'deleted-user-token';
const REVOKED_SESSION_TOKEN = 'revoked-session-token';

function createMockPrisma() {
  const courses = new Map<string, CourseRecord>();
  const chapters = new Map<string, ChapterRecord>();
  const courseLearningRecords = new Map<string, CourseLearningRecord>();
  const chapterLearningRecords = new Map<string, ChapterLearningRecord>();
  const quizzes = new Map<string, QuizRecord>();
  const questions = new Map<string, QuizQuestionRecord>();
  const options = new Map<string, QuizOptionRecord>();
  const attempts = new Map<string, QuizAttemptRecord>();
  const answers = new Map<string, QuizAnswerRecord>();

  const courseKey = (userId: string, courseId: string) =>
    `${userId}:${courseId}`;
  const chapterKey = (userId: string, chapterId: string) =>
    `${userId}:${chapterId}`;

  const getPublishedChapters = (courseId: string) =>
    [...chapters.values()]
      .filter(
        (chapter) =>
          chapter.courseId === courseId &&
          chapter.status === ChapterStatus.PUBLISHED &&
          chapter.deletedAt === null,
      )
      .sort((left, right) =>
        left.sortOrder === right.sortOrder
          ? left.id.localeCompare(right.id)
          : left.sortOrder - right.sortOrder,
      );

  const getQuizByChapterId = (chapterId: string) => {
    const quiz = [...quizzes.values()].find(
      (item) => item.chapterId === chapterId,
    );

    if (!quiz) {
      return null;
    }

    return {
      ...quiz,
      questions: [...questions.values()]
        .filter((question) => question.quizId === quiz.id)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((question) => ({
          ...question,
          options: [...options.values()]
            .filter((option) => option.questionId === question.id)
            .sort((left, right) => left.sortOrder - right.sortOrder),
        })),
    };
  };

  const getAttemptDetail = (attemptId: string, userId: string) => {
    const attempt = attempts.get(attemptId);

    if (!attempt || attempt.userId !== userId) {
      return null;
    }

    const quiz = quizzes.get(attempt.quizId);

    if (!quiz) {
      return null;
    }

    const attemptAnswers = [...answers.values()]
      .filter((answer) => answer.attemptId === attempt.id)
      .map((answer) => {
        const question = questions.get(answer.questionId);

        if (!question) {
          throw new Error('Question not found');
        }

        return {
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: answer.isCorrect,
          scoreAwarded: answer.scoreAwarded,
          question: {
            type: question.type,
            content: question.content,
            explanation: question.explanation,
            score: question.score,
            sortOrder: question.sortOrder,
            options: [...options.values()]
              .filter((option) => option.questionId === question.id)
              .sort((left, right) => left.sortOrder - right.sortOrder),
          },
        };
      });

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      score: attempt.score,
      totalScore: attempt.totalScore,
      passed: attempt.passed,
      submittedAt: attempt.submittedAt,
      quiz: {
        chapterId: quiz.chapterId,
        passScorePercent: quiz.passScorePercent,
      },
      answers: attemptAnswers,
    };
  };

  const getWrongRows = (userId: string) =>
    [...answers.values()]
      .filter((answer) => !answer.isCorrect)
      .map((answer) => {
        const attempt = attempts.get(answer.attemptId);
        const question = questions.get(answer.questionId);
        const quiz = question ? quizzes.get(question.quizId) : null;
        const chapter = quiz ? chapters.get(quiz.chapterId) : null;
        const course = chapter ? courses.get(chapter.courseId) : null;

        if (
          !attempt ||
          attempt.userId !== userId ||
          !question ||
          !quiz ||
          !chapter ||
          !course
        ) {
          return null;
        }

        return {
          answer,
          attempt,
          question,
          quiz,
          chapter,
          course,
        };
      })
      .filter(
        (
          row,
        ): row is {
          answer: QuizAnswerRecord;
          attempt: QuizAttemptRecord;
          question: QuizQuestionRecord;
          quiz: QuizRecord;
          chapter: ChapterRecord;
          course: CourseRecord;
        } => row !== null,
      );

  const getGroupedWrongRows = (
    userId: string,
    filters: { courseId?: string; chapterId?: string },
  ) => {
    const rows = getWrongRows(userId).filter((row) => {
      if (filters.courseId && row.course.id !== filters.courseId) {
        return false;
      }

      if (filters.chapterId && row.chapter.id !== filters.chapterId) {
        return false;
      }

      return true;
    });

    const grouped = new Map<
      string,
      { questionId: string; wrongCount: number; lastWrongAt: Date }
    >();

    for (const row of rows) {
      const current = grouped.get(row.question.id);
      const lastWrongAt = row.attempt.submittedAt;

      if (!current) {
        grouped.set(row.question.id, {
          questionId: row.question.id,
          wrongCount: 1,
          lastWrongAt,
        });
        continue;
      }

      current.wrongCount += 1;
      if (lastWrongAt > current.lastWrongAt) {
        current.lastWrongAt = lastWrongAt;
      }
    }

    return [...grouped.values()].sort((left, right) => {
      const diff = right.lastWrongAt.getTime() - left.lastWrongAt.getTime();

      if (diff !== 0) {
        return diff;
      }

      return left.questionId.localeCompare(right.questionId);
    });
  };

  const prisma = {
    course: {
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        const course = courses.get(where.id);

        if (!course) {
          return null;
        }

        if (where.status !== undefined && course.status !== where.status) {
          return null;
        }

        if (
          Object.prototype.hasOwnProperty.call(where, 'deletedAt') &&
          course.deletedAt !== where.deletedAt
        ) {
          return null;
        }

        return { id: course.id };
      }),
    },
    courseChapter: {
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        if (where.courseId !== undefined) {
          const chapter = getPublishedChapters(where.courseId)[0];
          return chapter ? { id: chapter.id } : null;
        }

        const chapter = chapters.get(where.id);

        if (!chapter) {
          return null;
        }

        const course = courses.get(chapter.courseId);

        if (where.status !== undefined && chapter.status !== where.status) {
          return null;
        }

        if (
          Object.prototype.hasOwnProperty.call(where, 'deletedAt') &&
          chapter.deletedAt !== where.deletedAt
        ) {
          return null;
        }

        if (
          where.course &&
          (!course ||
            course.status !== where.course.status ||
            course.deletedAt !== where.course.deletedAt)
        ) {
          return null;
        }

        return {
          id: chapter.id,
          courseId: chapter.courseId,
        };
      }),
      findMany: jest.fn(async ({ where }: { where: any }) => {
        return getPublishedChapters(where.courseId).map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          sortOrder: chapter.sortOrder,
        }));
      }),
      count: jest.fn(async ({ where }: { where: any }) => {
        return getPublishedChapters(where.courseId).length;
      }),
    },
    courseLearningRecord: {
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        return (
          courseLearningRecords.get(
            courseKey(
              where.userId_courseId.userId,
              where.userId_courseId.courseId,
            ),
          ) ?? null
        );
      }),
      findMany: jest.fn(
        async ({
          where,
          skip,
          take,
        }: {
          where: any;
          skip?: number;
          take?: number;
        }) => {
          return [...courseLearningRecords.values()]
            .filter((record) => {
              const course = courses.get(record.courseId);

              return (
                record.userId === where.userId &&
                (where.status === undefined ||
                  record.status === where.status) &&
                course?.status === where.course.status &&
                course?.deletedAt === where.course.deletedAt
              );
            })
            .sort((left, right) => {
              const leftTime = left.lastLearnedAt?.getTime() ?? 0;
              const rightTime = right.lastLearnedAt?.getTime() ?? 0;

              if (leftTime !== rightTime) {
                return rightTime - leftTime;
              }

              return right.updatedAt.getTime() - left.updatedAt.getTime();
            })
            .slice(skip ?? 0, (skip ?? 0) + (take ?? Number.MAX_SAFE_INTEGER))
            .map((record) => {
              const course = courses.get(record.courseId);
              const lastChapter = record.lastChapterId
                ? chapters.get(record.lastChapterId)
                : null;

              return {
                ...record,
                course: {
                  title: course?.title ?? '',
                  coverUrl: course?.coverUrl ?? null,
                },
                lastChapter: lastChapter
                  ? {
                      id: lastChapter.id,
                      title: lastChapter.title,
                      status: lastChapter.status,
                      deletedAt: lastChapter.deletedAt,
                    }
                  : null,
              };
            });
        },
      ),
      count: jest.fn(async ({ where }: { where: any }) => {
        return [...courseLearningRecords.values()].filter((record) => {
          const course = courses.get(record.courseId);

          return (
            record.userId === where.userId &&
            (where.status === undefined || record.status === where.status) &&
            course?.status === where.course.status &&
            course?.deletedAt === where.course.deletedAt
          );
        }).length;
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const record: CourseLearningRecord = {
          id: data.id ?? randomUUID(),
          userId: data.userId,
          courseId: data.courseId,
          status: data.status,
          completedChapterCount: data.completedChapterCount,
          totalChapterCountSnapshot: data.totalChapterCountSnapshot,
          progressPercent:
            data.progressPercent instanceof Prisma.Decimal
              ? data.progressPercent
              : new Prisma.Decimal(data.progressPercent),
          lastChapterId: data.lastChapterId ?? null,
          startedAt: data.startedAt ?? now,
          lastLearnedAt: data.lastLearnedAt ?? null,
          completedAt: data.completedAt ?? null,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
        };

        courseLearningRecords.set(
          courseKey(record.userId, record.courseId),
          record,
        );
        return record;
      }),
      update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
        const key = courseKey(
          where.userId_courseId.userId,
          where.userId_courseId.courseId,
        );
        const existing = courseLearningRecords.get(key);

        if (!existing) {
          throw new Error('Course learning record not found');
        }

        const updated = {
          ...existing,
          ...data,
          progressPercent:
            data.progressPercent === undefined
              ? existing.progressPercent
              : data.progressPercent instanceof Prisma.Decimal
                ? data.progressPercent
                : new Prisma.Decimal(data.progressPercent),
          updatedAt: new Date(),
        };

        courseLearningRecords.set(key, updated);
        return updated;
      }),
      updateMany: jest.fn(
        async ({ where, data }: { where: any; data: any }) => {
          const key = courseKey(where.userId, where.courseId);
          const existing = courseLearningRecords.get(key);

          if (!existing) {
            return { count: 0 };
          }

          courseLearningRecords.set(key, {
            ...existing,
            ...data,
          });
          return { count: 1 };
        },
      ),
    },
    chapterLearningRecord: {
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        return (
          chapterLearningRecords.get(
            chapterKey(
              where.userId_chapterId.userId,
              where.userId_chapterId.chapterId,
            ),
          ) ?? null
        );
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const record: ChapterLearningRecord = {
          id: data.id ?? randomUUID(),
          userId: data.userId,
          courseId: data.courseId,
          chapterId: data.chapterId,
          status: data.status,
          firstStartedAt: data.firstStartedAt ?? now,
          lastLearnedAt: data.lastLearnedAt ?? now,
          completedAt: data.completedAt ?? null,
          quizCompleted: data.quizCompleted ?? false,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
        };

        chapterLearningRecords.set(
          chapterKey(record.userId, record.chapterId),
          record,
        );
        return record;
      }),
      update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
        const key = chapterKey(
          where.userId_chapterId.userId,
          where.userId_chapterId.chapterId,
        );
        const existing = chapterLearningRecords.get(key);

        if (!existing) {
          throw new Error('Chapter learning record not found');
        }

        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };

        chapterLearningRecords.set(key, updated);
        return updated;
      }),
      count: jest.fn(async ({ where }: { where: any }) => {
        return [...chapterLearningRecords.values()].filter((record) => {
          const chapter = chapters.get(record.chapterId);

          return (
            record.userId === where.userId &&
            record.courseId === where.courseId &&
            record.status === where.status &&
            chapter?.status === where.chapter.status &&
            chapter?.deletedAt === where.chapter.deletedAt
          );
        }).length;
      }),
    },
    quiz: {
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        return getQuizByChapterId(where.chapterId);
      }),
      count: jest.fn(async ({ where }: { where: any }) => {
        return [...quizzes.values()].filter(
          (quiz) =>
            quiz.chapterId === where.chapterId && quiz.status === where.status,
        ).length;
      }),
    },
    quizQuestion: {
      findMany: jest.fn(async ({ where }: { where: any }) => {
        const questionIds = Array.isArray(where.id.in)
          ? (where.id.in as string[])
          : [];

        return [...questions.values()]
          .filter((question) => questionIds.includes(question.id))
          .map((question) => {
            const quiz = quizzes.get(question.quizId);
            const chapter = quiz ? chapters.get(quiz.chapterId) : null;
            const course = chapter ? courses.get(chapter.courseId) : null;

            if (!quiz || !chapter || !course) {
              return null;
            }

            return {
              id: question.id,
              type: question.type,
              content: question.content,
              explanation: question.explanation,
              options: [...options.values()]
                .filter((option) => option.questionId === question.id)
                .sort((left, right) => left.sortOrder - right.sortOrder),
              quiz: {
                chapterId: chapter.id,
                chapter: {
                  title: chapter.title,
                  courseId: course.id,
                  course: {
                    title: course.title,
                  },
                },
              },
            };
          })
          .filter(Boolean);
      }),
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        const question = questions.get(where.id);

        if (!question) {
          return null;
        }

        const quiz = quizzes.get(question.quizId);
        const chapter = quiz ? chapters.get(quiz.chapterId) : null;
        const course = chapter ? courses.get(chapter.courseId) : null;

        if (!quiz || !chapter || !course) {
          return null;
        }

        return {
          id: question.id,
          type: question.type,
          content: question.content,
          explanation: question.explanation,
          options: [...options.values()]
            .filter((option) => option.questionId === question.id)
            .sort((left, right) => left.sortOrder - right.sortOrder),
          quiz: {
            chapterId: chapter.id,
            chapter: {
              title: chapter.title,
              courseId: course.id,
              course: {
                title: course.title,
              },
            },
          },
        };
      }),
    },
    quizAttempt: {
      count: jest.fn(async ({ where }: { where: any }) => {
        return [...attempts.values()].filter(
          (attempt) =>
            attempt.userId === where.userId &&
            attempt.quizId === where.quizId &&
            (where.passed === undefined || attempt.passed === where.passed),
        ).length;
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        const attempt: QuizAttemptRecord = {
          id: data.id ?? randomUUID(),
          userId: data.userId,
          quizId: data.quizId,
          score: data.score,
          totalScore: data.totalScore,
          passed: data.passed,
          submittedAt: data.submittedAt,
          createdAt: data.submittedAt,
        };

        attempts.set(attempt.id, attempt);
        return {
          id: attempt.id,
          quizId: attempt.quizId,
        };
      }),
      findMany: jest.fn(async ({ where }: { where: any }) => {
        return [...attempts.values()]
          .filter(
            (attempt) =>
              attempt.userId === where.userId &&
              attempt.quizId === where.quizId,
          )
          .sort((left, right) => {
            const submittedDiff =
              right.submittedAt.getTime() - left.submittedAt.getTime();

            if (submittedDiff !== 0) {
              return submittedDiff;
            }

            return right.createdAt.getTime() - left.createdAt.getTime();
          });
      }),
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        if (where.id) {
          return getAttemptDetail(where.id, where.userId);
        }

        return (
          [...attempts.values()].find(
            (attempt) =>
              attempt.userId === where.userId &&
              attempt.quizId === where.quizId &&
              attempt.passed === where.passed,
          ) ?? null
        );
      }),
    },
    quizAnswer: {
      createMany: jest.fn(async ({ data }: { data: any }) => {
        for (const item of data as Array<Record<string, unknown>>) {
          const answerId = typeof item.id === 'string' ? item.id : randomUUID();

          answers.set(answerId, {
            id: answerId,
            attemptId: item.attemptId as string,
            questionId: item.questionId as string,
            selectedOptionId: item.selectedOptionId as string,
            isCorrect: item.isCorrect as boolean,
            scoreAwarded: item.scoreAwarded as number,
            createdAt: item.createdAt as Date,
          });
        }

        return { count: data.length };
      }),
    },
    $queryRaw: jest.fn(async (query: { text?: string; values?: unknown[] }) => {
      const text = query.text ?? '';
      const values = query.values ?? [];

      const parseFilters = () => {
        let cursor = 1;
        let courseId: string | undefined;
        let chapterId: string | undefined;

        if (text.includes('chapter.course_id =')) {
          courseId = values[cursor] as string;
          cursor += 1;
        }

        if (text.includes('quiz.chapter_id =')) {
          chapterId = values[cursor] as string;
          cursor += 1;
        }

        return {
          userId: values[0] as string,
          courseId,
          chapterId,
          cursor,
        };
      };

      if (
        text.includes(
          'COUNT(DISTINCT qa.question_id)::int AS "totalWrongQuestions"',
        )
      ) {
        const userId = values[0] as string;
        const rows = getWrongRows(userId);

        return [
          {
            totalWrongQuestions: new Set(rows.map((row) => row.question.id))
              .size,
            totalWrongAnswers: rows.length,
            courseCount: new Set(rows.map((row) => row.course.id)).size,
            latestWrongAt:
              rows.length === 0
                ? null
                : rows
                    .map((row) => row.attempt.submittedAt)
                    .sort((left, right) => right.getTime() - left.getTime())[0],
          },
        ];
      }

      if (text.includes('FROM (') && text.includes('GROUP BY qa.question_id')) {
        const { userId, courseId, chapterId } = parseFilters();
        const grouped = getGroupedWrongRows(userId, {
          courseId,
          chapterId,
        });

        return [
          {
            total: grouped.length,
          },
        ];
      }

      if (text.includes('qa.question_id AS "questionId"')) {
        const { userId, courseId, chapterId, cursor } = parseFilters();
        const grouped = getGroupedWrongRows(userId, {
          courseId,
          chapterId,
        });

        const skip = Number(values[cursor]);
        const limit = Number(values[cursor + 1]);
        const rows =
          Number.isFinite(skip) && Number.isFinite(limit)
            ? grouped.slice(skip, skip + limit)
            : grouped;

        return rows.map((row) => ({
          questionId: row.questionId,
          wrongCount: row.wrongCount,
          lastWrongAt: row.lastWrongAt,
        }));
      }

      if (text.includes('FROM practice_answers answer')) {
        return [];
      }

      if (text.includes('qa.question_id = ${questionId}')) {
        // This branch is not used because Prisma compiles to placeholders.
        return [];
      }

      if (
        text.includes('GROUP BY qa.question_id') &&
        text.includes('qa.question_id =')
      ) {
        const userId = values[0] as string;
        const questionId = values[1] as string;
        const rows = getWrongRows(userId).filter(
          (row) => row.question.id === questionId,
        );

        return rows.length === 0
          ? []
          : [
              {
                wrongCount: rows.length,
                lastWrongAt: rows
                  .map((row) => row.attempt.submittedAt)
                  .sort((left, right) => right.getTime() - left.getTime())[0],
              },
            ];
      }

      throw new Error(`Unexpected raw query: ${text}`);
    }),
    $transaction: jest.fn(
      async (callback: (client: any) => Promise<unknown>) =>
        callback(prisma),
    ),
  };

  return {
    prisma,
    courses,
    chapters,
    courseLearningRecords,
    chapterLearningRecords,
    quizzes,
    questions,
    options,
    attempts,
    answers,
  };
}

function seedWrongQuestionCourse(mock: ReturnType<typeof createMockPrisma>) {
  const courseId = '11111111-1111-4111-8111-111111111111';
  const otherCourseId = '22222222-2222-4222-8222-222222222222';
  const chapterId = '33333333-3333-4333-8333-333333333331';
  const otherChapterId = '33333333-3333-4333-8333-333333333332';
  const quizId = '44444444-4444-4444-8444-444444444444';
  const questionOneId = '55555555-5555-4555-8555-555555555551';
  const questionTwoId = '55555555-5555-4555-8555-555555555552';
  const optionOneId = '66666666-6666-4666-8666-666666666661';
  const optionTwoId = '66666666-6666-4666-8666-666666666662';
  const optionThreeId = '66666666-6666-4666-8666-666666666663';
  const optionFourId = '66666666-6666-4666-8666-666666666664';

  mock.courses.set(courseId, {
    id: courseId,
    title: 'Python Basics',
    coverUrl: null,
    status: CourseStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.courses.set(otherCourseId, {
    id: otherCourseId,
    title: 'Other Course',
    coverUrl: null,
    status: CourseStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.chapters.set(chapterId, {
    id: chapterId,
    courseId,
    title: 'Variables',
    sortOrder: 1,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.chapters.set(otherChapterId, {
    id: otherChapterId,
    courseId: otherCourseId,
    title: 'Other Chapter',
    sortOrder: 1,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.quizzes.set(quizId, {
    id: quizId,
    chapterId,
    title: 'Variables Quiz',
    description: 'Basic chapter quiz',
    passScorePercent: 60,
    status: QuizStatus.PUBLISHED,
  });
  mock.questions.set(questionOneId, {
    id: questionOneId,
    quizId,
    type: QuestionType.SINGLE_CHOICE,
    content: 'Which function prints text in Python?',
    explanation: 'print() writes text to standard output.',
    score: 20,
    sortOrder: 1,
  });
  mock.questions.set(questionTwoId, {
    id: questionTwoId,
    quizId,
    type: QuestionType.TRUE_FALSE,
    content: 'Python is case-sensitive.',
    explanation: 'Python treats Name and name as different identifiers.',
    score: 20,
    sortOrder: 2,
  });
  mock.options.set(optionOneId, {
    id: optionOneId,
    questionId: questionOneId,
    content: 'print()',
    isCorrect: true,
    sortOrder: 1,
  });
  mock.options.set(optionTwoId, {
    id: optionTwoId,
    questionId: questionOneId,
    content: 'echo()',
    isCorrect: false,
    sortOrder: 2,
  });
  mock.options.set(optionThreeId, {
    id: optionThreeId,
    questionId: questionTwoId,
    content: 'TRUE',
    isCorrect: true,
    sortOrder: 1,
  });
  mock.options.set(optionFourId, {
    id: optionFourId,
    questionId: questionTwoId,
    content: 'FALSE',
    isCorrect: false,
    sortOrder: 2,
  });

  return {
    courseId,
    otherCourseId,
    chapterId,
    otherChapterId,
    quizId,
    questionOneId,
    questionTwoId,
    optionOneId,
    optionTwoId,
    optionThreeId,
    optionFourId,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Wrong question flow (e2e)', () => {
  let app: INestApplication<App>;
  let mockState: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockState = createMockPrisma();
    const authServiceMock = {
      validateAccessToken: jest.fn(async (token: string) => {
        if (token === USER_A_TOKEN) {
          return USER_A;
        }

        if (token === USER_B_TOKEN) {
          return USER_B;
        }

        if (token === DELETED_USER_TOKEN) {
          throw new ForbiddenException('USER_DELETED');
        }

        if (token === REVOKED_SESSION_TOKEN) {
          throw new UnauthorizedException('SESSION_REVOKED');
        }

        throw new Error('ACCESS_TOKEN_INVALID');
      }),
      validateLogoutAccessToken: jest.fn(async (token: string) => {
        if (token === USER_A_TOKEN) {
          return USER_A;
        }

        if (token === USER_B_TOKEN) {
          return USER_B;
        }

        if (token === DELETED_USER_TOKEN) {
          throw new ForbiddenException('USER_DELETED');
        }

        if (token === REVOKED_SESSION_TOKEN) {
          throw new UnauthorizedException('SESSION_REVOKED');
        }

        throw new Error('ACCESS_TOKEN_INVALID');
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockState.prisma)
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('covers the aggregated wrong-question workflow with user isolation', async () => {
    const {
      chapterId,
      quizId,
      questionOneId,
      questionTwoId,
      optionOneId,
      optionTwoId,
      optionThreeId,
      optionFourId,
    } = seedWrongQuestionCourse(mockState);

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${chapterId}/quiz`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.questions[0]).not.toHaveProperty(
          'correctOptionId',
        );
        expect(response.body.data.questions[0].explanation).toBe(
          'print() writes text to standard output.',
        );
        expect(response.body.data.questions[0].explanationBlocks).toEqual([
          {
            type: 'TEXT',
            text: 'print() writes text to standard output.',
          },
        ]);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterId}/start`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterId}/quiz/submit`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        answers: [
          { questionId: questionOneId, selectedOptionId: optionTwoId },
          { questionId: questionTwoId, selectedOptionId: optionFourId },
        ],
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.data.passed).toBe(false);
      });

    await delay(10);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterId}/quiz/submit`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        answers: [
          { questionId: questionOneId, selectedOptionId: optionTwoId },
          { questionId: questionTwoId, selectedOptionId: optionThreeId },
        ],
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.data.passed).toBe(false);
      });

    await delay(10);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterId}/quiz/submit`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        answers: [
          { questionId: questionOneId, selectedOptionId: optionOneId },
          { questionId: questionTwoId, selectedOptionId: optionThreeId },
        ],
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.data.passed).toBe(true);
      });

    mockState.quizzes.get(quizId)!.status = QuizStatus.DISABLED;

    await request(app.getHttpServer())
      .get('/api/v1/users/me/wrong-questions')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(2);
        expect(response.body.data.items[0].questionId).toBe(questionOneId);
        expect(response.body.data.items[0].wrongCount).toBe(2);
        expect(response.body.data.items[1].questionId).toBe(questionTwoId);
        expect(response.body.data.items[1].wrongCount).toBe(1);
        expect(response.body.data.items[0]).not.toHaveProperty(
          'correctOptionId',
        );
        expect(response.body.data.items[0]).not.toHaveProperty('explanation');
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/wrong-questions/statistics')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.totalWrongQuestions).toBe(2);
        expect(response.body.data.totalWrongAnswers).toBe(3);
        expect(response.body.data.courseCount).toBe(1);
        expect(response.body.data.latestWrongAt).toBeDefined();
      });

    await request(app.getHttpServer())
      .get(`/api/v1/users/me/wrong-questions/${questionOneId}`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.questionId).toBe(questionOneId);
        expect(response.body.data.correctOptionId).toBe(optionOneId);
        expect(response.body.data.explanation).toBe(
          'print() writes text to standard output.',
        );
        expect(response.body.data.options).toEqual([
          {
            optionId: optionOneId,
            content: 'print()',
            order: 1,
          },
          {
            optionId: optionTwoId,
            content: 'echo()',
            order: 2,
          },
        ]);
      });

    await request(app.getHttpServer())
      .get(
        '/api/v1/users/me/wrong-questions?courseId=11111111-1111-4111-8111-111111111111',
      )
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(2);
      });

    await request(app.getHttpServer())
      .get(
        '/api/v1/users/me/wrong-questions?courseId=22222222-2222-4222-8222-222222222222&chapterId=33333333-3333-4333-8333-333333333331',
      )
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(400)
      .expect((response) => {
        expect(response.body.message).toBe('WRONG_QUESTION_FILTER_MISMATCH');
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/wrong-questions?page=0')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/wrong-questions?pageSize=51')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/wrong-questions')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(0);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/users/me/wrong-questions/${questionOneId}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(404)
      .expect((response) => {
        expect(response.body.message).toBe('WRONG_QUESTION_NOT_FOUND');
      });

    await request(app.getHttpServer())
      .get('/api/v1/wrong-questions')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(
        '/api/v1/wrong-questions/11111111-1111-4111-8111-111111111111/practice',
      )
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(
        '/api/v1/wrong-questions/11111111-1111-4111-8111-111111111111/status',
      )
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(404);

    await request(app.getHttpServer())
      .get('/api/v1/learning/progress')
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/v1/chapters/${chapterId}/progress`)
      .expect(404);

    expect(mockState.answers.size).toBe(6);
    expect(
      [...mockState.answers.values()].filter((answer) => !answer.isCorrect)
        .length,
    ).toBe(3);
    expect(mockState.attempts.size).toBe(3);
    expect(mockState.courseLearningRecords.size).toBe(1);
    expect(mockState.chapterLearningRecords.size).toBe(1);
    expect(mockState.quizzes.get(quizId)?.status).toBe(QuizStatus.DISABLED);
  });

  it('rejects unauthorized, deleted, and revoked users on wrong-question routes', async () => {
    const { chapterId, questionOneId } = seedWrongQuestionCourse(mockState);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/wrong-questions')
      .expect(401);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/wrong-questions/statistics')
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/wrong-questions/statistics')
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('SESSION_REVOKED');
      });

    await request(app.getHttpServer())
      .get(
        '/api/v1/users/me/wrong-questions/11111111-1111-4111-8111-111111111111',
      )
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(404);

    await request(app.getHttpServer())
      .get(`/api/v1/users/me/wrong-questions/${questionOneId}`)
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/users/me/wrong-questions/${questionOneId}`)
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('SESSION_REVOKED');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${chapterId}/quiz`)
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${chapterId}/quiz`)
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .expect(401);
  });
});
