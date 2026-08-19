/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { NotFoundException } from '@nestjs/common';
import {
  BattleMode,
  BattleResult,
  QuestionType,
} from '../../generated/prisma/enums';
import { WrongQuestionService } from './wrong-question.service';

const CURRENT_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

function createMockPrisma() {
  return {
    $queryRaw: jest.fn().mockResolvedValue([]),
    course: {
      findFirst: jest.fn(),
    },
    courseChapter: {
      findFirst: jest.fn(),
    },
    quizQuestion: {
      findMany: jest.fn(),
    },
  };
}

describe('WrongQuestionService', () => {
  it('returns a stable empty list response', async () => {
    const prisma = createMockPrisma();
    prisma.$queryRaw.mockResolvedValueOnce([]);
    const service = new WrongQuestionService(prisma as never);

    await expect(service.getList(CURRENT_USER, {})).resolves.toEqual({
      success: true,
      data: {
        items: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      },
    });
    expect(prisma.quizQuestion.findMany).not.toHaveBeenCalled();
  });

  it('returns stable zero statistics when the user has no wrong answers', async () => {
    const prisma = createMockPrisma();
    prisma.$queryRaw.mockResolvedValueOnce([]);
    const service = new WrongQuestionService(prisma as never);

    await expect(service.getStatistics(CURRENT_USER)).resolves.toEqual({
      success: true,
      data: {
        totalWrongQuestions: 0,
        totalWrongAnswers: 0,
        courseCount: 0,
        latestWrongAt: null,
      },
    });
  });

  it('aggregates multiple wrong answers for one question into one list item', async () => {
    const prisma = createMockPrisma();
    const lastWrongAt = new Date('2026-07-21T09:00:00.000Z');
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        questionId: 'q-1',
        wrongCount: 2,
        lastWrongAt,
      },
    ]);
    prisma.quizQuestion.findMany.mockResolvedValueOnce([
      {
        id: 'q-1',
        type: QuestionType.SINGLE_CHOICE,
        content: 'Which function prints text in Python?',
        explanation: 'print() writes text to standard output.',
        options: [
          {
            id: 'opt-1',
            content: 'print()',
            isCorrect: true,
            sortOrder: 1,
          },
          {
            id: 'opt-2',
            content: 'echo()',
            isCorrect: false,
            sortOrder: 2,
          },
        ],
        quiz: {
          chapterId: 'chapter-1',
          chapter: {
            title: 'Output Basics',
            courseId: 'course-1',
            course: {
              title: 'Python Basics',
            },
          },
        },
      },
    ]);
    const service = new WrongQuestionService(prisma as never);

    const result = await service.getList(CURRENT_USER, {});

    expect(result).toEqual({
      success: true,
      data: {
        items: [
          expect.objectContaining({
            source: 'LEARNING',
            questionId: 'q-1',
            battleQuestionSnapshotId: null,
            questionType: QuestionType.SINGLE_CHOICE,
            questionContent: 'Which function prints text in Python?',
            courseId: 'course-1',
            courseTitle: 'Python Basics',
            chapterId: 'chapter-1',
            chapterTitle: 'Output Basics',
            wrongCount: 2,
            lastWrongAt,
            latestWrongAt: lastWrongAt,
            presentation: null,
            difficulty: null,
            programmingLanguage: null,
            battle: null,
          }),
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        },
      },
    });
    expect(result.data.items[0]).not.toHaveProperty('correctOptionId');
    expect(result.data.items[0]).not.toHaveProperty('explanation');
    expect(result.data.items[0]).not.toHaveProperty('selectedOptionId');
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    expect(prisma.quizQuestion.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns practice wrong questions from the practice answer source', async () => {
    const prisma = createMockPrisma();
    const lastWrongAt = new Date('2026-07-21T11:00:00.000Z');
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        questionId: 'q-practice-1',
        wrongCount: 3,
        lastWrongAt,
      },
    ]);
    prisma.quizQuestion.findMany.mockResolvedValueOnce([
      {
        id: 'q-practice-1',
        type: QuestionType.SINGLE_CHOICE,
        content: 'Which keyword declares a block-scoped variable?',
        explanation: 'let declares a block-scoped variable.',
        options: [
          { id: 'opt-let', content: 'let', isCorrect: true, sortOrder: 1 },
          { id: 'opt-var', content: 'var', isCorrect: false, sortOrder: 2 },
        ],
        quiz: {
          chapterId: 'chapter-js-1',
          chapter: {
            title: 'Variables',
            courseId: 'course-js',
            course: { title: 'JavaScript Starter' },
          },
        },
      },
    ]);
    const service = new WrongQuestionService(prisma as never);

    const result = await service.getList(CURRENT_USER, { source: 'PRACTICE' });

    expect(result.data.items).toEqual([
      expect.objectContaining({
        source: 'PRACTICE',
        questionId: 'q-practice-1',
        wrongCount: 3,
        latestWrongAt: lastWrongAt,
      }),
    ]);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.$queryRaw.mock.calls[0][0].text).toContain(
      'FROM practice_answers answer',
    );
  });

  it.each([
    { mode: BattleMode.TRAINING, result: BattleResult.NONE },
    { mode: BattleMode.AI, result: BattleResult.LOSS },
  ])(
    'includes wrong answers from completed $mode rooms',
    async ({ mode, result: battleResult }) => {
      const submittedAt = new Date('2026-08-16T10:00:00.000Z');
      const prisma = {
        ...createMockPrisma(),
        battleRoom: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 'training-room',
              mode,
              status: 'COMPLETED',
              completedAt: new Date('2026-08-16T10:03:00.000Z'),
              endReason: 'NORMAL',
              participants: [
                {
                  id: 'training-participant',
                  userId: CURRENT_USER.id,
                  score: 1,
                  result: battleResult,
                  correctCount: 1,
                  wrongCount: 1,
                  unansweredCount: 0,
                  ratingBefore: 1000,
                  ratingDelta: 0,
                  ratingAfter: 1000,
                  user: {
                    id: CURRENT_USER.id,
                    nickname: null,
                    avatarUrl: null,
                  },
                },
              ],
              questionSnapshots: [
                {
                  id: 'snapshot-training-1',
                  battleRoomId: 'training-room',
                  sourceQuizQuestionId: 'question-training-1',
                  orderIndex: 0,
                  questionType: 'CODE_FILL',
                  presentation: 'INPUT_CODE_FILL',
                  difficulty: 'MEDIUM',
                  stemSnapshot: [{ type: 'TEXT', text: '训练错题' }],
                  optionsSnapshot: [],
                  correctAnswerSnapshot: {
                    type: 'CODE_FILL',
                  },
                  explanationSnapshot: null,
                  acceptedAnswersSnapshot: ['print(value)'],
                  knowledgeTagsSnapshot: ['topic:output', 'functions'],
                  programmingLanguage: 'python',
                  courseIdSnapshot: 'course-1',
                  chapterIdSnapshot: 'chapter-1',
                  sourceQuizQuestion: {
                    quiz: {
                      chapter: {
                        title: 'Output Basics',
                        course: { title: 'Python Basics' },
                      },
                    },
                  },
                },
              ],
              answers: [
                {
                  battleRoomId: 'training-room',
                  participantId: 'training-participant',
                  battleQuestionSnapshotId: 'snapshot-training-1',
                  answerPayload: {
                    type: 'CODE_FILL',
                    value: 'echo(value)',
                  },
                  submittedAt,
                  timeSpentMs: 1000,
                  isCorrect: false,
                  scoreDelta: -1,
                },
              ],
            },
          ]),
        },
      };
      const service = new WrongQuestionService(prisma as never);

      const result = await service.getList(CURRENT_USER, { source: 'BATTLE' });

      expect(result.data.items).toEqual([
        expect.objectContaining({
          source: 'BATTLE',
          questionId: 'question-training-1',
          battleQuestionSnapshotId: 'snapshot-training-1',
          wrongCount: 1,
          latestWrongAt: submittedAt,
          battle: expect.objectContaining({
            battleId: 'training-room',
            opponent: null,
          }),
        }),
      ]);

      const detail = await service.getDetail(
        CURRENT_USER,
        'question-training-1',
        'BATTLE',
      );
      expect(detail.data).toEqual(
        expect.objectContaining({
          correctAnswer: {
            type: 'CODE_FILL',
            acceptedAnswers: ['print(value)'],
          },
          knowledgeTags: ['topic:output', 'functions'],
          courseTitle: 'Python Basics',
          chapterTitle: 'Output Basics',
        }),
      );
    },
  );

  it('returns the correct answer and explanation for a practice wrong question', async () => {
    const prisma = createMockPrisma();
    const lastWrongAt = new Date('2026-07-21T11:30:00.000Z');
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        questionId: 'q-practice-1',
        wrongCount: 1,
        lastWrongAt,
      },
    ]);
    prisma.quizQuestion.findMany.mockResolvedValueOnce([
      {
        id: 'q-practice-1',
        type: QuestionType.TRUE_FALSE,
        content: 'const bindings can always be reassigned.',
        explanation: 'A const binding cannot be reassigned.',
        options: [
          { id: 'opt-false', content: 'FALSE', isCorrect: true, sortOrder: 1 },
          { id: 'opt-true', content: 'TRUE', isCorrect: false, sortOrder: 2 },
        ],
        quiz: {
          chapterId: 'chapter-js-1',
          chapter: {
            title: 'Variables',
            courseId: 'course-js',
            course: { title: 'JavaScript Starter' },
          },
        },
      },
    ]);
    const service = new WrongQuestionService(prisma as never);

    const result = await service.getDetail(
      CURRENT_USER,
      'q-practice-1',
      'PRACTICE',
    );

    expect(result.data).toEqual(
      expect.objectContaining({
        source: 'PRACTICE',
        correctOptionId: 'opt-false',
        correctAnswer: {
          type: QuestionType.TRUE_FALSE,
          optionId: 'opt-false',
        },
        explanation: 'A const binding cannot be reassigned.',
        knowledgeTags: [],
      }),
    );
  });

  it('does not query practice answers when the learning source is explicit', async () => {
    const prisma = createMockPrisma();
    const service = new WrongQuestionService(prisma as never);

    await service.getList(CURRENT_USER, { source: 'LEARNING' });

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.$queryRaw.mock.calls[0][0].text).toContain(
      'FROM quiz_answers qa',
    );
    expect(prisma.$queryRaw.mock.calls[0][0].text).not.toContain(
      'practice_answers',
    );
  });

  it('uses a stable secondary sort in the aggregate query', async () => {
    const prisma = createMockPrisma();
    prisma.$queryRaw.mockResolvedValueOnce([]);
    const service = new WrongQuestionService(prisma as never);

    await service.getList(CURRENT_USER, {
      page: 2,
      pageSize: 5,
    });

    const aggregateQuery = prisma.$queryRaw.mock.calls[0][0];
    expect(aggregateQuery.text).toContain(
      'ORDER BY MAX(attempt.submitted_at) DESC, qa.question_id ASC',
    );
  });

  it('rejects mismatched course and chapter filters', async () => {
    const prisma = createMockPrisma();
    prisma.course.findFirst.mockResolvedValueOnce({ id: 'course-1' });
    prisma.courseChapter.findFirst.mockResolvedValueOnce({
      id: 'chapter-1',
      courseId: 'course-2',
    });
    const service = new WrongQuestionService(prisma as never);

    await expect(
      service.getList(CURRENT_USER, {
        courseId: 'course-1',
        chapterId: 'chapter-1',
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: 'WRONG_QUESTION_FILTER_MISMATCH',
      }),
    );
  });

  it('returns course and chapter not found errors for invalid filters', async () => {
    const prisma = createMockPrisma();
    prisma.course.findFirst.mockResolvedValueOnce(null);
    const service = new WrongQuestionService(prisma as never);

    await expect(
      service.getList(CURRENT_USER, {
        courseId: 'course-404',
      }),
    ).rejects.toEqual(expect.any(NotFoundException));
    await expect(
      service.getList(CURRENT_USER, {
        chapterId: 'chapter-404',
      }),
    ).rejects.toEqual(expect.any(NotFoundException));
  });

  it('returns detail with correct answer, explanation, and ordered options', async () => {
    const prisma = createMockPrisma();
    const lastWrongAt = new Date('2026-07-21T10:00:00.000Z');
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        questionId: 'q-1',
        wrongCount: 2,
        lastWrongAt,
      },
    ]);
    prisma.quizQuestion.findMany.mockResolvedValueOnce([
      {
        id: 'q-1',
        type: QuestionType.TRUE_FALSE,
        content: 'Python is case-sensitive.',
        explanation: 'Python treats Name and name as different identifiers.',
        options: [
          {
            id: 'opt-1',
            content: 'TRUE',
            isCorrect: true,
            sortOrder: 1,
          },
          {
            id: 'opt-2',
            content: 'FALSE',
            isCorrect: false,
            sortOrder: 2,
          },
        ],
        quiz: {
          chapterId: 'chapter-1',
          chapter: {
            title: 'Variables',
            courseId: 'course-1',
            course: {
              title: 'Python Basics',
            },
          },
        },
      },
    ]);
    const service = new WrongQuestionService(prisma as never);

    const result = await service.getDetail(CURRENT_USER, 'q-1');

    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        source: 'LEARNING',
        questionId: 'q-1',
        battleQuestionSnapshotId: null,
        questionType: QuestionType.TRUE_FALSE,
        content: 'Python is case-sensitive.',
        questionContent: 'Python is case-sensitive.',
        courseId: 'course-1',
        courseTitle: 'Python Basics',
        chapterId: 'chapter-1',
        chapterTitle: 'Variables',
        options: [
          {
            optionId: 'opt-1',
            content: 'TRUE',
            order: 1,
          },
          {
            optionId: 'opt-2',
            content: 'FALSE',
            order: 2,
          },
        ],
        correctOptionId: 'opt-1',
        explanation: 'Python treats Name and name as different identifiers.',
        wrongCount: 2,
        lastWrongAt,
        latestWrongAt: lastWrongAt,
        knowledgeTags: [],
        battle: null,
      }),
    });
  });

  it('returns not found when the current user never answered the question wrong', async () => {
    const prisma = createMockPrisma();
    prisma.$queryRaw.mockResolvedValueOnce([]);
    const service = new WrongQuestionService(prisma as never);

    await expect(service.getDetail(CURRENT_USER, 'q-1')).rejects.toEqual(
      expect.objectContaining({
        message: 'WRONG_QUESTION_NOT_FOUND',
      }),
    );
  });

  it('returns quiz not ready when the detail question has no unique correct option', async () => {
    const prisma = createMockPrisma();
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        questionId: 'q-1',
        wrongCount: 1,
        lastWrongAt: new Date('2026-07-21T10:00:00.000Z'),
      },
    ]);
    prisma.quizQuestion.findMany.mockResolvedValueOnce([
      {
        id: 'q-1',
        type: QuestionType.SINGLE_CHOICE,
        content: 'Broken question',
        explanation: null,
        options: [
          {
            id: 'opt-1',
            content: 'A',
            isCorrect: true,
            sortOrder: 1,
          },
          {
            id: 'opt-2',
            content: 'B',
            isCorrect: true,
            sortOrder: 2,
          },
        ],
        quiz: {
          chapterId: 'chapter-1',
          chapter: {
            title: 'Variables',
            courseId: 'course-1',
            course: {
              title: 'Python Basics',
            },
          },
        },
      },
    ]);
    const service = new WrongQuestionService(prisma as never);

    await expect(service.getDetail(CURRENT_USER, 'q-1')).rejects.toEqual(
      expect.objectContaining({
        message: 'QUIZ_NOT_READY',
      }),
    );
  });

  it('returns quiz not ready when aggregated list rows cannot be resolved to questions', async () => {
    const prisma = createMockPrisma();
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        questionId: 'q-missing',
        wrongCount: 1,
        lastWrongAt: new Date('2026-07-21T10:00:00.000Z'),
      },
    ]);
    prisma.quizQuestion.findMany.mockResolvedValueOnce([]);
    const service = new WrongQuestionService(prisma as never);

    await expect(service.getList(CURRENT_USER, {})).rejects.toEqual(
      expect.objectContaining({
        message: 'QUIZ_NOT_READY',
      }),
    );
  });

  it('does not perform any write operations while reading wrong questions', async () => {
    const prisma = createMockPrisma();
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        questionId: 'q-1',
        wrongCount: 1,
        lastWrongAt: new Date('2026-07-21T10:00:00.000Z'),
      },
    ]);
    prisma.quizQuestion.findMany.mockResolvedValueOnce([
      {
        id: 'q-1',
        type: QuestionType.SINGLE_CHOICE,
        content: 'Question',
        explanation: null,
        options: [
          {
            id: 'opt-1',
            content: 'A',
            isCorrect: true,
            sortOrder: 1,
          },
          {
            id: 'opt-2',
            content: 'B',
            isCorrect: false,
            sortOrder: 2,
          },
        ],
        quiz: {
          chapterId: 'chapter-1',
          chapter: {
            title: 'Chapter',
            courseId: 'course-1',
            course: {
              title: 'Course',
            },
          },
        },
      },
    ]);
    const service = new WrongQuestionService(prisma as never);

    await service.getList(CURRENT_USER, {});

    expect((prisma as any).quizQuestion.create).toBeUndefined();
    expect((prisma as any).quizQuestion.update).toBeUndefined();
    expect((prisma as any).quizQuestion.delete).toBeUndefined();
  });
});
