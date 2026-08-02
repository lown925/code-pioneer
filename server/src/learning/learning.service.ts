import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import {
  ChapterStatus,
  CourseStatus,
  LearningStatus,
} from '../../generated/prisma/enums';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { QuizService } from '../quiz/quiz.service';

const PUBLISHED_COURSE_STATUS = CourseStatus.PUBLISHED;
const PUBLISHED_CHAPTER_STATUS = ChapterStatus.PUBLISHED;
const MAX_PAGE_SIZE = 50;

type LearningListStatus = Exclude<LearningStatus, 'NOT_STARTED'>;

type PublishedChapterSummary = {
  id: string;
  title: string;
  sortOrder: number;
  hasQuiz: boolean;
};

type LearningListRecord = {
  courseId: string;
  startedAt: Date;
  lastLearnedAt: Date | null;
  completedAt: Date | null;
  course: {
    title: string;
    coverUrl: string | null;
  };
  lastChapter: {
    id: string;
    title: string;
    status: ChapterStatus;
    deletedAt: Date | null;
  } | null;
};

type LearningListItemPayload = {
  courseId: string;
  courseName: string;
  coverUrl: string | null;
  status: LearningStatus;
  progressPercent: number;
  completedChapterCount: number;
  totalChapterCount: number;
  lastLearnedChapter: {
    chapterId: string;
    title: string;
  } | null;
  startedAt: Date;
  lastLearnedAt: Date | null;
  completedAt: Date | null;
};

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quizService: QuizService,
  ) {}

  async startCourse(currentUser: CurrentUserContext, courseId: string) {
    await this.getAccessibleCourseOrThrow(courseId);

    const [firstChapter, publishedChapterCount] = await Promise.all([
      this.prisma.courseChapter.findFirst({
        where: {
          courseId,
          status: PUBLISHED_CHAPTER_STATUS,
          deletedAt: null,
        },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
        },
      }),
      this.countPublishedChapters(courseId),
    ]);

    const now = new Date();

    const { learningRecord, alreadyStarted } = await this.prisma.$transaction(
      async (tx) => {
        const existingRecord = await tx.courseLearningRecord.findUnique({
          where: {
            userId_courseId: {
              userId: currentUser.id,
              courseId,
            },
          },
          select: {
            id: true,
          },
        });

        const learningRecord = existingRecord
          ? await tx.courseLearningRecord.update({
              where: {
                userId_courseId: {
                  userId: currentUser.id,
                  courseId,
                },
              },
              data: {
                lastLearnedAt: now,
                totalChapterCountSnapshot: publishedChapterCount,
              },
              select: {
                id: true,
              },
            })
          : await tx.courseLearningRecord.create({
              data: {
                userId: currentUser.id,
                courseId,
                status: LearningStatus.LEARNING,
                completedChapterCount: 0,
                totalChapterCountSnapshot: publishedChapterCount,
                progressPercent: new Prisma.Decimal(0),
                startedAt: now,
                lastLearnedAt: now,
              },
              select: {
                id: true,
              },
            });

        return {
          learningRecord,
          alreadyStarted: existingRecord !== null,
        };
      },
    );

    return {
      success: true as const,
      data: {
        learningRecordId: learningRecord.id,
        chapterId: firstChapter?.id ?? null,
        alreadyStarted,
      },
    };
  }

  async startChapter(currentUser: CurrentUserContext, chapterId: string) {
    const chapter = await this.getAccessibleChapterOrThrow(chapterId);
    const now = new Date();

    const [publishedChapterCount, nextChapterId] = await Promise.all([
      this.countPublishedChapters(chapter.courseId),
      this.getNextChapterId(chapter.courseId, chapter.id),
    ]);

    const result = await this.prisma.$transaction(async (tx) => {
      const [courseRecord, chapterRecord] = await Promise.all([
        tx.courseLearningRecord.findUnique({
          where: {
            userId_courseId: {
              userId: currentUser.id,
              courseId: chapter.courseId,
            },
          },
          select: {
            id: true,
            progressPercent: true,
          },
        }),
        tx.chapterLearningRecord.findUnique({
          where: {
            userId_chapterId: {
              userId: currentUser.id,
              chapterId: chapter.id,
            },
          },
          select: {
            id: true,
            status: true,
          },
        }),
      ]);

      const updatedCourseRecord = courseRecord
        ? await tx.courseLearningRecord.update({
            where: {
              userId_courseId: {
                userId: currentUser.id,
                courseId: chapter.courseId,
              },
            },
            data: {
              lastChapterId: chapter.id,
              lastLearnedAt: now,
              totalChapterCountSnapshot: publishedChapterCount,
            },
            select: {
              progressPercent: true,
            },
          })
        : await tx.courseLearningRecord.create({
            data: {
              userId: currentUser.id,
              courseId: chapter.courseId,
              status: LearningStatus.LEARNING,
              completedChapterCount: 0,
              totalChapterCountSnapshot: publishedChapterCount,
              progressPercent: new Prisma.Decimal(0),
              lastChapterId: chapter.id,
              startedAt: now,
              lastLearnedAt: now,
            },
            select: {
              progressPercent: true,
            },
          });

      const updatedChapterRecord = chapterRecord
        ? await tx.chapterLearningRecord.update({
            where: {
              userId_chapterId: {
                userId: currentUser.id,
                chapterId: chapter.id,
              },
            },
            data: {
              lastLearnedAt: now,
            },
            select: {
              status: true,
            },
          })
        : await tx.chapterLearningRecord.create({
            data: {
              userId: currentUser.id,
              courseId: chapter.courseId,
              chapterId: chapter.id,
              status: LearningStatus.LEARNING,
              firstStartedAt: now,
              lastLearnedAt: now,
            },
            select: {
              status: true,
            },
          });

      return {
        chapterStatus: updatedChapterRecord.status,
        courseProgressPercent: this.decimalToNumber(
          updatedCourseRecord.progressPercent,
        ),
      };
    });

    return {
      success: true as const,
      data: {
        chapterStatus: result.chapterStatus,
        courseProgressPercent: result.courseProgressPercent,
        nextChapterId,
      },
    };
  }

  async completeChapter(currentUser: CurrentUserContext, chapterId: string) {
    const chapter = await this.getAccessibleChapterOrThrow(chapterId);
    const now = new Date();
    const nextChapterId = await this.getNextChapterId(
      chapter.courseId,
      chapter.id,
    );
    const quizRequirement = await this.quizService.getChapterQuizRequirement(
      chapter.id,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const [courseRecord, chapterRecord] = await Promise.all([
        tx.courseLearningRecord.findUnique({
          where: {
            userId_courseId: {
              userId: currentUser.id,
              courseId: chapter.courseId,
            },
          },
          select: {
            completedAt: true,
          },
        }),
        tx.chapterLearningRecord.findUnique({
          where: {
            userId_chapterId: {
              userId: currentUser.id,
              chapterId: chapter.id,
            },
          },
          select: {
            status: true,
            completedAt: true,
            quizCompleted: true,
          },
        }),
      ]);

      if (!courseRecord || !chapterRecord) {
        throw new BadRequestException('CHAPTER_NOT_STARTED');
      }

      if (
        chapterRecord.status !== LearningStatus.COMPLETED &&
        chapterRecord.completedAt === null
      ) {
        if (quizRequirement.kind === 'NOT_PUBLISHED') {
          throw new BadRequestException('QUIZ_NOT_PUBLISHED');
        }

        if (quizRequirement.kind === 'NOT_READY') {
          throw new BadRequestException('QUIZ_NOT_READY');
        }

        if (quizRequirement.kind === 'READY') {
          const submittedAttempt = await tx.quizAttempt.findFirst({
            where: {
              userId: currentUser.id,
              quizId: quizRequirement.quizId,
            },
            select: {
              id: true,
            },
          });

          if (!submittedAttempt) {
            throw new BadRequestException('CHAPTER_QUIZ_NOT_SUBMITTED');
          }
        }
      }

      await tx.chapterLearningRecord.update({
        where: {
          userId_chapterId: {
            userId: currentUser.id,
            chapterId: chapter.id,
          },
        },
        data: {
          status: LearningStatus.COMPLETED,
          completedAt: chapterRecord.completedAt ?? now,
          lastLearnedAt: now,
        },
      });

      const [publishedChapterCount, completedChapterCount] = await Promise.all([
        tx.courseChapter.count({
          where: {
            courseId: chapter.courseId,
            status: PUBLISHED_CHAPTER_STATUS,
            deletedAt: null,
          },
        }),
        tx.chapterLearningRecord.count({
          where: {
            userId: currentUser.id,
            courseId: chapter.courseId,
            status: LearningStatus.COMPLETED,
            chapter: {
              status: PUBLISHED_CHAPTER_STATUS,
              deletedAt: null,
            },
          },
        }),
      ]);

      const courseProgressPercent = this.calculateProgressPercent(
        completedChapterCount,
        publishedChapterCount,
      );
      const courseStatus =
        publishedChapterCount > 0 &&
        completedChapterCount === publishedChapterCount
          ? LearningStatus.COMPLETED
          : LearningStatus.LEARNING;

      await tx.courseLearningRecord.update({
        where: {
          userId_courseId: {
            userId: currentUser.id,
            courseId: chapter.courseId,
          },
        },
        data: {
          status: courseStatus,
          completedChapterCount,
          totalChapterCountSnapshot: publishedChapterCount,
          progressPercent: new Prisma.Decimal(courseProgressPercent),
          lastChapterId: chapter.id,
          lastLearnedAt: now,
          completedAt:
            courseStatus === LearningStatus.COMPLETED
              ? (courseRecord.completedAt ?? now)
              : null,
        },
      });

      return {
        chapterStatus: LearningStatus.COMPLETED,
        courseProgressPercent,
      };
    });

    return {
      success: true as const,
      data: {
        chapterStatus: result.chapterStatus,
        courseProgressPercent: result.courseProgressPercent,
        nextChapterId,
      },
    };
  }

  async getCourseProgress(currentUser: CurrentUserContext, courseId: string) {
    await this.getAccessibleCourseOrThrow(courseId);

    const [publishedChapters, courseRecord, chapterRecords] = await Promise.all(
      [
        this.getPublishedChapterSummaries(courseId),
        this.prisma.courseLearningRecord.findUnique({
          where: {
            userId_courseId: {
              userId: currentUser.id,
              courseId,
            },
          },
          select: {
            status: true,
            startedAt: true,
            lastLearnedAt: true,
            completedAt: true,
            lastChapterId: true,
          },
        }),
        this.prisma.chapterLearningRecord.findMany({
          where: {
            userId: currentUser.id,
            courseId,
            chapter: {
              status: PUBLISHED_CHAPTER_STATUS,
              deletedAt: null,
            },
          },
          select: {
            chapterId: true,
            status: true,
            firstStartedAt: true,
            lastLearnedAt: true,
            completedAt: true,
            quizCompleted: true,
          },
        }),
      ],
    );

    if (!courseRecord) {
      return {
        success: true as const,
        data: {
          courseId,
          status: LearningStatus.NOT_STARTED,
          progressPercent: 0,
          completedChapterCount: 0,
          totalChapterCount: publishedChapters.length,
          startedAt: null,
          lastLearnedAt: null,
          completedAt: null,
          lastLearnedChapter: null,
          chapters: publishedChapters.map((chapter) => ({
            chapterId: chapter.id,
            title: chapter.title,
            sortOrder: chapter.sortOrder,
            status: LearningStatus.NOT_STARTED,
            startedAt: null,
            lastLearnedAt: null,
            completedAt: null,
            hasQuiz: chapter.hasQuiz,
            quizCompleted: false,
          })),
        },
      };
    }

    const chapterRecordMap = new Map(
      chapterRecords.map((record) => [record.chapterId, record]),
    );
    const completedChapterCount = chapterRecords.filter(
      (record) => record.status === LearningStatus.COMPLETED,
    ).length;
    const progressPercent = this.calculateProgressPercent(
      completedChapterCount,
      publishedChapters.length,
    );
    const lastLearnedChapter = publishedChapters.find(
      (chapter) => chapter.id === courseRecord.lastChapterId,
    );

    return {
      success: true as const,
      data: {
        courseId,
        status:
          publishedChapters.length > 0 &&
          completedChapterCount === publishedChapters.length
            ? LearningStatus.COMPLETED
            : LearningStatus.LEARNING,
        progressPercent,
        completedChapterCount,
        totalChapterCount: publishedChapters.length,
        startedAt: courseRecord.startedAt,
        lastLearnedAt: courseRecord.lastLearnedAt,
        completedAt:
          publishedChapters.length > 0 &&
          completedChapterCount === publishedChapters.length
            ? courseRecord.completedAt
            : null,
        lastLearnedChapter: lastLearnedChapter
          ? {
              chapterId: lastLearnedChapter.id,
              title: lastLearnedChapter.title,
            }
          : null,
        chapters: publishedChapters.map((chapter) => {
          const chapterRecord = chapterRecordMap.get(chapter.id);

          return {
            chapterId: chapter.id,
            title: chapter.title,
            sortOrder: chapter.sortOrder,
            status: chapterRecord?.status ?? LearningStatus.NOT_STARTED,
            startedAt: chapterRecord?.firstStartedAt ?? null,
            lastLearnedAt: chapterRecord?.lastLearnedAt ?? null,
            completedAt: chapterRecord?.completedAt ?? null,
            hasQuiz: chapter.hasQuiz,
            quizCompleted: chapterRecord?.quizCompleted ?? false,
          };
        }),
      },
    };
  }

  async listMyLearning(
    currentUser: CurrentUserContext,
    page: number,
    pageSize: number,
    status?: LearningListStatus,
  ) {
    if (page < 1 || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new BadRequestException('INVALID_PARAMETER');
    }

    const allRecords = await this.prisma.courseLearningRecord.findMany({
      where: {
        userId: currentUser.id,
        course: {
          status: PUBLISHED_COURSE_STATUS,
          deletedAt: null,
        },
      },
      orderBy: [{ lastLearnedAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        courseId: true,
        startedAt: true,
        lastLearnedAt: true,
        completedAt: true,
        course: {
          select: {
            title: true,
            coverUrl: true,
          },
        },
        lastChapter: {
          select: {
            id: true,
            title: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    });

    const dynamicItems = await Promise.all(
      allRecords.map((record) =>
        this.toLearningListItem(currentUser.id, record as LearningListRecord),
      ),
    );
    const filteredItems = status
      ? dynamicItems.filter((item) => item.status === status)
      : dynamicItems;
    const total = filteredItems.length;
    const skip = (page - 1) * pageSize;
    const items = filteredItems.slice(skip, skip + pageSize);
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      success: true as const,
      data: {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
    };
  }

  async getLearningSummary(currentUser: CurrentUserContext) {
    const records = await this.prisma.courseLearningRecord.findMany({
      where: {
        userId: currentUser.id,
        course: {
          status: PUBLISHED_COURSE_STATUS,
          deletedAt: null,
        },
      },
      orderBy: [{ lastLearnedAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        courseId: true,
        startedAt: true,
        lastLearnedAt: true,
        completedAt: true,
        course: {
          select: {
            title: true,
            coverUrl: true,
          },
        },
        lastChapter: {
          select: {
            id: true,
            title: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    });

    const learningCourses = await Promise.all(
      records.map((record) =>
        this.toLearningListItem(currentUser.id, record as LearningListRecord),
      ),
    );
    const inProgressCourseCount = learningCourses.filter(
      (item) => item.status === LearningStatus.LEARNING,
    ).length;
    const completedCourseCount = learningCourses.filter(
      (item) => item.status === LearningStatus.COMPLETED,
    ).length;
    const completedChapterCount = learningCourses.reduce(
      (sum, item) => sum + item.completedChapterCount,
      0,
    );
    const continueLearningCourse =
      learningCourses.find((item) => item.status === LearningStatus.LEARNING) ??
      learningCourses[0] ??
      null;
    const attempts = await this.prisma.quizAttempt.findMany({
      where: {
        userId: currentUser.id,
        quiz: {
          chapter: {
            status: PUBLISHED_CHAPTER_STATUS,
            deletedAt: null,
            course: {
              status: PUBLISHED_COURSE_STATUS,
              deletedAt: null,
            },
          },
        },
      },
      select: {
        answers: {
          select: {
            questionId: true,
            isCorrect: true,
          },
        },
      },
    });
    const totalQuizAnswerCount = attempts.reduce(
      (sum, attempt) => sum + attempt.answers.length,
      0,
    );
    const correctQuizAnswerCount = attempts.reduce(
      (sum, attempt) =>
        sum +
        attempt.answers.filter((answer) => answer.isCorrect === true).length,
      0,
    );
    const learningWrongQuestionCount = new Set(
      attempts.flatMap((attempt) =>
        attempt.answers
          .filter((answer) => answer.isCorrect === false)
          .map((answer) => answer.questionId),
      ),
    ).size;

    return {
      success: true as const,
      data: {
        inProgressCourseCount,
        completedCourseCount,
        completedChapterCount,
        totalQuizAnswerCount,
        quizAccuracyPercent:
          totalQuizAnswerCount > 0
            ? Math.round(
                (correctQuizAnswerCount / totalQuizAnswerCount) * 100,
              )
            : 0,
        learningWrongQuestionCount,
        continueLearningCourse,
      },
    };
  }

  private async getAccessibleCourseOrThrow(courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        status: PUBLISHED_COURSE_STATUS,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      throw new NotFoundException('COURSE_NOT_FOUND');
    }

    return course;
  }

  private async getAccessibleChapterOrThrow(chapterId: string) {
    const chapter = await this.prisma.courseChapter.findFirst({
      where: {
        id: chapterId,
        status: PUBLISHED_CHAPTER_STATUS,
        deletedAt: null,
        course: {
          status: PUBLISHED_COURSE_STATUS,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('CHAPTER_NOT_FOUND');
    }

    return chapter;
  }

  private async countPublishedChapters(courseId: string) {
    return this.prisma.courseChapter.count({
      where: {
        courseId,
        status: PUBLISHED_CHAPTER_STATUS,
        deletedAt: null,
      },
    });
  }

  private async getPublishedChapterSummaries(courseId: string) {
    return this.prisma.courseChapter.findMany({
      where: {
        courseId,
        status: PUBLISHED_CHAPTER_STATUS,
        deletedAt: null,
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        sortOrder: true,
        quiz: {
          select: {
            id: true,
          },
        },
      },
    }).then((chapters) =>
      chapters.map(
        (chapter) =>
          ({
            id: chapter.id,
            title: chapter.title,
            sortOrder: chapter.sortOrder,
            hasQuiz: Boolean(chapter.quiz),
          }) satisfies PublishedChapterSummary,
      ),
    );
  }

  private async getNextChapterId(courseId: string, chapterId: string) {
    const chapters = await this.getPublishedChapterSummaries(courseId);
    const currentIndex = chapters.findIndex(
      (chapter) => chapter.id === chapterId,
    );

    if (currentIndex < 0 || currentIndex >= chapters.length - 1) {
      return null;
    }

    return chapters[currentIndex + 1]?.id ?? null;
  }

  private calculateProgressPercent(
    completedChapterCount: number,
    totalChapterCount: number,
  ) {
    if (totalChapterCount <= 0) {
      return 0;
    }

    return Math.floor((completedChapterCount / totalChapterCount) * 100);
  }

  private async getDynamicCourseSnapshot(userId: string, courseId: string) {
    const [totalChapterCount, completedChapterCount] = await Promise.all([
      this.countPublishedChapters(courseId),
      this.prisma.chapterLearningRecord.count({
        where: {
          userId,
          courseId,
          status: LearningStatus.COMPLETED,
          chapter: {
            status: PUBLISHED_CHAPTER_STATUS,
            deletedAt: null,
          },
        },
      }),
    ]);
    const progressPercent = this.calculateProgressPercent(
      completedChapterCount,
      totalChapterCount,
    );
    const status =
      totalChapterCount > 0 && completedChapterCount === totalChapterCount
        ? LearningStatus.COMPLETED
        : LearningStatus.LEARNING;

    return {
      status,
      progressPercent,
      completedChapterCount,
      totalChapterCount,
    };
  }

  private async toLearningListItem(
    userId: string,
    record: LearningListRecord,
  ): Promise<LearningListItemPayload> {
    const snapshot = await this.getDynamicCourseSnapshot(userId, record.courseId);

    return {
      courseId: record.courseId,
      courseName: record.course.title,
      coverUrl: record.course.coverUrl,
      status: snapshot.status,
      progressPercent: snapshot.progressPercent,
      completedChapterCount: snapshot.completedChapterCount,
      totalChapterCount: snapshot.totalChapterCount,
      lastLearnedChapter:
        record.lastChapter &&
        record.lastChapter.status === PUBLISHED_CHAPTER_STATUS &&
        record.lastChapter.deletedAt === null
          ? {
              chapterId: record.lastChapter.id,
              title: record.lastChapter.title,
            }
          : null,
      startedAt: record.startedAt,
      lastLearnedAt: record.lastLearnedAt,
      completedAt:
        snapshot.status === LearningStatus.COMPLETED ? record.completedAt : null,
    };
  }

  private decimalToNumber(value: Prisma.Decimal | number) {
    if (typeof value === 'number') {
      return value;
    }

    return value.toNumber();
  }
}
