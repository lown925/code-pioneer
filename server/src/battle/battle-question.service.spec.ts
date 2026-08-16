import {
  BattleParticipantStatus,
  BattleQuestionDifficulty,
  BattleQuestionPresentation,
  BattleQuestionType,
  BattleRoomStatus,
  QuestionType,
  QuizStatus,
  ChapterStatus,
  CourseStatus,
} from '../../generated/prisma/enums';
import { ConflictException } from '@nestjs/common';
import { BattleQuestionService } from './battle-question.service';
import { BattleDomainService } from './battle-domain.service';
import { BattleRoomService } from './battle-room.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_A_ID = '11111111-1111-4111-8111-111111111111';

describe('BattleQuestionService', () => {
  function createService() {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const roomService = new BattleRoomService(
      mock.prisma as never,
      domainService,
    );
    const service = new BattleQuestionService(
      mock.prisma as never,
      roomService,
    );
    const now = Date.now();

    mock.users.set(USER_A_ID, {
      id: USER_A_ID,
      battleRating: 1000,
      nickname: 'Question User',
    });
    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: 'RANKED',
      status: BattleRoomStatus.COUNTDOWN,
      questionCount: 2,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A_ID,
      expiresAt: new Date(now + 183000),
      startedAt: new Date(now + 3000),
      settledAt: null,
      completedAt: null,
      cancelledAt: null,
      endReason: null,
      createdAt: new Date(now),
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A_ID,
      seat: 1,
      status: BattleParticipantStatus.READY,
      result: 'NONE',
      joinedAt: new Date(now),
    });
    mock.battleQuestionSnapshots.set('snapshot-1', {
      id: 'snapshot-1',
      battleRoomId: 'room-1',
      sourceQuizQuestionId: 'source-1',
      orderIndex: 0,
      questionType: BattleQuestionType.SINGLE_CHOICE,
      presentation: BattleQuestionPresentation.TEXT_CHOICE,
      difficulty: 'EASY',
      stemSnapshot: [{ type: 'TEXT', text: 'Stem 1' }],
      optionsSnapshot: [
        {
          id: 'snapshot-1-option-a',
          sourceOptionId: 'option-a',
          orderIndex: 0,
          blocks: [{ type: 'TEXT', text: 'Option A' }],
        },
      ],
      correctAnswerSnapshot: {
        type: 'SINGLE_CHOICE',
        optionId: 'snapshot-1-option-a',
      },
      explanationSnapshot: [{ type: 'TEXT', text: 'Hidden explanation' }],
      acceptedAnswersSnapshot: null,
      answerNormalizationSnapshot: null,
      knowledgeTagsSnapshot: ['tag'],
      programmingLanguage: null,
      courseIdSnapshot: 'course-1',
      chapterIdSnapshot: 'chapter-1',
      createdAt: new Date(now),
    });
    mock.battleQuestionSnapshots.set('snapshot-2', {
      id: 'snapshot-2',
      battleRoomId: 'room-1',
      sourceQuizQuestionId: 'source-2',
      orderIndex: 1,
      questionType: BattleQuestionType.CODE_FILL,
      presentation: BattleQuestionPresentation.INPUT_CODE_FILL,
      difficulty: 'MEDIUM',
      stemSnapshot: [{ type: 'TEXT', text: 'Stem 2' }],
      optionsSnapshot: [],
      correctAnswerSnapshot: { type: 'CODE_FILL' },
      explanationSnapshot: null,
      acceptedAnswersSnapshot: ['print(1)'],
      answerNormalizationSnapshot: {
        trim: true,
        normalizeLineEndings: true,
        caseSensitive: true,
        collapseWhitespace: false,
        acceptedAnswers: ['print(1)'],
      },
      knowledgeTagsSnapshot: ['tag'],
      programmingLanguage: 'python',
      courseIdSnapshot: 'course-1',
      chapterIdSnapshot: 'chapter-1',
      createdAt: new Date(now),
    });

    return { mock, service };
  }

  it('does not return question bodies before startedAt', async () => {
    const { service } = createService();

    const result = await service.getBattleQuestions(USER_A_ID, 'room-1');

    expect(result.data.status).toBe(BattleRoomStatus.COUNTDOWN);
    expect(result.data.questions).toBeUndefined();
  });

  it('advances COUNTDOWN to IN_PROGRESS and returns sanitized questions after startedAt', async () => {
    const { mock, service } = createService();
    mock.battleRooms.get('room-1')!.startedAt = new Date(Date.now() - 1000);
    mock.battleRooms.get('room-1')!.expiresAt = new Date(Date.now() + 60000);

    mock.battleAnswers.set('answer-1', {
      id: 'answer-1',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      clientRequestId: 'request-1',
      answerVersion: 1,
      answerPayload: {
        type: 'SINGLE_CHOICE',
        optionId: 'snapshot-1-option-a',
      },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt: new Date('2026-07-25T10:00:10.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:00:10.000Z'),
    });

    const result = await service.getBattleQuestions(USER_A_ID, 'room-1');

    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.IN_PROGRESS,
    );
    expect(mock.battleParticipants.get('participant-a')?.status).toBe(
      BattleParticipantStatus.PLAYING,
    );
    expect(result.data.questions).toHaveLength(2);
    expect(result.data.questions?.[0]).toEqual(
      expect.objectContaining({
        battleQuestionId: 'snapshot-1',
        answered: true,
        submittedAnswer: {
          type: 'SINGLE_CHOICE',
          optionId: 'snapshot-1-option-a',
        },
      }),
    );
    expect(result.data.questions?.[0]).not.toHaveProperty(
      'correctAnswerSnapshot',
    );
    expect(result.data.questions?.[0]).not.toHaveProperty(
      'explanationSnapshot',
    );
  });

  it('restores the prompt for an existing code-only snapshot at read time', async () => {
    const { mock, service } = createService();
    mock.battleRooms.get('room-1')!.startedAt = new Date(Date.now() - 1000);
    mock.battleRooms.get('room-1')!.expiresAt = new Date(Date.now() + 60000);
    mock.quizQuestions.set(
      'source-1',
      createCandidate('source-1', 'PYTHON', {
        content: '请补全代码，使程序输出欢迎语。',
      }),
    );
    mock.battleQuestionSnapshots.get('snapshot-1')!.stemSnapshot = [
      {
        type: 'CODE',
        language: 'python',
        code: '________\nprint("欢迎来到码站先锋")',
      },
    ];

    const result = await service.getBattleQuestions(USER_A_ID, 'room-1');

    expect(result.data.questions?.[0]?.stem).toEqual([
      { type: 'TEXT', text: '请补全代码，使程序输出欢迎语。' },
      {
        type: 'CODE',
        language: 'python',
        code: '________\nprint("欢迎来到码站先锋")',
      },
    ]);
  });

  it('creates snapshots only from the room skill and copies the skill snapshot', async () => {
    const { mock, service } = createService();
    mock.battleRooms.get('room-1')!.skillCode = 'PYTHON';
    mock.battleQuestionSnapshots.clear();
    mock.quizQuestions.set('python-1', createCandidate('python-1', 'PYTHON'));
    mock.quizQuestions.set('python-2', createCandidate('python-2', 'PYTHON'));
    mock.quizQuestions.set(
      'javascript-1',
      createCandidate('javascript-1', 'JAVASCRIPT'),
    );

    await service.createQuestionSnapshotsAndStartCountdown(mock.tx as never, {
      battleId: 'room-1',
      questionCount: 2,
      durationSeconds: 180,
      now: new Date(),
      skillCode: 'PYTHON',
    });

    const snapshots = [...mock.battleQuestionSnapshots.values()];
    expect(snapshots).toHaveLength(2);
    const createdSnapshots = snapshots.filter((item) =>
      item.sourceQuizQuestionId?.startsWith('python-'),
    );
    expect(createdSnapshots).toHaveLength(2);
    expect(
      createdSnapshots.every((item) => item.skillCodeSnapshot === 'PYTHON'),
    ).toBe(true);
    expect(
      snapshots.some((item) => item.sourceQuizQuestionId === 'javascript-1'),
    ).toBe(false);
  });

  it('never creates Battle snapshots from EASY questions', async () => {
    const { mock, service } = createService();
    mock.battleRooms.get('room-1')!.skillCode = 'PYTHON';
    mock.battleQuestionSnapshots.clear();
    mock.quizQuestions.set(
      'python-easy',
      createCandidate('python-easy', 'PYTHON', {
        battleDifficulty: BattleQuestionDifficulty.EASY,
      }),
    );
    mock.quizQuestions.set(
      'python-medium',
      createCandidate('python-medium', 'PYTHON', {
        battleDifficulty: BattleQuestionDifficulty.MEDIUM,
      }),
    );
    mock.quizQuestions.set(
      'python-hard',
      createCandidate('python-hard', 'PYTHON', {
        battleDifficulty: BattleQuestionDifficulty.HARD,
      }),
    );

    await service.createQuestionSnapshotsAndStartCountdown(mock.tx as never, {
      battleId: 'room-1',
      questionCount: 2,
      durationSeconds: 180,
      now: new Date(),
      skillCode: 'PYTHON',
    });

    const snapshots = [...mock.battleQuestionSnapshots.values()];
    expect(snapshots).toHaveLength(2);
    expect(
      snapshots.every(
        (snapshot) =>
          snapshot.difficulty === BattleQuestionDifficulty.MEDIUM ||
          snapshot.difficulty === BattleQuestionDifficulty.HARD,
      ),
    ).toBe(true);
    expect(
      snapshots.some(
        (snapshot) => snapshot.sourceQuizQuestionId === 'python-easy',
      ),
    ).toBe(false);
  });

  it('restores the prompt when legacy question blocks contain code only', async () => {
    const { mock, service } = createService();
    mock.battleRooms.get('room-1')!.skillCode = 'PYTHON';
    mock.battleQuestionSnapshots.clear();
    mock.quizQuestions.set(
      'python-1',
      createCandidate('python-1', 'PYTHON', {
        content: '下面程序会输出什么？',
        stemBlocks: [
          {
            type: 'CODE',
            language: 'python',
            code: 'text = "Python"\nprint(len(text))',
          },
        ],
      }),
    );
    mock.quizQuestions.set('python-2', createCandidate('python-2', 'PYTHON'));

    await service.createQuestionSnapshotsAndStartCountdown(mock.tx as never, {
      battleId: 'room-1',
      questionCount: 2,
      durationSeconds: 180,
      now: new Date(),
      skillCode: 'PYTHON',
    });

    const snapshot = [...mock.battleQuestionSnapshots.values()].find(
      (item) => item.sourceQuizQuestionId === 'python-1',
    );
    expect(snapshot?.stemSnapshot).toEqual([
      { type: 'TEXT', text: '下面程序会输出什么？' },
      {
        type: 'CODE',
        language: 'python',
        code: 'text = "Python"\nprint(len(text))',
      },
    ]);
  });

  it('fails when the selected skill pool is insufficient without falling back', async () => {
    const { mock, service } = createService();
    mock.quizQuestions.set('python-1', createCandidate('python-1', 'PYTHON'));
    mock.quizQuestions.set(
      'javascript-1',
      createCandidate('javascript-1', 'JAVASCRIPT'),
    );

    await expect(
      service.createQuestionSnapshotsAndStartCountdown(mock.tx as never, {
        battleId: 'room-1',
        questionCount: 2,
        durationSeconds: 180,
        now: new Date(),
        skillCode: 'PYTHON',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

function createCandidate(
  id: string,
  battleSkillCode: string,
  overrides: {
    content?: string;
    stemBlocks?: unknown;
    battleDifficulty?: BattleQuestionDifficulty;
  } = {},
) {
  return {
    id,
    type: QuestionType.SINGLE_CHOICE,
    content: overrides.content ?? id,
    explanation: 'Explanation',
    battlePresentation: BattleQuestionPresentation.TEXT_CHOICE,
    battleDifficulty:
      overrides.battleDifficulty ?? BattleQuestionDifficulty.MEDIUM,
    isBattleEnabled: true,
    stemBlocks: overrides.stemBlocks ?? [{ type: 'TEXT', text: id }],
    explanationBlocks: [{ type: 'TEXT', text: 'Explanation' }],
    acceptedAnswers: null,
    answerNormalization: null,
    caseSensitive: true,
    knowledgeTags: ['tag'],
    programmingLanguage: battleSkillCode === 'PYTHON' ? 'python' : 'javascript',
    battleSkillCode,
    createdAt: new Date(),
    options: [
      {
        id: `${id}-correct`,
        content: 'Correct',
        contentBlocks: null,
        isCorrect: true,
        sortOrder: 1,
      },
      {
        id: `${id}-wrong`,
        content: 'Wrong',
        contentBlocks: null,
        isCorrect: false,
        sortOrder: 2,
      },
    ],
    quiz: {
      status: QuizStatus.PUBLISHED,
      chapterId: 'chapter-1',
      chapter: {
        status: ChapterStatus.PUBLISHED,
        courseId: 'course-1',
        course: { status: CourseStatus.PUBLISHED },
      },
    },
  };
}
