import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const COURSE_DIFFICULTIES = [
  'BEGINNER',
  'BASIC',
  'INTERMEDIATE',
  'ADVANCED',
] as const;

const PUBLISHED_COURSE_STATUS = 'PUBLISHED';
const PUBLISHED_CHAPTER_STATUS = 'PUBLISHED';

export type CourseDifficultyValue = (typeof COURSE_DIFFICULTIES)[number];

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

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourses(
    page: number,
    pageSize: number,
    difficulty?: CourseDifficultyValue,
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
          // Learning progress is not implemented in CP-005R, so public progress stays at 0.
          progressPercent: 0,
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

  async getCourseDetail(courseId: string) {
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
      throw new NotFoundException('Course not found');
    }

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
        progressPercent: 0,
        chapters: course.chapters,
      },
    };
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

  private get courseModel(): CourseDelegate {
    return (this.prisma as PrismaService & { course: CourseDelegate }).course;
  }
}
