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
  stemBlocks?: unknown;
  explanationBlocks?: unknown;
  score: number;
  sortOrder: number;
};

type QuizOptionRecord = {
  id: string;
  questionId: string;
  content: string;
  contentBlocks?: unknown;
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
            stemBlocks: question.stemBlocks ?? null,
            explanationBlocks: question.explanationBlocks ?? null,
            score: question.score,
            sortOrder: question.sortOrder,
            options: [...options.values()]
              .filter((option) => option.questionId === question.id)
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map((option) => ({
                ...option,
                contentBlocks: option.contentBlocks ?? null,
              })),
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

  const prisma = {
    course: {
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        const course = [...courses.values()].find(
          (item) =>
            item.id === where.id &&
            item.status === where.status &&
            item.deletedAt === where.deletedAt,
        );

        return course ?? null;
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

        if (
          chapter.status !== where.status ||
          chapter.deletedAt !== where.deletedAt ||
          !course ||
          course.status !== where.course.status ||
          course.deletedAt !== where.course.deletedAt
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
    quizAttempt: {
      count: jest.fn(async ({ where }: { where: any }) => {
        return [...attempts.values()].filter(
          (attempt) =>
            attempt.userId === where.userId &&
            attempt.quizId === where.quizId &&
            (where.passed === undefined || attempt.passed === where.passed),
        ).length;
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
              (where.passed === undefined || attempt.passed === where.passed),
          ) ?? null
        );
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
    $transaction: jest.fn(async (callback: (client: any) => Promise<any>) =>
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

function seedQuizCourse(mock: ReturnType<typeof createMockPrisma>) {
  const courseId = '11111111-1111-4111-8111-111111111111';
  const introChapterId = '22222222-2222-4222-8222-222222222221';
  const quizChapterId = '22222222-2222-4222-8222-222222222222';
  const quizId = '33333333-3333-4333-8333-333333333333';
  const questionOneId = '44444444-4444-4444-8444-444444444441';
  const questionTwoId = '44444444-4444-4444-8444-444444444442';
  const optionOneId = '55555555-5555-4555-8555-555555555551';
  const optionTwoId = '55555555-5555-4555-8555-555555555552';
  const optionThreeId = '55555555-5555-4555-8555-555555555553';
  const optionFourId = '55555555-5555-4555-8555-555555555554';

  mock.courses.set(courseId, {
    id: courseId,
    title: 'Python Basics',
    coverUrl: null,
    status: CourseStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.chapters.set(introChapterId, {
    id: introChapterId,
    courseId,
    title: 'Intro',
    sortOrder: 1,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.chapters.set(quizChapterId, {
    id: quizChapterId,
    courseId,
    title: 'Variables',
    sortOrder: 2,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.quizzes.set(quizId, {
    id: quizId,
    chapterId: quizChapterId,
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
    stemBlocks: [
      {
        type: 'CODE',
        code: "print('Hello')",
        language: 'python',
      },
    ],
    explanationBlocks: [
      {
        type: 'TEXT',
        text: 'print() is the standard output function in Python.',
      },
    ],
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
    contentBlocks: [
      {
        type: 'CODE',
        code: 'print()',
        language: 'python',
      },
    ],
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
    introChapterId,
    quizChapterId,
    quizId,
    questionOneId,
    questionTwoId,
    optionOneId,
    optionTwoId,
    optionThreeId,
    optionFourId,
  };
}

describe('Quiz flow (e2e)', () => {
  let app: INestApplication<App>;
  let mockState: ReturnType<typeof createMockPrisma>;

  beforeAll(async () => {
    mockState = createMockPrisma();
    seedQuizCourse(mockState);

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

  afterAll(async () => {
    await app.close();
  });

  it('supports the full chapter quiz workflow with user isolation', async () => {
    const {
      quizChapterId,
      questionOneId,
      questionTwoId,
      optionOneId,
      optionTwoId,
      optionThreeId,
      optionFourId,
    } = seedQuizCourse(mockState);

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${quizChapterId}/quiz`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.hasPassed).toBe(false);
        expect(response.body.data.attemptCount).toBe(0);
        expect(response.body.data.questions[0]).not.toHaveProperty(
          'correctOptionId',
        );
        expect(response.body.data.questions[0]).not.toHaveProperty(
          'explanation',
        );
        expect(response.body.data.questions[0].stemBlocks).toEqual([
          {
            type: 'CODE',
            code: "print('Hello')",
            language: 'python',
          },
        ]);
      });

    expect(mockState.courseLearningRecords.size).toBe(0);
    expect(mockState.chapterLearningRecords.size).toBe(0);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/quiz/submit`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        answers: [
          { questionId: questionOneId, selectedOptionId: optionOneId },
          { questionId: questionTwoId, selectedOptionId: optionThreeId },
        ],
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.message).toBe('CHAPTER_NOT_STARTED');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/start`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200);

    const wrongAttempt = await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/quiz/submit`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        answers: [
          { questionId: questionOneId, selectedOptionId: optionTwoId },
          { questionId: questionTwoId, selectedOptionId: optionFourId },
        ],
      })
      .expect(200);

    expect(wrongAttempt.body.data.passed).toBe(false);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/complete`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.chapterStatus).toBe(LearningStatus.COMPLETED);
      });

    const correctAttempt = await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/quiz/submit`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        answers: [
          { questionId: questionOneId, selectedOptionId: optionOneId },
          { questionId: questionTwoId, selectedOptionId: optionThreeId },
        ],
      })
      .expect(200);

    expect(correctAttempt.body.data.passed).toBe(true);
    expect(correctAttempt.body.data.score).toBe(40);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/complete`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.chapterStatus).toBe(LearningStatus.COMPLETED);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${quizChapterId}/quiz/attempts`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(2);
        expect(response.body.data.items[0].passed).toBe(true);
        expect(response.body.data.items[1].passed).toBe(false);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/quiz-attempts/${correctAttempt.body.data.attemptId}`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.passed).toBe(true);
        expect(response.body.data.results[0]).toHaveProperty('correctOptionId');
        expect(response.body.data.results[0]).toHaveProperty('explanation');
        expect(response.body.data.results[0].explanationBlocks).toEqual([
          {
            type: 'TEXT',
            text: 'print() is the standard output function in Python.',
          },
        ]);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${quizChapterId}/quiz`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.hasPassed).toBe(false);
        expect(response.body.data.attemptCount).toBe(0);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/quiz-attempts/${correctAttempt.body.data.attemptId}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(404);

    await request(app.getHttpServer())
      .get('/api/v1/learning/progress')
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/v1/chapters/${quizChapterId}/progress`)
      .expect(404);
  });

  it('rejects deleted users on quiz routes and preserves existing quiz history', async () => {
    const { quizChapterId, quizId, questionOneId, optionOneId } =
      seedQuizCourse(mockState);
    const deletedUserId = '77777777-7777-4777-8777-777777777777';
    const attemptId = '99999999-1111-4111-8111-999999999999';

    mockState.attempts.set(attemptId, {
      id: attemptId,
      userId: deletedUserId,
      quizId,
      score: 20,
      totalScore: 40,
      passed: false,
      submittedAt: new Date('2026-07-20T12:00:00.000Z'),
      createdAt: new Date('2026-07-20T12:00:00.000Z'),
    });
    mockState.answers.set('deleted-answer-1', {
      id: 'deleted-answer-1',
      attemptId,
      questionId: questionOneId,
      selectedOptionId: optionOneId,
      isCorrect: true,
      scoreAwarded: 20,
      createdAt: new Date('2026-07-20T12:00:00.000Z'),
    });

    const attemptCountBefore = mockState.attempts.size;
    const answerCountBefore = mockState.answers.size;

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${quizChapterId}/quiz`)
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/quiz/submit`)
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .send({
        answers: [{ questionId: questionOneId, selectedOptionId: optionOneId }],
      })
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${quizChapterId}/quiz/attempts`)
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/quiz-attempts/${attemptId}`)
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/complete`)
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    expect(mockState.attempts.size).toBe(attemptCountBefore);
    expect(mockState.answers.size).toBe(answerCountBefore);
  });

  it('rejects revoked sessions on quiz routes', async () => {
    const { quizChapterId, questionOneId, optionOneId } =
      seedQuizCourse(mockState);
    const fakeAttemptId = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa';

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${quizChapterId}/quiz`)
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('SESSION_REVOKED');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/quiz/submit`)
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .send({
        answers: [{ questionId: questionOneId, selectedOptionId: optionOneId }],
      })
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('SESSION_REVOKED');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/chapters/${quizChapterId}/quiz/attempts`)
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('SESSION_REVOKED');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/quiz-attempts/${fakeAttemptId}`)
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('SESSION_REVOKED');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${quizChapterId}/complete`)
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .expect(401)
      .expect((response) => {
        expect(response.body.message).toBe('SESSION_REVOKED');
      });
  });
});
