/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  LearningStatus,
  QuestionType,
  QuizStatus,
} from '../../generated/prisma/enums';
import { QuizService } from './quiz.service';

type CourseRecord = {
  id: string;
  status: 'PUBLISHED';
  deletedAt: Date | null;
};

type ChapterRecord = {
  id: string;
  courseId: string;
  status: 'PUBLISHED';
  deletedAt: Date | null;
};

type QuizRecord = {
  id: string;
  chapterId: string;
  title: string;
  description: string | null;
  passScorePercent: number;
  status: QuizStatus;
};

type QuizQuestionRecord = {
  id: string;
  quizId: string;
  type: QuestionType;
  content: string;
  explanation: string | null;
  score: number;
  sortOrder: number;
};

type QuizOptionRecord = {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
};

type ChapterLearningRecord = {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  status: LearningStatus;
  completedAt: Date | null;
  lastLearnedAt: Date;
  quizCompleted: boolean;
};

type CourseLearningRecord = {
  id: string;
  userId: string;
  courseId: string;
  lastChapterId: string | null;
  lastLearnedAt: Date | null;
};

type QuizAttemptRecord = {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalScore: number;
  passed: boolean;
  submittedAt: Date;
  createdAt: Date;
};

type QuizAnswerRecord = {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  scoreAwarded: number;
  createdAt: Date;
};

function createMockPrisma() {
  const courses = new Map<string, CourseRecord>();
  const chapters = new Map<string, ChapterRecord>();
  const quizzes = new Map<string, QuizRecord>();
  const questions = new Map<string, QuizQuestionRecord>();
  const options = new Map<string, QuizOptionRecord>();
  const chapterLearningRecords = new Map<string, ChapterLearningRecord>();
  const courseLearningRecords = new Map<string, CourseLearningRecord>();
  const attempts = new Map<string, QuizAttemptRecord>();
  const answers = new Map<string, QuizAnswerRecord>();

  const chapterLearningKey = (userId: string, chapterId: string) =>
    `${userId}:${chapterId}`;
  const courseLearningKey = (userId: string, courseId: string) =>
    `${userId}:${courseId}`;

  const getQuizByChapterId = (chapterId: string) => {
    const quiz = [...quizzes.values()].find(
      (item) => item.chapterId === chapterId,
    );

    if (!quiz) {
      return null;
    }

    const quizQuestions = [...questions.values()]
      .filter((question) => question.quizId === quiz.id)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((question) => ({
        ...question,
        options: [...options.values()]
          .filter((option) => option.questionId === question.id)
          .sort((left, right) => left.sortOrder - right.sortOrder),
      }));

    return {
      ...quiz,
      questions: quizQuestions,
    };
  };

  const getAttemptDetail = (attemptId: string, userId: string) => {
    const attempt = attempts.get(attemptId);

    if (!attempt || attempt.userId !== userId) {
      return null;
    }

    const quiz = quizzes.get(attempt.quizId);

    if (!quiz) {
      return null;
    }

    const attemptAnswers = [...answers.values()]
      .filter((answer) => answer.attemptId === attempt.id)
      .map((answer) => {
        const question = questions.get(answer.questionId);

        if (!question) {
          throw new Error('Question not found');
        }

        return {
          ...answer,
          question: {
            type: question.type,
            content: question.content,
            explanation: question.explanation,
            score: question.score,
            sortOrder: question.sortOrder,
            options: [...options.values()]
              .filter((option) => option.questionId === question.id)
              .sort((left, right) => left.sortOrder - right.sortOrder),
          },
        };
      });

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      score: attempt.score,
      totalScore: attempt.totalScore,
      passed: attempt.passed,
      submittedAt: attempt.submittedAt,
      quiz: {
        chapterId: quiz.chapterId,
        passScorePercent: quiz.passScorePercent,
      },
      answers: attemptAnswers,
    };
  };

  const prisma = {
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

        return { id: chapter.id };
      }),
    },
    quiz: {
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        return getQuizByChapterId(where.chapterId);
      }),
    },
    quizAttempt: {
      count: jest.fn(async ({ where }: { where: any }) => {
        return [...attempts.values()].filter(
          (attempt) =>
            attempt.userId === where.userId &&
            attempt.quizId === where.quizId &&
            (where.passed === undefined || attempt.passed === where.passed),
        ).length;
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        const createdAttempt: QuizAttemptRecord = {
          id: data.id ?? randomUUID(),
          userId: data.userId,
          quizId: data.quizId,
          score: data.score,
          totalScore: data.totalScore,
          passed: data.passed,
          submittedAt: data.submittedAt,
          createdAt: data.submittedAt,
        };

        attempts.set(createdAttempt.id, createdAttempt);
        return {
          id: createdAttempt.id,
          quizId: createdAttempt.quizId,
        };
      }),
      findMany: jest.fn(async ({ where }: { where: any }) => {
        return [...attempts.values()]
          .filter(
            (attempt) =>
              attempt.userId === where.userId &&
              attempt.quizId === where.quizId,
          )
          .sort((left, right) => {
            const submittedDiff =
              right.submittedAt.getTime() - left.submittedAt.getTime();

            if (submittedDiff !== 0) {
              return submittedDiff;
            }

            return right.createdAt.getTime() - left.createdAt.getTime();
          });
      }),
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        return getAttemptDetail(where.id, where.userId);
      }),
    },
    quizAnswer: {
      createMany: jest.fn(async ({ data }: { data: any }) => {
        for (const item of data as Array<Record<string, unknown>>) {
          const answerId = typeof item.id === 'string' ? item.id : randomUUID();

          answers.set(answerId, {
            id: answerId,
            attemptId: item.attemptId as string,
            questionId: item.questionId as string,
            selectedOptionId: item.selectedOptionId as string,
            isCorrect: item.isCorrect as boolean,
            scoreAwarded: item.scoreAwarded as number,
            createdAt: item.createdAt as Date,
          });
        }

        return {
          count: data.length,
        };
      }),
    },
    chapterLearningRecord: {
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        return (
          chapterLearningRecords.get(
            chapterLearningKey(
              where.userId_chapterId.userId,
              where.userId_chapterId.chapterId,
            ),
          ) ?? null
        );
      }),
      update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
        const key = chapterLearningKey(
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
        };

        chapterLearningRecords.set(key, updated);
        return updated;
      }),
    },
    courseLearningRecord: {
      updateMany: jest.fn(
        async ({ where, data }: { where: any; data: any }) => {
          const key = courseLearningKey(where.userId, where.courseId);
          const existing = courseLearningRecords.get(key);

          if (!existing) {
            return { count: 0 };
          }

          courseLearningRecords.set(key, {
            ...existing,
            ...data,
          });
          return { count: 1 };
        },
      ),
    },
    $transaction: jest.fn(
      async (callback: (client: any) => Promise<unknown>) =>
        callback(prisma),
    ),
  };

  return {
    prisma,
    courses,
    chapters,
    quizzes,
    questions,
    options,
    chapterLearningRecords,
    courseLearningRecords,
    attempts,
    answers,
  };
}

function seedQuizState(mock: ReturnType<typeof createMockPrisma>) {
  const courseId = '11111111-1111-4111-8111-111111111111';
  const chapterId = '22222222-2222-4222-8222-222222222221';
  const quizId = '33333333-3333-4333-8333-333333333333';
  const questionOneId = '44444444-4444-4444-8444-444444444441';
  const questionTwoId = '44444444-4444-4444-8444-444444444442';
  const optionOneId = '55555555-5555-4555-8555-555555555551';
  const optionTwoId = '55555555-5555-4555-8555-555555555552';
  const optionThreeId = '55555555-5555-4555-8555-555555555553';
  const optionFourId = '55555555-5555-4555-8555-555555555554';

  mock.courses.set(courseId, {
    id: courseId,
    status: 'PUBLISHED',
    deletedAt: null,
  });
  mock.chapters.set(chapterId, {
    id: chapterId,
    courseId,
    status: 'PUBLISHED',
    deletedAt: null,
  });
  mock.quizzes.set(quizId, {
    id: quizId,
    chapterId,
    title: 'Chapter Quiz',
    description: 'Basic quiz',
    passScorePercent: 60,
    status: QuizStatus.PUBLISHED,
  });
  mock.questions.set(questionOneId, {
    id: questionOneId,
    quizId,
    type: QuestionType.SINGLE_CHOICE,
    content: 'Which function prints text in Python?',
    explanation: 'print() writes text to standard output.',
    score: 20,
    sortOrder: 1,
  });
  mock.questions.set(questionTwoId, {
    id: questionTwoId,
    quizId,
    type: QuestionType.TRUE_FALSE,
    content: 'Python is case-sensitive.',
    explanation: 'Python treats Name and name as different identifiers.',
    score: 20,
    sortOrder: 2,
  });
  mock.options.set(optionOneId, {
    id: optionOneId,
    questionId: questionOneId,
    content: 'print()',
    isCorrect: true,
    sortOrder: 1,
  });
  mock.options.set(optionTwoId, {
    id: optionTwoId,
    questionId: questionOneId,
    content: 'echo()',
    isCorrect: false,
    sortOrder: 2,
  });
  mock.options.set(optionThreeId, {
    id: optionThreeId,
    questionId: questionTwoId,
    content: 'TRUE',
    isCorrect: true,
    sortOrder: 1,
  });
  mock.options.set(optionFourId, {
    id: optionFourId,
    questionId: questionTwoId,
    content: 'FALSE',
    isCorrect: false,
    sortOrder: 2,
  });

  return {
    courseId,
    chapterId,
    quizId,
    questionOneId,
    questionTwoId,
    optionOneId,
    optionTwoId,
    optionThreeId,
    optionFourId,
  };
}

describe('QuizService', () => {
  const currentUser = {
    id: '99999999-9999-4999-8999-999999999999',
    sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    tokenType: 'USER' as const,
    role: 'NORMAL' as const,
  };

  it('returns quiz questions without leaking correct answers or explanations', async () => {
    const mock = createMockPrisma();
    const service = new QuizService(mock.prisma as never);
    const { chapterId, quizId } = seedQuizState(mock);

    mock.attempts.set('attempt-1', {
      id: 'attempt-1',
      userId: currentUser.id,
      quizId,
      score: 40,
      totalScore: 40,
      passed: true,
      submittedAt: new Date('2026-07-20T10:00:00.000Z'),
      createdAt: new Date('2026-07-20T10:00:00.000Z'),
    });

    const result = await service.getChapterQuiz(currentUser, chapterId);

    expect(result.data.hasPassed).toBe(true);
    expect(result.data.attemptCount).toBe(1);
    expect(result.data.questions[0]).not.toHaveProperty('correctOptionId');
    expect(result.data.questions[0]).not.toHaveProperty('explanation');
    expect(result.data.questions[0]?.options[0]).not.toHaveProperty(
      'isCorrect',
    );
  });

  it('rejects submitting quiz answers before the chapter is started', async () => {
    const mock = createMockPrisma();
    const service = new QuizService(mock.prisma as never);
    const {
      chapterId,
      questionOneId,
      optionOneId,
      questionTwoId,
      optionThreeId,
    } = seedQuizState(mock);

    await expect(
      service.submitChapterQuiz(currentUser, chapterId, {
        answers: [
          { questionId: questionOneId, selectedOptionId: optionOneId },
          { questionId: questionTwoId, selectedOptionId: optionThreeId },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicated questions and invalid options before creating attempts', async () => {
    const mock = createMockPrisma();
    const service = new QuizService(mock.prisma as never);
    const { courseId, chapterId, questionOneId, optionOneId, questionTwoId } =
      seedQuizState(mock);
    const invalidOptionId = '66666666-6666-4666-8666-666666666666';

    mock.chapterLearningRecords.set(`${currentUser.id}:${chapterId}`, {
      id: 'record-1',
      userId: currentUser.id,
      courseId,
      chapterId,
      status: LearningStatus.LEARNING,
      completedAt: null,
      lastLearnedAt: new Date(),
      quizCompleted: false,
    });

    await expect(
      service.submitChapterQuiz(currentUser, chapterId, {
        answers: [
          { questionId: questionOneId, selectedOptionId: optionOneId },
          { questionId: questionOneId, selectedOptionId: optionOneId },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.submitChapterQuiz(currentUser, chapterId, {
        answers: [
          { questionId: questionOneId, selectedOptionId: optionOneId },
          { questionId: questionTwoId, selectedOptionId: invalidOptionId },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(mock.attempts.size).toBe(0);
  });

  it('grades all-correct answers, stores an attempt, and marks quizCompleted', async () => {
    const mock = createMockPrisma();
    const service = new QuizService(mock.prisma as never);
    const {
      courseId,
      chapterId,
      quizId,
      questionOneId,
      questionTwoId,
      optionOneId,
      optionThreeId,
    } = seedQuizState(mock);

    mock.chapterLearningRecords.set(`${currentUser.id}:${chapterId}`, {
      id: 'record-1',
      userId: currentUser.id,
      courseId,
      chapterId,
      status: LearningStatus.LEARNING,
      completedAt: null,
      lastLearnedAt: new Date(),
      quizCompleted: false,
    });
    mock.courseLearningRecords.set(`${currentUser.id}:${courseId}`, {
      id: 'course-record-1',
      userId: currentUser.id,
      courseId,
      lastChapterId: null,
      lastLearnedAt: null,
    });
    mock.courseLearningRecords.set(`${currentUser.id}:other-course`, {
      id: 'course-record-2',
      userId: currentUser.id,
      courseId: 'other-course',
      lastChapterId: 'other-chapter',
      lastLearnedAt: new Date('2026-07-20T08:00:00.000Z'),
    });

    const result = await service.submitChapterQuiz(currentUser, chapterId, {
      answers: [
        { questionId: questionOneId, selectedOptionId: optionOneId },
        { questionId: questionTwoId, selectedOptionId: optionThreeId },
      ],
    });

    expect(result.data.quizId).toBe(quizId);
    expect(result.data.score).toBe(40);
    expect(result.data.totalScore).toBe(40);
    expect(result.data.scorePercent).toBe(100);
    expect(result.data.passed).toBe(true);
    expect(result.data.results[0]).toHaveProperty('correctOptionId');
    expect(result.data.results[0]).toHaveProperty('explanation');
    expect(mock.attempts.size).toBe(1);
    expect(mock.answers.size).toBe(2);
    expect(
      mock.chapterLearningRecords.get(`${currentUser.id}:${chapterId}`)
        ?.quizCompleted,
    ).toBe(true);
    expect(
      mock.courseLearningRecords.get(`${currentUser.id}:${courseId}`)
        ?.lastChapterId,
    ).toBe(chapterId);
    expect(
      mock.courseLearningRecords.get(`${currentUser.id}:other-course`)
        ?.lastChapterId,
    ).toBe('other-chapter');
  });

  it('rejects reading a quiz when quiz data is incomplete', async () => {
    const mock = createMockPrisma();
    const service = new QuizService(mock.prisma as never);
    const { chapterId, optionTwoId } = seedQuizState(mock);

    mock.options.delete(optionTwoId);

    await expect(
      service.getChapterQuiz(currentUser, chapterId),
    ).rejects.toEqual(
      expect.objectContaining({
        message: 'QUIZ_NOT_READY',
      }),
    );
  });

  it('rejects submitting a quiz when quiz data is incomplete and does not create attempts', async () => {
    const mock = createMockPrisma();
    const service = new QuizService(mock.prisma as never);
    const {
      courseId,
      chapterId,
      questionOneId,
      questionTwoId,
      optionOneId,
      optionThreeId,
    } = seedQuizState(mock);

    mock.questions.set(questionOneId, {
      ...mock.questions.get(questionOneId)!,
      score: 0,
    });
    mock.chapterLearningRecords.set(`${currentUser.id}:${chapterId}`, {
      id: 'record-1',
      userId: currentUser.id,
      courseId,
      chapterId,
      status: LearningStatus.LEARNING,
      completedAt: null,
      lastLearnedAt: new Date(),
      quizCompleted: false,
    });

    await expect(
      service.submitChapterQuiz(currentUser, chapterId, {
        answers: [
          { questionId: questionOneId, selectedOptionId: optionOneId },
          { questionId: questionTwoId, selectedOptionId: optionThreeId },
        ],
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: 'QUIZ_NOT_READY',
      }),
    );

    expect(mock.attempts.size).toBe(0);
    expect(mock.answers.size).toBe(0);
  });

  it('uses rounded scorePercent for display while pass/fail uses the raw ratio', async () => {
    const mock = createMockPrisma();
    const service = new QuizService(mock.prisma as never);
    const { courseId, chapterId, quizId } = seedQuizState(mock);
    const questionThreeId = '44444444-4444-4444-8444-444444444443';
    const optionFiveId = '55555555-5555-4555-8555-555555555555';
    const optionSixId = '55555555-5555-4555-8555-555555555556';

    mock.quizzes.set(quizId, {
      ...mock.quizzes.get(quizId)!,
      passScorePercent: 60,
    });
    mock.questions.set('44444444-4444-4444-8444-444444444441', {
      ...mock.questions.get('44444444-4444-4444-8444-444444444441')!,
      score: 100,
    });
    mock.questions.set('44444444-4444-4444-8444-444444444442', {
      ...mock.questions.get('44444444-4444-4444-8444-444444444442')!,
      score: 49,
    });
    mock.questions.set(questionThreeId, {
      id: questionThreeId,
      quizId,
      type: QuestionType.SINGLE_CHOICE,
      content: 'Choose the correct keyword for boolean true in Python.',
      explanation: 'True is the correct boolean literal.',
      score: 101,
      sortOrder: 3,
    });
    mock.options.set(optionFiveId, {
      id: optionFiveId,
      questionId: questionThreeId,
      content: 'True',
      isCorrect: true,
      sortOrder: 1,
    });
    mock.options.set(optionSixId, {
      id: optionSixId,
      questionId: questionThreeId,
      content: 'YES',
      isCorrect: false,
      sortOrder: 2,
    });
    mock.chapterLearningRecords.set(`${currentUser.id}:${chapterId}`, {
      id: 'record-1',
      userId: currentUser.id,
      courseId,
      chapterId,
      status: LearningStatus.LEARNING,
      completedAt: null,
      lastLearnedAt: new Date(),
      quizCompleted: false,
    });

    const result = await service.submitChapterQuiz(currentUser, chapterId, {
      answers: [
        {
          questionId: '44444444-4444-4444-8444-444444444441',
          selectedOptionId: '55555555-5555-4555-8555-555555555551',
        },
        {
          questionId: '44444444-4444-4444-8444-444444444442',
          selectedOptionId: '55555555-5555-4555-8555-555555555553',
        },
        { questionId: questionThreeId, selectedOptionId: optionSixId },
      ],
    });

    expect(result.data.score).toBe(149);
    expect(result.data.totalScore).toBe(250);
    expect(result.data.scorePercent).toBe(60);
    expect(result.data.passed).toBe(false);
  });

  it('returns attempt history in descending order and hides other users attempts', async () => {
    const mock = createMockPrisma();
    const service = new QuizService(mock.prisma as never);
    const { chapterId, quizId, questionOneId } = seedQuizState(mock);

    mock.attempts.set('attempt-1', {
      id: 'attempt-1',
      userId: currentUser.id,
      quizId,
      score: 20,
      totalScore: 40,
      passed: false,
      submittedAt: new Date('2026-07-20T09:00:00.000Z'),
      createdAt: new Date('2026-07-20T09:00:00.000Z'),
    });
    mock.attempts.set('attempt-2', {
      id: 'attempt-2',
      userId: currentUser.id,
      quizId,
      score: 40,
      totalScore: 40,
      passed: true,
      submittedAt: new Date('2026-07-20T10:00:00.000Z'),
      createdAt: new Date('2026-07-20T10:00:00.000Z'),
    });
    mock.attempts.set('attempt-3', {
      id: 'attempt-3',
      userId: 'other-user',
      quizId,
      score: 40,
      totalScore: 40,
      passed: true,
      submittedAt: new Date('2026-07-20T11:00:00.000Z'),
      createdAt: new Date('2026-07-20T11:00:00.000Z'),
    });
    mock.answers.set('answer-1', {
      id: 'answer-1',
      attemptId: 'attempt-2',
      questionId: questionOneId,
      selectedOptionId: '55555555-5555-4555-8555-555555555551',
      isCorrect: true,
      scoreAwarded: 20,
      createdAt: new Date('2026-07-20T10:00:00.000Z'),
    });

    const listResult = await service.listChapterQuizAttempts(
      currentUser,
      chapterId,
      1,
      10,
    );
    expect(listResult.data.items[0]?.attemptId).toBe('attempt-2');
    expect(listResult.data.items[1]?.attemptId).toBe('attempt-1');

    await expect(
      service.getQuizAttemptDetail(currentUser, 'attempt-3'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
