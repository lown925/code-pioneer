/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '../../generated/prisma/client';
import {
  ChapterStatus,
  CourseStatus,
  LearningStatus,
} from '../../generated/prisma/enums';
import { LearningService } from './learning.service';

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

type QuizAttemptRecord = {
  id: string;
  userId: string;
  quizId: string;
  passed: boolean;
};

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
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        return (
          [...quizAttempts.values()].find(
            (attempt) =>
              attempt.userId === where.userId &&
              attempt.quizId === where.quizId &&
              attempt.passed === where.passed,
          ) ?? null
        );
      }),
    },
    $transaction: jest.fn(
      async <T>(callback: (client: any) => Promise<T>): Promise<T> =>
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

function seedPublishedCourse(mock: ReturnType<typeof createMockPrisma>) {
  const courseId = '11111111-1111-4111-8111-111111111111';
  const chapterOneId = '22222222-2222-4222-8222-222222222221';
  const chapterTwoId = '22222222-2222-4222-8222-222222222222';

  mock.courses.set(courseId, {
    id: courseId,
    title: 'Python Basics',
    coverUrl: null,
    status: CourseStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.chapters.set(chapterOneId, {
    id: chapterOneId,
    courseId,
    title: 'Intro',
    sortOrder: 1,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });
  mock.chapters.set(chapterTwoId, {
    id: chapterTwoId,
    courseId,
    title: 'Variables',
    sortOrder: 2,
    status: ChapterStatus.PUBLISHED,
    deletedAt: null,
  });

  return { courseId, chapterOneId, chapterTwoId };
}

describe('LearningService', () => {
  const currentUser = {
    id: '99999999-9999-4999-8999-999999999999',
    sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    tokenType: 'USER' as const,
    role: 'NORMAL' as const,
  };
  let quizServiceMock: {
    getChapterQuizRequirement: jest.Mock<
      Promise<{ kind: string; quizId?: string }>
    >;
  };

  beforeEach(() => {
    quizServiceMock = {
      getChapterQuizRequirement: jest.fn(async () => ({
        kind: 'NONE',
      })),
    };
  });

  it('returns a stable NOT_STARTED progress payload without writing records', async () => {
    const mock = createMockPrisma();
    const service = new LearningService(mock.prisma, quizServiceMock as never);
    const { courseId } = seedPublishedCourse(mock);

    const result = await service.getCourseProgress(currentUser, courseId);

    expect(result).toEqual({
      success: true,
      data: {
        courseId,
        status: LearningStatus.NOT_STARTED,
        progressPercent: 0,
        completedChapterCount: 0,
        totalChapterCount: 2,
        startedAt: null,
        lastLearnedAt: null,
        completedAt: null,
        lastLearnedChapter: null,
        chapters: [
          {
            chapterId: '22222222-2222-4222-8222-222222222221',
            title: 'Intro',
            sortOrder: 1,
            status: LearningStatus.NOT_STARTED,
            startedAt: null,
            completedAt: null,
          },
          {
            chapterId: '22222222-2222-4222-8222-222222222222',
            title: 'Variables',
            sortOrder: 2,
            status: LearningStatus.NOT_STARTED,
            startedAt: null,
            completedAt: null,
          },
        ],
      },
    });
    expect(mock.courseLearningRecords.size).toBe(0);
    expect(mock.chapterLearningRecords.size).toBe(0);
  });

  it('creates learning records only once when starting the same chapter twice', async () => {
    const mock = createMockPrisma();
    const service = new LearningService(mock.prisma, quizServiceMock as never);
    const { chapterOneId } = seedPublishedCourse(mock);

    const firstResult = await service.startChapter(currentUser, chapterOneId);
    const secondResult = await service.startChapter(currentUser, chapterOneId);

    expect(firstResult.data.chapterStatus).toBe(LearningStatus.LEARNING);
    expect(secondResult.data.chapterStatus).toBe(LearningStatus.LEARNING);
    expect(mock.courseLearningRecords.size).toBe(1);
    expect(mock.chapterLearningRecords.size).toBe(1);
  });

  it('rejects completing a chapter before it is started', async () => {
    const mock = createMockPrisma();
    const service = new LearningService(mock.prisma, quizServiceMock as never);
    const { chapterOneId } = seedPublishedCourse(mock);

    await expect(
      service.completeChapter(currentUser, chapterOneId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('preserves the first completedAt and completes the course after all chapters are done', async () => {
    const mock = createMockPrisma();
    const service = new LearningService(mock.prisma, quizServiceMock as never);
    const { courseId, chapterOneId, chapterTwoId } = seedPublishedCourse(mock);
    const courseRecordKey = `${currentUser.id}:${courseId}`;
    const chapterRecordKey = `${currentUser.id}:${chapterOneId}`;

    await service.startChapter(currentUser, chapterOneId);
    await service.completeChapter(currentUser, chapterOneId);
    const firstCompletedAt =
      mock.chapterLearningRecords.get(chapterRecordKey)?.completedAt ?? null;

    await service.completeChapter(currentUser, chapterOneId);
    expect(mock.chapterLearningRecords.get(chapterRecordKey)?.completedAt).toBe(
      firstCompletedAt,
    );
    expect(
      mock.courseLearningRecords
        .get(courseRecordKey)
        ?.progressPercent.toNumber(),
    ).toBe(50);

    await service.startChapter(currentUser, chapterTwoId);
    await service.completeChapter(currentUser, chapterTwoId);

    expect(mock.courseLearningRecords.get(courseRecordKey)?.status).toBe(
      LearningStatus.COMPLETED,
    );
    expect(
      mock.courseLearningRecords
        .get(courseRecordKey)
        ?.progressPercent.toNumber(),
    ).toBe(100);
  });

  it('rejects completing a started chapter when the linked quiz has not been passed', async () => {
    const mock = createMockPrisma();
    const service = new LearningService(mock.prisma, quizServiceMock as never);
    const { chapterOneId } = seedPublishedCourse(mock);

    quizServiceMock.getChapterQuizRequirement.mockResolvedValue({
      kind: 'READY',
      quizId: '33333333-3333-4333-8333-333333333333',
    });

    await service.startChapter(currentUser, chapterOneId);

    await expect(
      service.completeChapter(currentUser, chapterOneId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('still rejects completion when quizCompleted is true but no passed attempt exists', async () => {
    const mock = createMockPrisma();
    const service = new LearningService(mock.prisma, quizServiceMock as never);
    const { chapterOneId } = seedPublishedCourse(mock);
    const chapterRecordKey = `${currentUser.id}:${chapterOneId}`;

    quizServiceMock.getChapterQuizRequirement.mockResolvedValue({
      kind: 'READY',
      quizId: '33333333-3333-4333-8333-333333333333',
    });

    await service.startChapter(currentUser, chapterOneId);
    const chapterRecord = mock.chapterLearningRecords.get(chapterRecordKey);

    if (!chapterRecord) {
      throw new Error('Expected chapter learning record to exist');
    }

    chapterRecord.quizCompleted = true;
    mock.chapterLearningRecords.set(chapterRecordKey, chapterRecord);

    await expect(
      service.completeChapter(currentUser, chapterOneId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows completing a chapter when any historical passed attempt exists', async () => {
    const mock = createMockPrisma();
    const service = new LearningService(mock.prisma, quizServiceMock as never);
    const { courseId, chapterOneId } = seedPublishedCourse(mock);
    const courseRecordKey = `${currentUser.id}:${courseId}`;

    quizServiceMock.getChapterQuizRequirement.mockResolvedValue({
      kind: 'READY',
      quizId: '33333333-3333-4333-8333-333333333333',
    });

    mock.quizAttempts.set('attempt-1', {
      id: 'attempt-1',
      userId: currentUser.id,
      quizId: '33333333-3333-4333-8333-333333333333',
      passed: true,
    });

    await service.startChapter(currentUser, chapterOneId);
    const result = await service.completeChapter(currentUser, chapterOneId);

    expect(result.data.chapterStatus).toBe(LearningStatus.COMPLETED);
    expect(
      mock.courseLearningRecords
        .get(courseRecordKey)
        ?.progressPercent.toNumber(),
    ).toBe(50);
  });

  it('rejects completing a chapter when the quiz exists but is not ready', async () => {
    const mock = createMockPrisma();
    const service = new LearningService(mock.prisma, quizServiceMock as never);
    const { chapterOneId } = seedPublishedCourse(mock);

    quizServiceMock.getChapterQuizRequirement.mockResolvedValue({
      kind: 'NOT_READY',
      quizId: '33333333-3333-4333-8333-333333333333',
    });

    await service.startChapter(currentUser, chapterOneId);

    await expect(
      service.completeChapter(currentUser, chapterOneId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
