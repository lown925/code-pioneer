/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  PracticeAttemptStatus,
  QuestionType,
} from '../../generated/prisma/enums';
import { PracticeService } from './practice.service';

const CURRENT_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const COURSE_ID = '22222222-2222-4222-8222-222222222222';
const ATTEMPT_ID = '33333333-3333-4333-8333-333333333333';
const QUESTION_ID = '44444444-4444-4444-8444-444444444444';
const CORRECT_OPTION_ID = '55555555-5555-4555-8555-555555555555';
const WRONG_OPTION_ID = '66666666-6666-4666-8666-666666666666';

function createMockPrisma() {
  return {
    course: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    quizQuestion: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    practiceAttempt: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    practiceAnswer: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  };
}

function createAttemptRecord(
  status: PracticeAttemptStatus = PracticeAttemptStatus.IN_PROGRESS,
) {
  return {
    id: ATTEMPT_ID,
    courseId: COURSE_ID,
    requestedQuestionCount: 2,
    status,
  };
}

function createQuestionRecord() {
  return {
    id: QUESTION_ID,
    type: QuestionType.SINGLE_CHOICE,
    explanation: 'let 声明的变量具有块级作用域。',
    explanationBlocks: null,
    acceptedAnswers: null,
    answerNormalization: null,
    options: [
      { id: CORRECT_OPTION_ID, isCorrect: true },
      { id: WRONG_OPTION_ID, isCorrect: false },
    ],
  };
}

function createFillBlankQuestionRecord() {
  return {
    id: QUESTION_ID,
    type: QuestionType.FILL_BLANK,
    explanation: 'JavaScript 常简称为 JS。',
    explanationBlocks: null,
    acceptedAnswers: ['JavaScript', 'JS'],
    answerNormalization: null,
    options: [],
  };
}

describe('PracticeService', () => {
  it('counts only supported questions from published chapter quizzes', async () => {
    const prisma = createMockPrisma();
    prisma.course.findMany.mockResolvedValueOnce([
      {
        id: COURSE_ID,
        title: 'JavaScript 入门',
        category: 'FRONTEND',
        language: 'JavaScript',
        chapters: [
          {
            quiz: {
              status: 'PUBLISHED',
              questions: [{ id: 'q-1' }, { id: 'q-2' }],
            },
          },
          {
            quiz: {
              status: 'DRAFT',
              questions: [{ id: 'q-3' }],
            },
          },
          { quiz: null },
        ],
      },
    ]);
    const service = new PracticeService(prisma as never);

    await expect(service.getTargets(CURRENT_USER)).resolves.toEqual({
      success: true,
      data: {
        items: [
          {
            courseId: COURSE_ID,
            courseTitle: 'JavaScript 入门',
            category: 'FRONTEND',
            language: 'JavaScript',
            availableQuestionCount: 2,
          },
        ],
      },
    });
  });

  it('rejects an attempt when the selected course has too few questions', async () => {
    const prisma = createMockPrisma();
    prisma.course.findFirst.mockResolvedValueOnce({
      id: COURSE_ID,
      title: 'JavaScript 入门',
      category: 'FRONTEND',
      language: 'JavaScript',
    });
    prisma.quizQuestion.findMany.mockResolvedValueOnce([]);
    const service = new PracticeService(prisma as never);

    await expect(
      service.createAttempt(CURRENT_USER, {
        courseId: COURSE_ID,
        questionCount: 5,
      }),
    ).rejects.toEqual(
      expect.objectContaining({ message: 'PRACTICE_NOT_ENOUGH_QUESTIONS' }),
    );
    expect(prisma.practiceAttempt.create).not.toHaveBeenCalled();
  });

  it('creates an attempt without exposing correctness in the question payload', async () => {
    const prisma = createMockPrisma();
    const createdAt = new Date('2026-07-31T06:00:00.000Z');
    prisma.course.findFirst.mockResolvedValueOnce({
      id: COURSE_ID,
      title: 'JavaScript 入门',
      category: 'FRONTEND',
      language: 'JavaScript',
    });
    prisma.quizQuestion.findMany.mockResolvedValueOnce([
      {
        id: QUESTION_ID,
        type: QuestionType.SINGLE_CHOICE,
        content: '哪个关键字声明块级作用域变量？',
        stemBlocks: null,
        programmingLanguage: 'JavaScript',
        options: [
          {
            id: CORRECT_OPTION_ID,
            content: 'let',
            contentBlocks: null,
            sortOrder: 1,
            isCorrect: true,
          },
        ],
      },
    ]);
    prisma.practiceAttempt.create.mockResolvedValueOnce({
      id: ATTEMPT_ID,
      createdAt,
    });
    const service = new PracticeService(prisma as never);

    const result = await service.createAttempt(CURRENT_USER, {
      courseId: COURSE_ID,
      questionCount: 1,
    });

    expect(result.data.attemptId).toBe(ATTEMPT_ID);
    expect(result.data.questions).toHaveLength(1);
    expect(result.data.questions[0]).not.toHaveProperty('correctOptionId');
    expect(result.data.questions[0]?.options[0]).not.toHaveProperty(
      'isCorrect',
    );
    expect(prisma.practiceAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: CURRENT_USER.id }),
      }),
    );
  });

  it('persists a first wrong answer and returns the server explanation', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(createAttemptRecord());
    prisma.practiceAnswer.findUnique.mockResolvedValueOnce(null);
    prisma.quizQuestion.findFirst.mockResolvedValueOnce(createQuestionRecord());
    prisma.practiceAnswer.create.mockResolvedValueOnce({ id: 'answer-1' });
    prisma.practiceAnswer.count.mockResolvedValueOnce(1);
    const service = new PracticeService(prisma as never);

    const result = await service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
      questionId: QUESTION_ID,
      selectedOptionId: WRONG_OPTION_ID,
    });

    expect(result.data).toEqual(
      expect.objectContaining({
        questionId: QUESTION_ID,
        selectedOptionId: WRONG_OPTION_ID,
        correctOptionId: CORRECT_OPTION_ID,
        isCorrect: false,
        explanation: 'let 声明的变量具有块级作用域。',
        answeredCount: 1,
        completed: false,
      }),
    );
    expect(prisma.practiceAnswer.create).toHaveBeenCalledWith({
      data: {
        attemptId: ATTEMPT_ID,
        userId: CURRENT_USER.id,
        questionId: QUESTION_ID,
        selectedOptionId: WRONG_OPTION_ID,
        isCorrect: false,
      },
    });
  });

  it('marks the attempt complete after the requested answer count', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(createAttemptRecord());
    prisma.practiceAnswer.findUnique.mockResolvedValueOnce(null);
    prisma.quizQuestion.findFirst.mockResolvedValueOnce(createQuestionRecord());
    prisma.practiceAnswer.create.mockResolvedValueOnce({ id: 'answer-2' });
    prisma.practiceAnswer.count.mockResolvedValueOnce(2);
    prisma.practiceAttempt.update.mockResolvedValueOnce({ id: ATTEMPT_ID });
    const service = new PracticeService(prisma as never);

    const result = await service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
      questionId: QUESTION_ID,
      selectedOptionId: CORRECT_OPTION_ID,
    });

    expect(result.data.isCorrect).toBe(true);
    expect(result.data.completed).toBe(true);
    expect(prisma.practiceAttempt.update).toHaveBeenCalledWith({
      where: { id: ATTEMPT_ID },
      data: {
        status: PracticeAttemptStatus.COMPLETED,
        completedAt: expect.any(Date),
      },
    });
  });

  it('judges and persists a fill-blank answer on the server', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(createAttemptRecord());
    prisma.practiceAnswer.findUnique.mockResolvedValueOnce(null);
    prisma.quizQuestion.findFirst.mockResolvedValueOnce(
      createFillBlankQuestionRecord(),
    );
    prisma.practiceAnswer.create.mockResolvedValueOnce({ id: 'answer-text' });
    prisma.practiceAnswer.count.mockResolvedValueOnce(1);
    const service = new PracticeService(prisma as never);

    const result = await service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
      questionId: QUESTION_ID,
      answerText: ' js ',
    });

    expect(result.data).toEqual(
      expect.objectContaining({
        selectedOptionId: null,
        answerText: ' js ',
        acceptedAnswers: ['JavaScript', 'JS'],
        isCorrect: true,
      }),
    );
    expect(prisma.practiceAnswer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        attemptId: ATTEMPT_ID,
        questionId: QUESTION_ID,
        answerText: ' js ',
        normalizedAnswer: 'js',
        isCorrect: true,
      }),
    });
  });

  it('replays an existing text answer without creating another row', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(createAttemptRecord());
    prisma.practiceAnswer.findUnique.mockResolvedValueOnce({
      selectedOptionId: null,
      answerText: 'JavaScript',
    });
    prisma.quizQuestion.findFirst.mockResolvedValueOnce(
      createFillBlankQuestionRecord(),
    );
    prisma.practiceAnswer.count.mockResolvedValueOnce(1);
    const service = new PracticeService(prisma as never);

    const result = await service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
      questionId: QUESTION_ID,
      answerText: 'different retry body',
    });

    expect(result.data.answerText).toBe('JavaScript');
    expect(result.data.isCorrect).toBe(true);
    expect(prisma.practiceAnswer.create).not.toHaveBeenCalled();
  });

  it('replays an existing answer without creating a duplicate row', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(createAttemptRecord());
    prisma.practiceAnswer.findUnique.mockResolvedValueOnce({
      selectedOptionId: WRONG_OPTION_ID,
    });
    prisma.quizQuestion.findFirst.mockResolvedValueOnce(createQuestionRecord());
    prisma.practiceAnswer.count.mockResolvedValueOnce(1);
    const service = new PracticeService(prisma as never);

    const result = await service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
      questionId: QUESTION_ID,
      selectedOptionId: WRONG_OPTION_ID,
    });

    expect(result.data.selectedOptionId).toBe(WRONG_OPTION_ID);
    expect(prisma.practiceAnswer.create).not.toHaveBeenCalled();
  });

  it('returns the concurrent persisted answer after a unique-key race', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(createAttemptRecord());
    prisma.practiceAnswer.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ selectedOptionId: CORRECT_OPTION_ID });
    prisma.quizQuestion.findFirst
      .mockResolvedValueOnce(createQuestionRecord())
      .mockResolvedValueOnce(createQuestionRecord());
    prisma.practiceAnswer.create.mockRejectedValueOnce({ code: 'P2002' });
    prisma.practiceAnswer.count.mockResolvedValueOnce(1);
    const service = new PracticeService(prisma as never);

    const result = await service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
      questionId: QUESTION_ID,
      selectedOptionId: CORRECT_OPTION_ID,
    });

    expect(result.data.selectedOptionId).toBe(CORRECT_OPTION_ID);
    expect(result.data.isCorrect).toBe(true);
  });

  it('rejects access to an attempt owned by another user', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(null);
    const service = new PracticeService(prisma as never);

    await expect(
      service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
        questionId: QUESTION_ID,
        selectedOptionId: CORRECT_OPTION_ID,
      }),
    ).rejects.toEqual(expect.any(NotFoundException));
    expect(prisma.practiceAnswer.findUnique).not.toHaveBeenCalled();
  });

  it('rejects new answers after an attempt has completed', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(
      createAttemptRecord(PracticeAttemptStatus.COMPLETED),
    );
    prisma.practiceAnswer.findUnique.mockResolvedValueOnce(null);
    const service = new PracticeService(prisma as never);

    await expect(
      service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
        questionId: QUESTION_ID,
        selectedOptionId: CORRECT_OPTION_ID,
      }),
    ).rejects.toEqual(expect.any(BadRequestException));
    expect(prisma.quizQuestion.findFirst).not.toHaveBeenCalled();
  });

  it('maps an unavailable question to a stable business error', async () => {
    const prisma = createMockPrisma();
    prisma.practiceAttempt.findFirst.mockResolvedValueOnce(createAttemptRecord());
    prisma.practiceAnswer.findUnique.mockResolvedValueOnce(null);
    prisma.quizQuestion.findFirst.mockResolvedValueOnce(null);
    const service = new PracticeService(prisma as never);

    await expect(
      service.submitAnswer(CURRENT_USER, ATTEMPT_ID, {
        questionId: QUESTION_ID,
        selectedOptionId: CORRECT_OPTION_ID,
      }),
    ).rejects.toEqual(
      expect.objectContaining({ message: 'PRACTICE_QUESTION_NOT_FOUND' }),
    );
  });
});
