import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getTrackForMajor } from '../course/course-catalog';
import {
  buildGrowthAiPrompt,
  formatGrowthCareerDirection,
  formatGrowthGrade,
  formatGrowthTechnicalInterest,
} from './ai-prompt-template';
import type { GrowthAiPromptContext } from './ai-prompt.types';

const MAX_WEAK_AREAS = 5;
const MAX_COMPLETED_COURSES = 8;
const MAX_LEARNING_COURSES = 5;

type PromptUserRecord = {
  grade: string | null;
  major: string | null;
  careerDirection: string | null;
  technicalInterests: string[];
};

type PromptCourseRecord = {
  status: 'NOT_STARTED' | 'LEARNING' | 'COMPLETED';
  progressPercent: unknown;
  course: { title: string };
};

type PromptQuizAttemptRecord = {
  answers: Array<{ isCorrect: boolean }>;
  quiz: {
    chapter: {
      title: string;
      course: { title: string };
    };
  };
};

type PromptPracticeAttemptRecord = {
  status: 'IN_PROGRESS' | 'COMPLETED';
  answers: Array<{
    isCorrect: boolean;
    question: {
      quiz: {
        chapter: {
          title: string;
          course: { title: string };
        };
      };
    };
  }>;
};

type PromptCourseLearningDelegate = {
  findMany(args: unknown): Promise<PromptCourseRecord[]>;
};

type PromptQuizAttemptDelegate = {
  findMany(args: unknown): Promise<PromptQuizAttemptRecord[]>;
};

type PromptPracticeAttemptDelegate = {
  findMany(args: unknown): Promise<PromptPracticeAttemptRecord[]>;
};

type PromptPrisma = PrismaService & {
  user: {
    findFirst(args: unknown): Promise<PromptUserRecord | null>;
  };
  courseLearningRecord: PromptCourseLearningDelegate;
  quizAttempt: PromptQuizAttemptDelegate;
  practiceAttempt: PromptPracticeAttemptDelegate;
};

type WeakAreaAccumulator = {
  courseTitle: string;
  chapterTitle: string;
  errorCount: number;
};

@Injectable()
export class GrowthAiPromptService {
  constructor(private readonly prisma: PrismaService) {}

  async getPromptContext(userId: string): Promise<GrowthAiPromptContext> {
    const prisma = this.prisma as PromptPrisma;
    const [user, courseRecords, quizAttempts, practiceAttempts] =
      await Promise.all([
        prisma.user.findFirst({
          where: { id: userId, deletedAt: null },
          select: {
            grade: true,
            major: true,
            careerDirection: true,
            technicalInterests: true,
          },
        }),
        prisma.courseLearningRecord.findMany({
          where: {
            userId,
            course: { status: 'PUBLISHED', deletedAt: null },
          },
          orderBy: [{ updatedAt: 'desc' }, { courseId: 'asc' }],
          select: {
            status: true,
            progressPercent: true,
            course: { select: { title: true } },
          },
        }),
        prisma.quizAttempt.findMany({
          where: {
            userId,
            quiz: {
              status: 'PUBLISHED',
              chapter: {
                status: 'PUBLISHED',
                deletedAt: null,
                course: { status: 'PUBLISHED', deletedAt: null },
              },
            },
          },
          select: {
            answers: { select: { isCorrect: true } },
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
        }),
        prisma.practiceAttempt.findMany({
          where: {
            userId,
            status: 'COMPLETED',
            course: { status: 'PUBLISHED', deletedAt: null },
          },
          select: {
            status: true,
            answers: {
              select: {
                isCorrect: true,
                question: {
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
            },
          },
        }),
      ]);

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const completedCourses: string[] = [];
    const learningCourses: GrowthAiPromptContext['learningCourses'] = [];

    for (const record of courseRecords) {
      const title = this.cleanTitle(record.course.title);
      if (!title) {
        continue;
      }

      if (record.status === 'COMPLETED') {
        completedCourses.push(title);
        continue;
      }

      if (record.status === 'LEARNING') {
        const progressPercent = this.toProgressPercent(record.progressPercent);
        learningCourses.push({
          title,
          ...(progressPercent === undefined ? {} : { progressPercent }),
        });
      }
    }

    const quiz = this.buildQuizSummary(quizAttempts);
    const practice = this.buildPracticeSummary(practiceAttempts);
    const weakAreas = this.buildWeakAreas(quizAttempts, practiceAttempts);
    const uniqueCompletedCourses = [...new Set(completedCourses)];
    const completedCourseCount = uniqueCompletedCourses.length;
    const learningCourseCount = learningCourses.length;
    const professionalTrackName = getTrackForMajor(user.major)?.shortName;
    const gradeLabel = formatGrowthGrade(user.grade) || undefined;
    const careerDirectionLabel =
      formatGrowthCareerDirection(user.careerDirection) || undefined;
    const technicalInterests = user.technicalInterests
      .map((interest) => formatGrowthTechnicalInterest(interest))
      .map((interest) => this.cleanTitle(interest))
      .filter(Boolean)
      .slice(0, 5);

    return {
      ...(gradeLabel ? { gradeLabel } : {}),
      ...(professionalTrackName ? { professionalTrackName } : {}),
      ...(careerDirectionLabel ? { careerDirectionLabel } : {}),
      ...(technicalInterests.length > 0 ? { technicalInterests } : {}),
      completedCourses: uniqueCompletedCourses.slice(0, MAX_COMPLETED_COURSES),
      learningCourses: learningCourses.slice(0, MAX_LEARNING_COURSES),
      ...((completedCourses.length > 0 || learningCourses.length > 0) && {
        learningSummary: {
          completedCourseCount,
          learningCourseCount,
        },
      }),
      ...(quiz ? { quizSummary: quiz } : {}),
      ...(practice ? { practiceSummary: practice } : {}),
      weakAreas,
    };
  }

  async buildPrompt(userId: string) {
    return buildGrowthAiPrompt(await this.getPromptContext(userId));
  }

  private buildQuizSummary(attempts: PromptQuizAttemptRecord[]) {
    const completedAttempts = attempts.filter(
      (attempt) => attempt.answers.length > 0,
    );
    const answeredQuestions = completedAttempts.reduce(
      (sum, attempt) => sum + attempt.answers.length,
      0,
    );
    if (answeredQuestions <= 0) {
      return undefined;
    }

    const correctQuestions = completedAttempts.reduce(
      (sum, attempt) =>
        sum + attempt.answers.filter((answer) => answer.isCorrect).length,
      0,
    );

    return {
      completedAttempts: completedAttempts.length,
      answeredQuestions,
      correctQuestions,
      accuracyPercent: this.calculateAccuracy(
        correctQuestions,
        answeredQuestions,
      ),
    };
  }

  private buildPracticeSummary(attempts: PromptPracticeAttemptRecord[]) {
    const completedAttempts = attempts.filter(
      (attempt) => attempt.status === 'COMPLETED',
    );
    const answeredQuestions = completedAttempts.reduce(
      (sum, attempt) => sum + attempt.answers.length,
      0,
    );
    if (answeredQuestions <= 0) {
      return undefined;
    }

    const correctQuestions = completedAttempts.reduce(
      (sum, attempt) =>
        sum + attempt.answers.filter((answer) => answer.isCorrect).length,
      0,
    );

    return {
      completedAttempts: completedAttempts.length,
      answeredQuestions,
      correctQuestions,
      accuracyPercent: this.calculateAccuracy(
        correctQuestions,
        answeredQuestions,
      ),
    };
  }

  private buildWeakAreas(
    quizAttempts: PromptQuizAttemptRecord[],
    practiceAttempts: PromptPracticeAttemptRecord[],
  ) {
    const areas = new Map<string, WeakAreaAccumulator>();
    const addError = (courseTitle: string, chapterTitle: string) => {
      const normalizedCourseTitle = this.cleanTitle(courseTitle);
      const normalizedChapterTitle = this.cleanTitle(chapterTitle);
      if (!normalizedCourseTitle || !normalizedChapterTitle) {
        return;
      }

      const key = `${normalizedCourseTitle}\u0000${normalizedChapterTitle}`;
      const existing = areas.get(key);
      if (existing) {
        existing.errorCount += 1;
        return;
      }

      areas.set(key, {
        courseTitle: normalizedCourseTitle,
        chapterTitle: normalizedChapterTitle,
        errorCount: 1,
      });
    };

    quizAttempts.forEach((attempt) => {
      attempt.answers.forEach((answer) => {
        if (!answer.isCorrect) {
          addError(
            attempt.quiz.chapter.course.title,
            attempt.quiz.chapter.title,
          );
        }
      });
    });

    practiceAttempts
      .filter((attempt) => attempt.status === 'COMPLETED')
      .forEach((attempt) => {
        attempt.answers.forEach((answer) => {
          if (!answer.isCorrect) {
            addError(
              answer.question.quiz.chapter.course.title,
              answer.question.quiz.chapter.title,
            );
          }
        });
      });

    return [...areas.values()]
      .sort(
        (left, right) =>
          right.errorCount - left.errorCount ||
          left.courseTitle.localeCompare(right.courseTitle, 'zh-Hans') ||
          left.chapterTitle.localeCompare(right.chapterTitle, 'zh-Hans'),
      )
      .slice(0, MAX_WEAK_AREAS)
      .map((area) => ({
        courseTitle: area.courseTitle,
        chapterTitle: area.chapterTitle,
        errorCount: area.errorCount,
      }));
  }

  private calculateAccuracy(
    correctQuestions: number,
    answeredQuestions: number,
  ) {
    return answeredQuestions > 0
      ? Math.round((correctQuestions / answeredQuestions) * 10000) / 100
      : undefined;
  }

  private toProgressPercent(value: unknown) {
    const numericValue =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : typeof value === 'object' && value !== null && 'toNumber' in value
            ? Number((value as { toNumber: () => number }).toNumber())
            : Number.NaN;

    if (!Number.isFinite(numericValue)) {
      return undefined;
    }

    return Math.max(0, Math.min(100, Math.round(numericValue * 100) / 100));
  }

  private cleanTitle(value: string) {
    return typeof value === 'string' ? value.trim().slice(0, 90) : '';
  }
}
