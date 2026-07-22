import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { QuestionType } from '../../generated/prisma/enums';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { GetWrongQuestionsQueryDto } from './dto/get-wrong-questions-query.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

type WrongQuestionListAggregateRow = {
  questionId: string;
  wrongCount: number | bigint;
  lastWrongAt: Date;
};

type WrongQuestionCountRow = {
  total: number | bigint;
};

type WrongQuestionStatisticsRow = {
  totalWrongQuestions: number | bigint;
  totalWrongAnswers: number | bigint;
  courseCount: number | bigint;
  latestWrongAt: Date | null;
};

type WrongQuestionDetailAggregateRow = {
  wrongCount: number | bigint;
  lastWrongAt: Date;
};

type ResolvedFilter = {
  courseId?: string;
  chapterId?: string;
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
    const skip = (page - 1) * pageSize;
    const filters = await this.resolveFilters(query.courseId, query.chapterId);
    const whereClause = this.buildAggregateWhereClause(currentUser.id, filters);

    const [countRows, aggregateRows] = await Promise.all([
      this.prisma.$queryRaw<WrongQuestionCountRow[]>(Prisma.sql`
        SELECT COUNT(*)::int AS "total"
        FROM (
          SELECT qa.question_id
          FROM quiz_answers qa
          INNER JOIN quiz_attempts attempt ON attempt.id = qa.attempt_id
          INNER JOIN quiz_questions question ON question.id = qa.question_id
          INNER JOIN quizzes quiz ON quiz.id = question.quiz_id
          INNER JOIN course_chapters chapter ON chapter.id = quiz.chapter_id
          WHERE ${whereClause}
          GROUP BY qa.question_id
        ) grouped
      `),
      this.prisma.$queryRaw<WrongQuestionListAggregateRow[]>(Prisma.sql`
        SELECT
          qa.question_id AS "questionId",
          COUNT(*)::int AS "wrongCount",
          MAX(attempt.submitted_at) AS "lastWrongAt"
        FROM quiz_answers qa
        INNER JOIN quiz_attempts attempt ON attempt.id = qa.attempt_id
        INNER JOIN quiz_questions question ON question.id = qa.question_id
        INNER JOIN quizzes quiz ON quiz.id = question.quiz_id
        INNER JOIN course_chapters chapter ON chapter.id = quiz.chapter_id
        WHERE ${whereClause}
        GROUP BY qa.question_id
        ORDER BY MAX(attempt.submitted_at) DESC, qa.question_id ASC
        OFFSET ${skip}
        LIMIT ${pageSize}
      `),
    ]);

    const total = this.toNumber(countRows[0]?.total ?? 0);

    if (aggregateRows.length === 0) {
      return {
        success: true as const,
        data: {
          items: [],
          pagination: {
            page,
            pageSize,
            total,
            totalPages: 0,
          },
        },
      };
    }

    const questionIds = aggregateRows.map((row) => row.questionId);
    const questions = await this.prisma.quizQuestion.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      select: {
        id: true,
        type: true,
        content: true,
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
    });

    const questionMap = new Map(
      questions.map((question) => [question.id, question]),
    );
    const items = aggregateRows.map((row) => {
      const question = questionMap.get(row.questionId);

      if (!question) {
        throw new BadRequestException('QUIZ_NOT_READY');
      }

      return {
        questionId: question.id,
        questionType: question.type,
        questionContent: question.content,
        courseId: question.quiz.chapter.courseId,
        courseTitle: question.quiz.chapter.course.title,
        chapterId: question.quiz.chapterId,
        chapterTitle: question.quiz.chapter.title,
        wrongCount: this.toNumber(row.wrongCount),
        lastWrongAt: row.lastWrongAt,
      };
    });

    return {
      success: true as const,
      data: {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  async getStatistics(currentUser: CurrentUserContext) {
    const rows = await this.prisma.$queryRaw<WrongQuestionStatisticsRow[]>(
      Prisma.sql`
        SELECT
          COUNT(DISTINCT qa.question_id)::int AS "totalWrongQuestions",
          COUNT(*)::int AS "totalWrongAnswers",
          COUNT(DISTINCT chapter.course_id)::int AS "courseCount",
          MAX(attempt.submitted_at) AS "latestWrongAt"
        FROM quiz_answers qa
        INNER JOIN quiz_attempts attempt ON attempt.id = qa.attempt_id
        INNER JOIN quiz_questions question ON question.id = qa.question_id
        INNER JOIN quizzes quiz ON quiz.id = question.quiz_id
        INNER JOIN course_chapters chapter ON chapter.id = quiz.chapter_id
        WHERE attempt.user_id = ${currentUser.id}::uuid
          AND qa.is_correct = false
      `,
    );

    const row = rows[0];

    return {
      success: true as const,
      data: {
        totalWrongQuestions: this.toNumber(row?.totalWrongQuestions ?? 0),
        totalWrongAnswers: this.toNumber(row?.totalWrongAnswers ?? 0),
        courseCount: this.toNumber(row?.courseCount ?? 0),
        latestWrongAt: row?.latestWrongAt ?? null,
      },
    };
  }

  async getDetail(currentUser: CurrentUserContext, questionId: string) {
    const aggregateRows = await this.prisma.$queryRaw<
      WrongQuestionDetailAggregateRow[]
    >(Prisma.sql`
        SELECT
          COUNT(*)::int AS "wrongCount",
          MAX(attempt.submitted_at) AS "lastWrongAt"
        FROM quiz_answers qa
        INNER JOIN quiz_attempts attempt ON attempt.id = qa.attempt_id
        WHERE attempt.user_id = ${currentUser.id}::uuid
          AND qa.is_correct = false
          AND qa.question_id = ${questionId}::uuid
        GROUP BY qa.question_id
      `);

    const aggregateRow = aggregateRows[0];

    if (!aggregateRow) {
      throw new NotFoundException('WRONG_QUESTION_NOT_FOUND');
    }

    const question = await this.prisma.quizQuestion.findUnique({
      where: {
        id: questionId,
      },
      select: {
        id: true,
        type: true,
        content: true,
        explanation: true,
        options: {
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            id: true,
            content: true,
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
    });

    if (!question) {
      throw new BadRequestException('QUIZ_NOT_READY');
    }

    if (
      question.type !== QuestionType.SINGLE_CHOICE &&
      question.type !== QuestionType.TRUE_FALSE
    ) {
      throw new BadRequestException('QUIZ_NOT_READY');
    }

    const correctOptions = question.options.filter(
      (option) => option.isCorrect,
    );

    if (correctOptions.length !== 1) {
      throw new BadRequestException('QUIZ_NOT_READY');
    }

    return {
      success: true as const,
      data: {
        questionId: question.id,
        questionType: question.type,
        content: question.content,
        courseId: question.quiz.chapter.courseId,
        courseTitle: question.quiz.chapter.course.title,
        chapterId: question.quiz.chapterId,
        chapterTitle: question.quiz.chapter.title,
        options: question.options.map((option) => ({
          optionId: option.id,
          content: option.content,
          order: option.sortOrder,
        })),
        correctOptionId: correctOptions[0].id,
        explanation: question.explanation,
        wrongCount: this.toNumber(aggregateRow.wrongCount),
        lastWrongAt: aggregateRow.lastWrongAt,
      },
    };
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
    } satisfies ResolvedFilter;
  }

  private buildAggregateWhereClause(userId: string, filters: ResolvedFilter) {
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

  private toNumber(value: number | bigint) {
    return typeof value === 'bigint' ? Number(value) : value;
  }
}
