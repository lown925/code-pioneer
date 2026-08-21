import { Injectable } from '@nestjs/common';
import { BattleQuestionDifficulty, ChapterStatus, CourseStatus, QuestionType, QuizStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { getCourseCatalogEntry, getTrackDefinition, PROFESSIONAL_TRACK_CATALOG } from './course-catalog';

const SUPPORTED_PRACTICE_TYPES = new Set<QuestionType>([
  QuestionType.SINGLE_CHOICE,
  QuestionType.TRUE_FALSE,
  QuestionType.FILL_BLANK,
  QuestionType.CODE_FILL,
]);

@Injectable()
export class CourseCapabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublishedCapabilities() {
    const courses = await this.prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: { id: true, slug: true, title: true, language: true, chapters: {
        where: { status: ChapterStatus.PUBLISHED, deletedAt: null },
        select: { quiz: { where: { status: QuizStatus.PUBLISHED }, select: { questions: { select: {
          isBattleEnabled: true, battleDifficulty: true, battlePresentation: true, type: true, acceptedAnswers: true,
          options: { select: { isCorrect: true } },
        } } } } },
      } },
    });

    return courses.map((course) => {
      const questions = course.chapters.flatMap((chapter) => chapter.quiz?.questions ?? []);
      const practiceQuestions = questions.filter((question) =>
        SUPPORTED_PRACTICE_TYPES.has(question.type),
      );
      const metadata = getCourseCatalogEntry(course.slug);
      const battleQuestionCount = questions.filter((question) =>
        question.isBattleEnabled &&
        (question.battleDifficulty === BattleQuestionDifficulty.MEDIUM || question.battleDifficulty === BattleQuestionDifficulty.HARD) &&
        question.battlePresentation !== null &&
        ((question.type === QuestionType.SINGLE_CHOICE && question.options.length >= 2 && question.options.filter((option) => option.isCorrect).length === 1) ||
          (question.type === QuestionType.CODE_FILL && Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.some((answer) => typeof answer === 'string' && answer.trim().length > 0))),
      ).length;
      return {
        courseId: course.id,
        slug: course.slug,
        title: course.title,
        order: metadata?.order ?? 0,
        implementationLanguage: metadata?.implementationLanguage ?? course.language,
        subjectCategory: metadata?.subjectCategory ?? 'GENERAL',
        professionalTracks: metadata?.professionalTracks ?? [],
        interests: metadata?.interests ?? [],
        prerequisites: metadata?.prerequisites ?? [],
        nextCourses: metadata?.nextCourses ?? [],
        practiceQuestionCount: practiceQuestions.length,
        battleQuestionCount,
        supportsPractice: practiceQuestions.length > 0,
        supportsBattle: battleQuestionCount > 0,
      };
    });
  }

  async getTrackCapabilities(trackKey: string) {
    const track = getTrackDefinition(trackKey);
    if (!track) return null;
    const courses = await this.getPublishedCapabilities();
    return { track, courses: courses.filter((course) => course.professionalTracks.includes(trackKey)) };
  }

  getTrackCatalog() {
    return PROFESSIONAL_TRACK_CATALOG;
  }
}
