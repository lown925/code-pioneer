import {
  BattleParticipantStatus,
  BattleQuestionPresentation,
  BattleQuestionType,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleQuestionService } from './battle-question.service';
import { BattleRoomService } from './battle-room.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_A_ID = '11111111-1111-4111-8111-111111111111';

describe('BattleQuestionService', () => {
  function createService() {
    const mock = createBattlePrismaMock();
    const roomService = new BattleRoomService(mock.prisma as never);
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
});
