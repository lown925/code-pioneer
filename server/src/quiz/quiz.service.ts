import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuestionType, QuizStatus } from '../../generated/prisma/enums';
import { type CurrentUserContext } from '../auth/auth.types';
import type { ContentBlock } from '../battle/battle.types';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitChapterQuizDto } from './dto/submit-chapter-quiz.dto';

const PUBLISHED_COURSE_STATUS = 'PUBLISHED';
const PUBLISHED_CHAPTER_STATUS = 'PUBLISHED';
const MAX_PAGE_SIZE = 50;

type LoadedQuizOption = {
  id: string;
  content: string;
  contentBlocks: unknown;
  isCorrect: boolean;
  sortOrder: number;
};

type LoadedQuizQuestion = {
  id: string;
  type: QuestionType;
  content: string;
  explanation: string | null;
  stemBlocks: unknown;
  explanationBlocks: unknown;
  score: number;
  sortOrder: number;
  options: LoadedQuizOption[];
};

type LoadedQuiz = {
  id: string;
  chapterId: string;
  title: string;
  description: string | null;
  passScorePercent: number;
  status: QuizStatus;
  questions: LoadedQuizQuestion[];
};

type QuizReadinessPayload = {
  questions: LoadedQuizQuestion[];
};

type QuizRequirement =
  | { kind: 'NONE' }
  | { kind: 'NOT_PUBLISHED'; quizId: string }
  | { kind: 'NOT_READY'; quizId: string }
  | { kind: 'READY'; quizId: string };

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async getChapterQuiz(currentUser: CurrentUserContext, chapterId: string) {
    await this.getAccessibleChapterOrThrow(chapterId);
    const quiz = await this.loadPublishedQuizOrThrow(chapterId);
    const totalScore = this.calculateTotalScore(quiz.questions);

    const [attemptCount, passedAttemptCount] = await Promise.all([
      this.prisma.quizAttempt.count({
        where: {
          userId: currentUser.id,
          quizId: quiz.id,
        },
      }),
      this.prisma.quizAttempt.count({
        where: {
          userId: currentUser.id,
          quizId: quiz.id,
          passed: true,
        },
      }),
    ]);

    return {
      success: true as const,
      data: {
        quizId: quiz.id,
        chapterId: quiz.chapterId,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questions.length,
        totalScore,
        passScorePercent: quiz.passScorePercent,
        hasPassed: passedAttemptCount > 0,
        attemptCount,
        questions: quiz.questions.map((question) => ({
          questionId: question.id,
          type: question.type,
          content: question.content,
          stemBlocks: this.resolveContentBlocks(
            question.stemBlocks,
            question.content,
          ),
          score: question.score,
          order: question.sortOrder,
          options: question.options.map((option) => ({
            optionId: option.id,
            content: option.content,
            contentBlocks: this.resolveContentBlocks(
              option.contentBlocks,
              option.content,
            ),
            order: option.sortOrder,
          })),
        })),
      },
    };
  }

  async submitChapterQuiz(
    currentUser: CurrentUserContext,
    chapterId: string,
    dto: SubmitChapterQuizDto,
  ) {
    await this.getAccessibleChapterOrThrow(chapterId);
    const quiz = await this.loadPublishedQuizOrThrow(chapterId);
    const chapterLearningRecord =
      await this.prisma.chapterLearningRecord.findUnique({
        where: {
          userId_chapterId: {
            userId: currentUser.id,
            chapterId,
          },
        },
        select: {
          status: true,
          completedAt: true,
          courseId: true,
        },
      });

    if (!chapterLearningRecord) {
      throw new BadRequestException('CHAPTER_NOT_STARTED');
    }

    const validatedAnswers = this.validateSubmittedAnswers(quiz, dto);
    const totalScore = this.calculateTotalScore(quiz.questions);
    const score = validatedAnswers.reduce(
      (sum, answer) => sum + answer.scoreAwarded,
      0,
    );
    const scorePercent = this.calculateScorePercent(score, totalScore);
    const passed = (score / totalScore) * 100 >= quiz.passScorePercent;
    const submittedAt = new Date();

    const attempt = await this.prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.quizAttempt.create({
        data: {
          userId: currentUser.id,
          quizId: quiz.id,
          score,
          totalScore,
          passed,
          submittedAt,
        },
        select: {
          id: true,
          quizId: true,
        },
      });

      await tx.quizAnswer.createMany({
        data: validatedAnswers.map((answer) => ({
          attemptId: createdAttempt.id,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: answer.isCorrect,
          scoreAwarded: answer.scoreAwarded,
          createdAt: submittedAt,
        })),
      });

      await tx.chapterLearningRecord.update({
        where: {
          userId_chapterId: {
            userId: currentUser.id,
            chapterId,
          },
        },
        data: {
          lastLearnedAt: submittedAt,
          quizCompleted: true,
        },
      });

      await tx.courseLearningRecord.updateMany({
        where: {
          userId: currentUser.id,
          courseId: chapterLearningRecord.courseId,
        },
        data: {
          lastChapterId: chapterId,
          lastLearnedAt: submittedAt,
        },
      });

      return createdAttempt;
    });

    return {
      success: true as const,
      data: {
        attemptId: attempt.id,
        quizId: attempt.quizId,
        chapterId,
        score,
        totalScore,
        scorePercent,
        passScorePercent: quiz.passScorePercent,
        passed,
        submittedAt,
        results: validatedAnswers.map((answer) => ({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          correctOptionId: answer.correctOptionId,
          isCorrect: answer.isCorrect,
          scoreAwarded: answer.scoreAwarded,
          scorePossible: answer.scorePossible,
          explanation: answer.explanation,
          explanationBlocks: this.resolveContentBlocks(
            answer.explanationBlocks,
            answer.explanation,
            false,
          ),
        })),
      },
    };
  }

  async listChapterQuizAttempts(
    currentUser: CurrentUserContext,
    chapterId: string,
    page: number,
    pageSize: number,
  ) {
    if (page < 1 || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new BadRequestException('INVALID_PARAMETER');
    }

    await this.getAccessibleChapterOrThrow(chapterId);
    const quiz = await this.loadPublishedQuizOrThrow(chapterId);
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.quizAttempt.findMany({
        where: {
          userId: currentUser.id,
          quizId: quiz.id,
        },
        orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          score: true,
          totalScore: true,
          passed: true,
          submittedAt: true,
        },
      }),
      this.prisma.quizAttempt.count({
        where: {
          userId: currentUser.id,
          quizId: quiz.id,
        },
      }),
    ]);

    return {
      success: true as const,
      data: {
        items: items.map((item) => ({
          attemptId: item.id,
          score: item.score,
          totalScore: item.totalScore,
          scorePercent: this.calculateScorePercent(item.score, item.totalScore),
          passed: item.passed,
          submittedAt: item.submittedAt,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        },
      },
    };
  }

  async getQuizAttemptDetail(
    currentUser: CurrentUserContext,
    attemptId: string,
  ) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId: currentUser.id,
      },
      select: {
        id: true,
        quizId: true,
        score: true,
        totalScore: true,
        passed: true,
        submittedAt: true,
        quiz: {
          select: {
            chapterId: true,
            passScorePercent: true,
          },
        },
        answers: {
          select: {
            questionId: true,
            selectedOptionId: true,
            isCorrect: true,
            scoreAwarded: true,
            question: {
              select: {
                type: true,
                content: true,
                explanation: true,
                explanationBlocks: true,
                score: true,
                sortOrder: true,
                options: {
                  orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
                  select: {
                    id: true,
                    isCorrect: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('QUIZ_ATTEMPT_NOT_FOUND');
    }

    const results = [...attempt.answers]
      .sort((left, right) => left.question.sortOrder - right.question.sortOrder)
      .map((answer) => {
        const correctOption = answer.question.options.find(
          (option) => option.isCorrect,
        );

        if (!correctOption) {
          throw new BadRequestException('QUIZ_NOT_READY');
        }

        return {
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          correctOptionId: correctOption.id,
          type: answer.question.type,
          content: answer.question.content,
          isCorrect: answer.isCorrect,
          scoreAwarded: answer.scoreAwarded,
          scorePossible: answer.question.score,
          explanation: answer.question.explanation,
          explanationBlocks: this.resolveContentBlocks(
            answer.question.explanationBlocks,
            answer.question.explanation,
            false,
          ),
        };
      });

    return {
      success: true as const,
      data: {
        attemptId: attempt.id,
        quizId: attempt.quizId,
        chapterId: attempt.quiz.chapterId,
        score: attempt.score,
        totalScore: attempt.totalScore,
        scorePercent: this.calculateScorePercent(
          attempt.score,
          attempt.totalScore,
        ),
        passScorePercent: attempt.quiz.passScorePercent,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
        results: results.map((result) => ({
          questionId: result.questionId,
          selectedOptionId: result.selectedOptionId,
          correctOptionId: result.correctOptionId,
          isCorrect: result.isCorrect,
          scoreAwarded: result.scoreAwarded,
          scorePossible: result.scorePossible,
          explanation: result.explanation,
          explanationBlocks: result.explanationBlocks,
        })),
      },
    };
  }

  async getChapterQuizRequirement(chapterId: string): Promise<QuizRequirement> {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        chapterId,
      },
      select: {
        id: true,
        status: true,
        questions: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            type: true,
            content: true,
            explanation: true,
            stemBlocks: true,
            explanationBlocks: true,
            score: true,
            sortOrder: true,
            options: {
              orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
              select: {
                id: true,
                content: true,
                contentBlocks: true,
                isCorrect: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return { kind: 'NONE' };
    }

    if (quiz.status !== QuizStatus.PUBLISHED) {
      return {
        kind: 'NOT_PUBLISHED',
        quizId: quiz.id,
      };
    }

    return this.isQuizReady(quiz)
      ? {
          kind: 'READY',
          quizId: quiz.id,
        }
      : {
          kind: 'NOT_READY',
          quizId: quiz.id,
        };
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
      },
    });

    if (!chapter) {
      throw new NotFoundException('CHAPTER_NOT_FOUND');
    }

    return chapter;
  }

  private async loadPublishedQuizOrThrow(chapterId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        chapterId,
      },
      select: {
        id: true,
        chapterId: true,
        title: true,
        description: true,
        passScorePercent: true,
        status: true,
        questions: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            type: true,
            content: true,
            explanation: true,
            stemBlocks: true,
            explanationBlocks: true,
            score: true,
            sortOrder: true,
            options: {
              orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
              select: {
                id: true,
                content: true,
                contentBlocks: true,
                isCorrect: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('QUIZ_NOT_FOUND');
    }

    if (quiz.status !== QuizStatus.PUBLISHED) {
      throw new BadRequestException('QUIZ_NOT_PUBLISHED');
    }

    if (!this.isQuizReady(quiz)) {
      throw new BadRequestException('QUIZ_NOT_READY');
    }

    return quiz satisfies LoadedQuiz;
  }

  private isQuizReady(quiz: QuizReadinessPayload) {
    if (quiz.questions.length === 0) {
      return false;
    }

    return quiz.questions.every((question) => {
      if (question.score <= 0) {
        return false;
      }

      const correctOptions = question.options.filter(
        (option) => option.isCorrect,
      );

      if (correctOptions.length !== 1) {
        return false;
      }

      if (question.type === QuestionType.TRUE_FALSE) {
        return question.options.length === 2;
      }

      return question.options.length >= 2;
    });
  }

  private validateSubmittedAnswers(
    quiz: LoadedQuiz,
    dto: SubmitChapterQuizDto,
  ) {
    const answersByQuestionId = new Map<string, string>();
    const questionsById = new Map(
      quiz.questions.map((question) => [question.id, question]),
    );

    for (const answer of dto.answers) {
      if (answersByQuestionId.has(answer.questionId)) {
        throw new BadRequestException('QUIZ_QUESTION_DUPLICATED');
      }

      if (!questionsById.has(answer.questionId)) {
        throw new BadRequestException('QUIZ_QUESTION_INVALID');
      }

      answersByQuestionId.set(answer.questionId, answer.selectedOptionId);
    }

    if (answersByQuestionId.size !== quiz.questions.length) {
      throw new BadRequestException('QUIZ_ANSWER_INCOMPLETE');
    }

    return quiz.questions.map((question) => {
      const selectedOptionId = answersByQuestionId.get(question.id);

      if (!selectedOptionId) {
        throw new BadRequestException('QUIZ_ANSWER_INCOMPLETE');
      }

      const selectedOption = question.options.find(
        (option) => option.id === selectedOptionId,
      );

      if (!selectedOption) {
        throw new BadRequestException('QUIZ_OPTION_INVALID');
      }

      const correctOption = question.options.find((option) => option.isCorrect);

      if (!correctOption) {
        throw new BadRequestException('QUIZ_NOT_READY');
      }

      const isCorrect = selectedOption.id === correctOption.id;

      return {
        questionId: question.id,
        selectedOptionId: selectedOption.id,
        correctOptionId: correctOption.id,
        isCorrect,
        scoreAwarded: isCorrect ? question.score : 0,
        scorePossible: question.score,
        explanation: question.explanation,
        explanationBlocks: question.explanationBlocks,
      };
    });
  }

  private calculateTotalScore(questions: LoadedQuizQuestion[]) {
    return questions.reduce((sum, question) => sum + question.score, 0);
  }

  private calculateScorePercent(score: number, totalScore: number) {
    if (totalScore <= 0) {
      return 0;
    }

    return Math.round((score / totalScore) * 100);
  }

  private resolveContentBlocks(
    rawBlocks: unknown,
    fallbackText: string | null,
    includeFallbackText = true,
  ): ContentBlock[] {
    if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
      return rawBlocks as ContentBlock[];
    }

    if (!includeFallbackText || !fallbackText) {
      return [];
    }

    return [
      {
        type: 'TEXT',
        text: fallbackText,
      },
    ];
  }
}
