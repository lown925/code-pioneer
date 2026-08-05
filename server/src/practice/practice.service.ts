import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { PracticeAttemptStatus, QuestionType } from '../../generated/prisma/enums';
import type { CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  evaluateTextAnswer,
  isTextQuestionType,
  parseAcceptedAnswers,
} from '../question/question-answer';
import type { CreatePracticeAttemptDto } from './dto/create-practice-attempt.dto';
import type { SubmitPracticeAnswerDto } from './dto/submit-practice-answer.dto';

const SUPPORTED_TYPES = [
  QuestionType.SINGLE_CHOICE,
  QuestionType.TRUE_FALSE,
  QuestionType.FILL_BLANK,
  QuestionType.CODE_FILL,
];

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  async getTargets(_currentUser: CurrentUserContext) {
    const courses = await this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        category: true,
        language: true,
        chapters: {
          where: { status: 'PUBLISHED', deletedAt: null },
          select: {
            quiz: {
              select: {
                status: true,
                questions: {
                  where: { type: { in: SUPPORTED_TYPES } },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true as const,
      data: {
        items: courses
          .map((course) => ({
            courseId: course.id,
            courseTitle: course.title,
            category: course.category,
            language: course.language,
            availableQuestionCount: course.chapters.reduce(
              (sum, chapter) =>
                sum +
                (chapter.quiz?.status === 'PUBLISHED'
                  ? chapter.quiz.questions.length
                  : 0),
              0,
            ),
          }))
          .filter((course) => course.availableQuestionCount > 0),
      },
    };
  }

  async createAttempt(
    currentUser: CurrentUserContext,
    dto: CreatePracticeAttemptDto,
  ) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, status: 'PUBLISHED', deletedAt: null },
      select: { id: true, title: true, category: true, language: true },
    });

    if (!course) {
      throw new NotFoundException('COURSE_NOT_FOUND');
    }

    const questions = await this.prisma.quizQuestion.findMany({
      where: {
        type: { in: SUPPORTED_TYPES },
        quiz: {
          status: 'PUBLISHED',
          chapter: {
            courseId: course.id,
            status: 'PUBLISHED',
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        type: true,
        content: true,
        stemBlocks: true,
        programmingLanguage: true,
        options: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: { id: true, content: true, contentBlocks: true, sortOrder: true },
        },
      },
    });

    if (questions.length < dto.questionCount) {
      throw new BadRequestException('PRACTICE_NOT_ENOUGH_QUESTIONS');
    }

    const selectedQuestions = this.shuffle(questions).slice(
      0,
      dto.questionCount,
    );
    const attempt = await this.prisma.practiceAttempt.create({
      data: {
        userId: currentUser.id,
        courseId: course.id,
        requestedQuestionCount: dto.questionCount,
      },
      select: { id: true, createdAt: true },
    });

    return {
      success: true as const,
      data: {
        attemptId: attempt.id,
        course,
        questionCount: selectedQuestions.length,
        startedAt: attempt.createdAt,
        questions: selectedQuestions.map((question, index) => ({
          questionId: question.id,
          order: index + 1,
          type: question.type,
          content: question.content,
          stemBlocks: this.resolveBlocks(question.stemBlocks, question.content),
          programmingLanguage: question.programmingLanguage,
          options: question.options.map((option) => ({
            optionId: option.id,
            content: option.content,
            contentBlocks: this.resolveBlocks(option.contentBlocks, option.content),
            order: option.sortOrder,
          })),
        })),
      },
    };
  }

  async submitAnswer(
    currentUser: CurrentUserContext,
    attemptId: string,
    dto: SubmitPracticeAnswerDto,
  ) {
    const attempt = await this.prisma.practiceAttempt.findFirst({
      where: { id: attemptId, userId: currentUser.id },
      select: {
        id: true,
        courseId: true,
        requestedQuestionCount: true,
        status: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('PRACTICE_ATTEMPT_NOT_FOUND');
    }

    const existing = await this.prisma.practiceAnswer.findUnique({
      where: { attemptId_questionId: { attemptId, questionId: dto.questionId } },
      select: { selectedOptionId: true, answerText: true },
    });

    if (existing) {
      return this.buildAnswerResponse(
        attempt,
        dto.questionId,
        existing,
      );
    }

    if (attempt.status !== PracticeAttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('PRACTICE_ATTEMPT_COMPLETED');
    }

    const question = await this.loadQuestion(attempt.courseId, dto.questionId);
    const evaluated = this.evaluateSubmittedAnswer(question, dto);

    try {
      await this.prisma.practiceAnswer.create({
        data: {
          attemptId,
          userId: currentUser.id,
          questionId: question.id,
          ...(evaluated.selectedOptionId
            ? { selectedOptionId: evaluated.selectedOptionId }
            : {
                answerText: evaluated.answerText,
                normalizedAnswer: evaluated.normalizedAnswer,
              }),
          isCorrect: evaluated.isCorrect,
        },
      });
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        throw error;
      }

      const concurrentAnswer = await this.prisma.practiceAnswer.findUnique({
        where: {
          attemptId_questionId: { attemptId, questionId: dto.questionId },
        },
        select: { selectedOptionId: true, answerText: true },
      });

      if (!concurrentAnswer) {
        throw error;
      }

      return this.buildAnswerResponse(
        attempt,
        dto.questionId,
        concurrentAnswer,
      );
    }

    const answeredCount = await this.prisma.practiceAnswer.count({
      where: { attemptId },
    });
    const completed = answeredCount >= attempt.requestedQuestionCount;

    if (completed) {
      await this.prisma.practiceAttempt.update({
        where: { id: attemptId },
        data: {
          status: PracticeAttemptStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    return {
      success: true as const,
      data: {
        questionId: question.id,
        selectedOptionId: evaluated.selectedOptionId,
        answerText: evaluated.answerText,
        correctOptionId: evaluated.correctOptionId,
        acceptedAnswers: evaluated.acceptedAnswers,
        isCorrect: evaluated.isCorrect,
        explanation: question.explanation,
        explanationBlocks: this.resolveBlocks(question.explanationBlocks, question.explanation ?? ''),
        answeredCount,
        totalQuestionCount: attempt.requestedQuestionCount,
        completed,
      },
    };
  }

  private async buildAnswerResponse(
    attempt: { id: string; courseId: string; requestedQuestionCount: number },
    questionId: string,
    storedAnswer: { selectedOptionId: string | null; answerText: string | null },
  ) {
    const question = await this.loadQuestion(attempt.courseId, questionId);
    const evaluated = this.evaluateSubmittedAnswer(question, {
      questionId,
      ...(storedAnswer.selectedOptionId
        ? { selectedOptionId: storedAnswer.selectedOptionId }
        : { answerText: storedAnswer.answerText ?? '' }),
    });
    const answeredCount = await this.prisma.practiceAnswer.count({
      where: { attemptId: attempt.id },
    });

    return {
      success: true as const,
      data: {
        questionId,
        selectedOptionId: evaluated.selectedOptionId,
        answerText: evaluated.answerText,
        correctOptionId: evaluated.correctOptionId,
        acceptedAnswers: evaluated.acceptedAnswers,
        isCorrect: evaluated.isCorrect,
        explanation: question.explanation,
        explanationBlocks: this.resolveBlocks(question.explanationBlocks, question.explanation ?? ''),
        answeredCount,
        totalQuestionCount: attempt.requestedQuestionCount,
        completed: answeredCount >= attempt.requestedQuestionCount,
      },
    };
  }

  private async loadQuestion(courseId: string, questionId: string) {
    const question = await this.prisma.quizQuestion.findFirst({
      where: {
        id: questionId,
        type: { in: SUPPORTED_TYPES },
        quiz: {
          status: 'PUBLISHED',
          chapter: {
            courseId,
            status: 'PUBLISHED',
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        type: true,
        explanation: true,
        explanationBlocks: true,
        acceptedAnswers: true,
        answerNormalization: true,
        options: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: { id: true, isCorrect: true },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('PRACTICE_QUESTION_NOT_FOUND');
    }

    return question;
  }

  private evaluateSubmittedAnswer(
    question: Awaited<ReturnType<PracticeService['loadQuestion']>>,
    dto: SubmitPracticeAnswerDto,
  ) {
    const hasOption = typeof dto.selectedOptionId === 'string';
    const hasText = typeof dto.answerText === 'string';
    if (hasOption === hasText) {
      throw new BadRequestException('PRACTICE_ANSWER_INVALID');
    }

    if (isTextQuestionType(question.type)) {
      if (!hasText || hasOption) {
        throw new BadRequestException('PRACTICE_ANSWER_INVALID');
      }

      const evaluation = evaluateTextAnswer({
        type: question.type,
        value: dto.answerText!,
        acceptedAnswers: question.acceptedAnswers,
        answerNormalization: question.answerNormalization,
      });

      return {
        selectedOptionId: null,
        answerText: evaluation.answerText,
        normalizedAnswer: evaluation.normalizedAnswer,
        correctOptionId: null,
        acceptedAnswers: evaluation.acceptedAnswers,
        isCorrect: evaluation.isCorrect,
      };
    }

    if (!hasOption || hasText) {
      throw new BadRequestException('PRACTICE_ANSWER_INVALID');
    }

    const selectedOption = question.options.find(
      (option) => option.id === dto.selectedOptionId,
    );
    const correctOptions = question.options.filter((option) => option.isCorrect);
    if (!selectedOption || correctOptions.length !== 1) {
      throw new BadRequestException('PRACTICE_INVALID_OPTION');
    }

    return {
      selectedOptionId: selectedOption.id,
      answerText: null,
      normalizedAnswer: null,
      correctOptionId: correctOptions[0]!.id,
      acceptedAnswers: null,
      isCorrect: selectedOption.isCorrect,
    };
  }

  private resolveBlocks(value: unknown, fallback: string) {
    return Array.isArray(value) && value.length > 0
      ? value
      : fallback.trim()
        ? [{ type: 'TEXT', text: fallback }]
        : [];
  }

  private shuffle<T>(items: T[]) {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
    }

    return result;
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2002'
    );
  }
}
