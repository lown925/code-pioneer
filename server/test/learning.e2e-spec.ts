/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { Prisma } from '../generated/prisma/client';
import {
  ChapterStatus,
  CourseStatus,
  LearningStatus,
} from '../generated/prisma/enums';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { PrismaService } from './../src/prisma/prisma.service';
import { QuizService } from './../src/quiz/quiz.service';

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
  isSelected: boolean;
  selectedAt: Date | null;
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

type QuizAttemptRecord = {
  id: string;
  userId: string;
  quizId: string;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
  }>;
};

const CURRENT_USER = {
  id: '99999999-9999-4999-8999-999999999999',
  sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};
const ACCESS_TOKEN = 'test-access-token';

function createMockPrisma() {
  const courses = new Map<string, CourseRecord>();
  const chapters = new Map<string, ChapterRecord>();
  const courseLearningRecords = new Map<string, CourseLearningRecord>();
  const chapterLearningRecords = new Map<string, ChapterLearningRecord>();
  const quizAttempts = new Map<string, QuizAttemptRecord>();

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

          return chapter
            ? {
                id: chapter.id,
              }
            : null;
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
          quiz: null,
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
                (where.isSelected === undefined ||
                  record.isSelected === where.isSelected) &&
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
          isSelected: data.isSelected ?? true,
          selectedAt: data.selectedAt ?? null,
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

        const updated: CourseLearningRecord = {
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
      updateMany: jest.fn(async ({ where, data }: { where: any; data: any }) => {
        const key = courseKey(where.userId, where.courseId);
        const existing = courseLearningRecords.get(key);

        if (!existing || existing.isSelected !== where.isSelected) {
          return { count: 0 };
        }

        courseLearningRecords.set(key, {
          ...existing,
          ...data,
          updatedAt: new Date(),
        });

        return { count: 1 };
      }),
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
      findMany: jest.fn(async ({ where }: { where: any }) => {
        return [...chapterLearningRecords.values()].filter((record) => {
          const chapter = chapters.get(record.chapterId);

          return (
            record.userId === where.userId &&
            record.courseId === where.courseId &&
            chapter?.status === where.chapter.status &&
            chapter?.deletedAt === where.chapter.deletedAt
          );
        });
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

        const updated: ChapterLearningRecord = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };

        chapterLearningRecords.set(key, updated);
        return updated;
      }),
    },
    quizAttempt: {
      findMany: jest.fn(async ({ where }: { where: any }) => {
        return [...quizAttempts.values()]
          .filter((attempt) => attempt.userId === where.userId)
          .map((attempt) => ({
            answers: attempt.answers,
          }));
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
    quizAttempts,
  };
}

function seedCourses(mock: ReturnType<typeof createMockPrisma>) {
  const courseOneId = '11111111-1111-4111-8111-111111111111';
  const courseTwoId = '11111111-1111-4111-8111-111111111112';
  const chapterOneId = '22222222-2222-4222-8222-222222222221';
  const chapterTwoId = '22222222-2222-4222-8222-222222222222';
  const chapterThreeId = '22222222-2222-4222-8222-222222222223';

  mock.courses.set(courseOneId, {
    id: courseOneId,
    title: 'Python Basics',
    coverUrl: null,
    status: CourseStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.courses.set(courseTwoId, {
    id: courseTwoId,
    title: 'JS Basics',
    coverUrl: 'https://cdn.example.com/js.png',
    status: CourseStatus.PUBLISHED,
    deletedAt: null,
  });

  mock.chapters.set(chapterOneId, {
    id: chapterOneId,
    courseId: courseOneId,
    title: 'Intro',
    sortOrder: 1,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.chapters.set(chapterTwoId, {
    id: chapterTwoId,
    courseId: courseOneId,
    title: 'Variables',
    sortOrder: 2,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.chapters.set(chapterThreeId, {
    id: chapterThreeId,
    courseId: courseTwoId,
    title: 'Syntax',
    sortOrder: 1,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });

  return {
    courseOneId,
    courseTwoId,
    chapterOneId,
    chapterTwoId,
    chapterThreeId,
  };
}

describe('Learning flow (e2e)', () => {
  let app: INestApplication<App>;
  let mockState: ReturnType<typeof createMockPrisma>;

  beforeAll(async () => {
    mockState = createMockPrisma();
    seedCourses(mockState);

    const authServiceMock = {
      validateAccessToken: jest.fn(async (token: string) => {
        if (token !== ACCESS_TOKEN) {
          throw new Error('ACCESS_TOKEN_INVALID');
        }

        return CURRENT_USER;
      }),
      validateLogoutAccessToken: jest.fn(async (token: string) => {
        if (token !== ACCESS_TOKEN) {
          throw new Error('ACCESS_TOKEN_INVALID');
        }

        return CURRENT_USER;
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockState.prisma)
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .overrideProvider(QuizService)
      .useValue({
        getChapterQuizRequirement: jest.fn(async () => ({ kind: 'NONE' })),
      })
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

  it('returns stable not-started progress and keeps unsupported routes unavailable', async () => {
    const courseId = '11111111-1111-4111-8111-111111111111';

    await request(app.getHttpServer())
      .get(`/api/v1/courses/${courseId}/progress`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(LearningStatus.NOT_STARTED);
        expect(response.body.data.progressPercent).toBe(0);
        expect(response.body.data.completedChapterCount).toBe(0);
        expect(response.body.data.totalChapterCount).toBe(2);
        expect(response.body.data.chapters[0].hasQuiz).toBe(false);
        expect(response.body.data.chapters[0].quizCompleted).toBe(false);
      });

    expect(mockState.courseLearningRecords.size).toBe(0);
    expect(mockState.chapterLearningRecords.size).toBe(0);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect({
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
          },
        },
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning-summary')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual({
          success: true,
          data: {
            inProgressCourseCount: 0,
            completedCourseCount: 0,
            completedChapterCount: 0,
            totalQuizAnswerCount: 0,
            quizAccuracyPercent: 0,
            learningWrongQuestionCount: 0,
            continueLearningCourse: null,
          },
        });
      });

    await request(app.getHttpServer())
      .get('/api/v1/learning/progress')
      .expect(404);

    await request(app.getHttpServer())
      .patch('/api/v1/chapters/22222222-2222-4222-8222-222222222221/progress')
      .expect(404);
  });

  it('supports start, complete, idempotency, pagination, and sorting contracts', async () => {
    const courseOneId = '11111111-1111-4111-8111-111111111111';
    const courseTwoId = '11111111-1111-4111-8111-111111111112';
    const chapterOneId = '22222222-2222-4222-8222-222222222221';
    const chapterTwoId = '22222222-2222-4222-8222-222222222222';
    const chapterThreeId = '22222222-2222-4222-8222-222222222223';
    const firstCourseKey = `${CURRENT_USER.id}:${courseOneId}`;
    const firstChapterKey = `${CURRENT_USER.id}:${chapterOneId}`;
    const secondCourseKey = `${CURRENT_USER.id}:${courseTwoId}`;

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning?pageSize=51')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning?status=NOT_STARTED')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(400);

    await request(app.getHttpServer())
      .post(`/api/v1/courses/${courseOneId}/start`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.chapterId).toBe(chapterOneId);
        expect(response.body.data.alreadyStarted).toBe(false);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/courses/${courseOneId}/start`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.alreadyStarted).toBe(true);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterThreeId}/complete`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(400)
      .expect((response) => {
        expect(response.body.message).toBe('CHAPTER_NOT_STARTED');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterOneId}/start`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.chapterStatus).toBe(LearningStatus.LEARNING);
        expect(response.body.data.nextChapterId).toBe(chapterTwoId);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterOneId}/start`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200);

    expect(mockState.courseLearningRecords.size).toBe(1);
    expect(mockState.chapterLearningRecords.size).toBe(1);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterOneId}/complete`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.chapterStatus).toBe(LearningStatus.COMPLETED);
        expect(response.body.data.courseProgressPercent).toBe(50);
        expect(response.body.data.nextChapterId).toBe(chapterTwoId);
      });

    const firstCompletedAt =
      mockState.chapterLearningRecords.get(firstChapterKey)?.completedAt ??
      null;

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterOneId}/complete`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200);

    expect(
      mockState.chapterLearningRecords.get(firstChapterKey)?.completedAt,
    ).toBe(firstCompletedAt);
    expect(
      mockState.courseLearningRecords.get(firstCourseKey)
        ?.completedChapterCount,
    ).toBe(1);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterTwoId}/start`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterTwoId}/complete`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.courseProgressPercent).toBe(100);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/chapters/${chapterThreeId}/start`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200);

    const secondCourseRecord =
      mockState.courseLearningRecords.get(secondCourseKey);
    if (!secondCourseRecord) {
      throw new Error('Second course learning record was not created');
    }
    secondCourseRecord.lastLearnedAt = new Date('2026-07-20T12:00:00.000Z');
    secondCourseRecord.updatedAt = new Date('2026-07-20T12:00:00.000Z');
    secondCourseRecord.lastChapterId = chapterThreeId;
    mockState.courseLearningRecords.set(secondCourseKey, secondCourseRecord);

    const firstCourseRecord =
      mockState.courseLearningRecords.get(firstCourseKey);
    if (!firstCourseRecord) {
      throw new Error('First course learning record was not created');
    }
    firstCourseRecord.lastLearnedAt = new Date('2026-07-20T11:00:00.000Z');
    firstCourseRecord.updatedAt = new Date('2026-07-20T11:00:00.000Z');
    mockState.courseLearningRecords.set(firstCourseKey, firstCourseRecord);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning?page=1&pageSize=1')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].courseId).toBe(courseTwoId);
        expect(response.body.data.pagination).toEqual({
          page: 1,
          pageSize: 1,
          total: 2,
          totalPages: 2,
        });
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning?status=COMPLETED')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].courseId).toBe(courseOneId);
        expect(response.body.data.items[0].progressPercent).toBe(100);
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/courses/${courseTwoId}/selection`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toEqual({
          courseId: courseTwoId,
          selected: false,
          alreadyDeselected: false,
          progressPreserved: true,
        });
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].courseId).toBe(courseOneId);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/courses/${courseTwoId}/selection`)
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toEqual(
          expect.objectContaining({
            courseId: courseTwoId,
            selected: true,
            alreadySelected: false,
            progressPreserved: true,
          }),
        );
      });

    expect(
      mockState.courseLearningRecords.get(secondCourseKey)?.lastChapterId,
    ).toBe(chapterThreeId);

    mockState.quizAttempts.set('attempt-1', {
      id: 'attempt-1',
      userId: CURRENT_USER.id,
      quizId: 'quiz-1',
      answers: [
        {
          questionId: 'question-1',
          isCorrect: true,
        },
        {
          questionId: 'question-2',
          isCorrect: false,
        },
      ],
    });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/learning-summary')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.inProgressCourseCount).toBe(1);
        expect(response.body.data.completedCourseCount).toBe(1);
        expect(response.body.data.completedChapterCount).toBe(2);
        expect(response.body.data.totalQuizAnswerCount).toBe(2);
        expect(response.body.data.quizAccuracyPercent).toBe(50);
        expect(response.body.data.learningWrongQuestionCount).toBe(1);
        expect(response.body.data.continueLearningCourse.courseId).toBe(
          courseTwoId,
        );
      });
  });
});
