import { Injectable, NotFoundException } from '@nestjs/common';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

export const COURSE_DIFFICULTIES = [
  'BEGINNER',
  'BASIC',
  'INTERMEDIATE',
  'ADVANCED',
] as const;

const PUBLISHED_COURSE_STATUS = 'PUBLISHED';
const PUBLISHED_CHAPTER_STATUS = 'PUBLISHED';
const LEARNING_STATUS_NOT_STARTED = 'NOT_STARTED';

export type CourseDifficultyValue = (typeof COURSE_DIFFICULTIES)[number];
type ContentBlockTypeValue =
  | 'TEXT'
  | 'HEADING'
  | 'IMAGE'
  | 'CODE'
  | 'TIP'
  | 'WARNING'
  | 'EXAMPLE'
  | 'QUESTION';

type CourseWhere = {
  status: 'PUBLISHED';
  deletedAt: null;
  difficulty?: CourseDifficultyValue;
};

type CourseListRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  difficulty: CourseDifficultyValue;
  estimatedMinutes: number;
  learnerCount: number;
  chapters: Array<{ id: string }>;
};

type CourseDetailChapterRecord = {
  id: string;
  title: string;
  summary: string | null;
  estimatedMinutes: number;
  sortOrder: number;
};

type CourseDetailRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  coverUrl: string | null;
  difficulty: CourseDifficultyValue;
  estimatedMinutes: number;
  targetAudience: string | null;
  learningObjectives: unknown;
  learnerCount: number;
  chapters: CourseDetailChapterRecord[];
};

type ChapterContentBlockRecord = {
  id: string;
  type: ContentBlockTypeValue;
  sortOrder: number;
  content: unknown;
};

type ChapterDetailRecord = {
  id: string;
  courseId: string;
  title: string;
  summary: string | null;
  estimatedMinutes: number;
  sortOrder: number;
  course: {
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'OFFLINE';
    deletedAt: Date | null;
  };
  contentBlocks: ChapterContentBlockRecord[];
};

type CourseDelegate = {
  findMany(args: {
    where: CourseWhere;
    orderBy: Array<Record<string, 'asc' | 'desc'>>;
    skip: number;
    take: number;
    select: unknown;
  }): Promise<CourseListRecord[]>;
  count(args: { where: CourseWhere }): Promise<number>;
  findFirst(args: {
    where: { id: string; status: 'PUBLISHED'; deletedAt: null };
    select: unknown;
  }): Promise<CourseDetailRecord | null>;
};

type ChapterDelegate = {
  findFirst(args: {
    where: {
      id: string;
      status: 'PUBLISHED';
      deletedAt: null;
    };
    select: unknown;
  }): Promise<ChapterDetailRecord | null>;
  findMany(args: {
    where: {
      courseId: string;
      status: 'PUBLISHED';
      deletedAt: null;
    };
    orderBy: Array<Record<string, 'asc' | 'desc'>>;
    select: unknown;
  }): Promise<Array<{ id: string }>>;
};

type ContentBlockPayload = Record<string, unknown>;

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourses(
    page: number,
    pageSize: number,
    difficulty?: CourseDifficultyValue,
    currentUser?: CurrentUserContext | null,
  ) {
    const where = this.buildPublicCourseWhere(difficulty);
    const skip = (page - 1) * pageSize;

    const [courses, total] = await Promise.all([
      this.courseModel.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          coverUrl: true,
          difficulty: true,
          estimatedMinutes: true,
          learnerCount: true,
          chapters: {
            where: {
              status: PUBLISHED_CHAPTER_STATUS,
              deletedAt: null,
            },
            select: {
              id: true,
            },
          },
        },
      }),
      this.courseModel.count({ where }),
    ]);
    const progressByCourseId = currentUser
      ? await this.getProgressByCourseIds(
          currentUser.id,
          courses.map((course) => course.id),
        )
      : new Map<string, number>();

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        items: courses.map((course) => ({
          id: course.id,
          slug: course.slug,
          title: course.title,
          summary: course.summary,
          coverUrl: course.coverUrl,
          difficulty: course.difficulty,
          estimatedMinutes: course.estimatedMinutes,
          chapterCount: course.chapters.length,
          learnerCount: course.learnerCount,
          progressPercent: progressByCourseId.get(course.id) ?? 0,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page * pageSize < total,
        },
      },
    };
  }

  async getCourseDetail(
    courseId: string,
    currentUser?: CurrentUserContext | null,
  ) {
    const course = await this.courseModel.findFirst({
      where: {
        id: courseId,
        status: PUBLISHED_COURSE_STATUS,
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        description: true,
        coverUrl: true,
        difficulty: true,
        estimatedMinutes: true,
        targetAudience: true,
        learningObjectives: true,
        learnerCount: true,
        chapters: {
          where: {
            status: PUBLISHED_CHAPTER_STATUS,
            deletedAt: null,
          },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            title: true,
            summary: true,
            estimatedMinutes: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('COURSE_NOT_FOUND');
    }

    const progressPercent = currentUser
      ? await this.getCourseProgressPercent(currentUser.id, course.id)
      : 0;

    return {
      success: true,
      data: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        description: course.description,
        coverUrl: course.coverUrl,
        difficulty: course.difficulty,
        estimatedMinutes: course.estimatedMinutes,
        targetAudience: course.targetAudience,
        learningObjectives: course.learningObjectives,
        learnerCount: course.learnerCount,
        progressPercent,
        chapters: course.chapters,
      },
    };
  }

  async getChapterDetail(
    chapterId: string,
    currentUser?: CurrentUserContext | null,
  ) {
    const chapter = await this.chapterModel.findFirst({
      where: {
        id: chapterId,
        status: PUBLISHED_CHAPTER_STATUS,
        deletedAt: null,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        summary: true,
        estimatedMinutes: true,
        sortOrder: true,
        course: {
          select: {
            title: true,
            status: true,
            deletedAt: true,
          },
        },
        contentBlocks: {
          where: {
            isVisible: true,
            deletedAt: null,
          },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            type: true,
            sortOrder: true,
            content: true,
          },
        },
      },
    });

    if (
      !chapter ||
      chapter.course.status !== PUBLISHED_COURSE_STATUS ||
      chapter.course.deletedAt !== null
    ) {
      throw new NotFoundException('CHAPTER_NOT_FOUND');
    }

    const chapterOrder = await this.chapterModel.findMany({
      where: {
        courseId: chapter.courseId,
        status: PUBLISHED_CHAPTER_STATUS,
        deletedAt: null,
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
      },
    });
    const currentIndex = chapterOrder.findIndex(
      (item) => item.id === chapter.id,
    );
    const learningStatus = currentUser
      ? await this.getChapterLearningStatus(currentUser.id, chapter.id)
      : LEARNING_STATUS_NOT_STARTED;

    return {
      success: true,
      data: {
        id: chapter.id,
        courseId: chapter.courseId,
        courseTitle: chapter.course.title,
        title: chapter.title,
        summary: chapter.summary,
        estimatedMinutes: chapter.estimatedMinutes,
        sortOrder: chapter.sortOrder,
        hasQuiz: false,
        learningStatus,
        previousChapterId:
          currentIndex > 0
            ? (chapterOrder[currentIndex - 1]?.id ?? null)
            : null,
        nextChapterId:
          currentIndex >= 0 && currentIndex < chapterOrder.length - 1
            ? (chapterOrder[currentIndex + 1]?.id ?? null)
            : null,
        contentBlocks: this.normalizeContentBlocks(chapter.contentBlocks),
      },
    };
  }

  private normalizeContentBlocks(blocks: ChapterContentBlockRecord[]) {
    return blocks
      .map((block) => {
        const content = this.sanitizeBlockContent(block.type, block.content);

        if (!content) {
          return null;
        }

        return {
          id: block.id,
          type: block.type,
          sortOrder: block.sortOrder,
          content,
        };
      })
      .filter(
        (
          block,
        ): block is {
          id: string;
          type: ContentBlockTypeValue;
          sortOrder: number;
          content: ContentBlockPayload;
        } => block !== null,
      );
  }

  private sanitizeBlockContent(
    type: ContentBlockTypeValue,
    content: unknown,
  ): ContentBlockPayload | null {
    if (!this.isRecord(content)) {
      return null;
    }

    switch (type) {
      case 'TEXT': {
        const text = this.getOptionalString(content.text);
        return text ? { text } : null;
      }
      case 'HEADING': {
        const text = this.getOptionalString(content.text);
        const level = this.getHeadingLevel(content.level);

        if (!text) {
          return null;
        }

        return level ? { text, level } : { text };
      }
      case 'IMAGE': {
        const url = this.getOptionalString(content.url);

        if (!url) {
          return null;
        }

        return this.withOptionalStrings(
          { url },
          {
            alt: content.alt,
            caption: content.caption,
          },
        );
      }
      case 'CODE': {
        const language = this.getOptionalString(content.language);
        const code = this.getOptionalString(content.code);

        if (!language || !code) {
          return null;
        }

        return this.withOptionalStrings(
          {
            language,
            code,
          },
          {
            caption: content.caption,
          },
        );
      }
      case 'TIP':
      case 'WARNING': {
        const text = this.getOptionalString(content.text);

        if (!text) {
          return null;
        }

        return this.withOptionalStrings(
          { text },
          {
            title: content.title,
          },
        );
      }
      case 'EXAMPLE': {
        const description = this.getOptionalString(content.description);
        const code = this.getOptionalString(content.code);
        const text = this.getOptionalString(content.text);

        if (!description && !code && !text) {
          return null;
        }

        return this.withOptionalStrings(
          {},
          {
            title: content.title,
            description,
            text,
            language: content.language,
            code,
            caption: content.caption,
          },
        );
      }
      case 'QUESTION': {
        const questionId = this.getOptionalString(content.questionId);
        return questionId ? { questionId } : null;
      }
      default:
        return null;
    }
  }

  private withOptionalStrings(
    base: ContentBlockPayload,
    fields: Record<string, unknown>,
  ) {
    const payload: ContentBlockPayload = { ...base };

    Object.entries(fields).forEach(([key, value]) => {
      const normalized = this.getOptionalString(value);

      if (normalized) {
        payload[key] = normalized;
      }
    });

    return payload;
  }

  private getOptionalString(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private getHeadingLevel(value: unknown) {
    return value === 1 || value === 2 || value === 3 ? value : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private buildPublicCourseWhere(
    difficulty?: CourseDifficultyValue,
  ): CourseWhere {
    return {
      status: PUBLISHED_COURSE_STATUS,
      deletedAt: null,
      ...(difficulty ? { difficulty } : {}),
    };
  }

  private async getProgressByCourseIds(userId: string, courseIds: string[]) {
    if (courseIds.length === 0) {
      return new Map<string, number>();
    }

    const records = await this.prisma.courseLearningRecord.findMany({
      where: {
        userId,
        courseId: {
          in: courseIds,
        },
      },
      select: {
        courseId: true,
        progressPercent: true,
      },
    });

    return new Map(
      records.map((record) => [
        record.courseId,
        this.decimalToNumber(record.progressPercent),
      ]),
    );
  }

  private async getCourseProgressPercent(userId: string, courseId: string) {
    const record = await this.prisma.courseLearningRecord.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        progressPercent: true,
      },
    });

    return record ? this.decimalToNumber(record.progressPercent) : 0;
  }

  private async getChapterLearningStatus(userId: string, chapterId: string) {
    const record = await this.prisma.chapterLearningRecord.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      select: {
        status: true,
      },
    });

    return record?.status ?? LEARNING_STATUS_NOT_STARTED;
  }

  private decimalToNumber(value: { toNumber(): number } | number) {
    return typeof value === 'number' ? value : value.toNumber();
  }

  private get courseModel(): CourseDelegate {
    return (this.prisma as PrismaService & { course: CourseDelegate }).course;
  }

  private get chapterModel(): ChapterDelegate {
    return (
      this.prisma as PrismaService & {
        courseChapter: ChapterDelegate;
      }
    ).courseChapter;
  }
}
