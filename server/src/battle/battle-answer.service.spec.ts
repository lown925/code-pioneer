import {
  BadRequestException,
  ConflictException,
  GoneException,
} from '@nestjs/common';
import {
  BattleParticipantStatus,
  BattleQuestionPresentation,
  BattleQuestionType,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleAnswerService } from './battle-answer.service';
import { BattleDomainService } from './battle-domain.service';
import { BattleNormalizationService } from './battle-normalization.service';
import { BattleRoomService } from './battle-room.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_A_ID = '11111111-1111-4111-8111-111111111111';

describe('BattleAnswerService', () => {
  function createService() {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const roomService = new BattleRoomService(
      mock.prisma as never,
      domainService,
    );
    const normalizationService = new BattleNormalizationService();
    const service = new BattleAnswerService(
      mock.prisma as never,
      roomService,
      normalizationService,
    );

    mock.users.set(USER_A_ID, {
      id: USER_A_ID,
      battleRating: 1000,
      nickname: 'Answer User',
    });
    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: 'RANKED',
      status: BattleRoomStatus.IN_PROGRESS,
      questionCount: 2,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A_ID,
      expiresAt: new Date(Date.now() + 60000),
      startedAt: new Date(Date.now() - 60000),
      settledAt: null,
      completedAt: null,
      cancelledAt: null,
      endReason: null,
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A_ID,
      seat: 1,
      status: BattleParticipantStatus.PLAYING,
      result: 'NONE',
      joinedAt: new Date('2026-07-25T10:00:00.000Z'),
      score: 0,
      correctCount: 0,
      wrongCount: 0,
    });
    mock.battleQuestionSnapshots.set('snapshot-choice', {
      id: 'snapshot-choice',
      battleRoomId: 'room-1',
      sourceQuizQuestionId: 'source-choice',
      orderIndex: 0,
      questionType: BattleQuestionType.SINGLE_CHOICE,
      presentation: BattleQuestionPresentation.TEXT_CHOICE,
      difficulty: 'EASY',
      stemSnapshot: [{ type: 'TEXT', text: 'Choice question' }],
      optionsSnapshot: [
        {
          id: 'option-correct',
          sourceOptionId: 'source-correct',
          orderIndex: 0,
          blocks: [{ type: 'TEXT', text: 'Correct option' }],
        },
        {
          id: 'option-wrong',
          sourceOptionId: 'source-wrong',
          orderIndex: 1,
          blocks: [{ type: 'TEXT', text: 'Wrong option' }],
        },
      ],
      correctAnswerSnapshot: {
        type: 'SINGLE_CHOICE',
        optionId: 'option-correct',
      },
      explanationSnapshot: [{ type: 'TEXT', text: 'Hidden explanation' }],
      acceptedAnswersSnapshot: null,
      answerNormalizationSnapshot: null,
      knowledgeTagsSnapshot: ['tag'],
      programmingLanguage: null,
      courseIdSnapshot: 'course-1',
      chapterIdSnapshot: 'chapter-1',
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
    });
    mock.battleQuestionSnapshots.set('snapshot-code', {
      id: 'snapshot-code',
      battleRoomId: 'room-1',
      sourceQuizQuestionId: 'source-code',
      orderIndex: 1,
      questionType: BattleQuestionType.CODE_FILL,
      presentation: BattleQuestionPresentation.INPUT_CODE_FILL,
      difficulty: 'MEDIUM',
      stemSnapshot: [{ type: 'TEXT', text: 'Code fill question' }],
      optionsSnapshot: [],
      correctAnswerSnapshot: { type: 'CODE_FILL' },
      explanationSnapshot: null,
      acceptedAnswersSnapshot: ['print(1)'],
      answerNormalizationSnapshot: {
        trim: true,
        normalizeLineEndings: true,
        caseSensitive: false,
        collapseWhitespace: true,
        acceptedAnswers: ['print(1)'],
      },
      knowledgeTagsSnapshot: ['tag'],
      programmingLanguage: 'python',
      courseIdSnapshot: 'course-1',
      chapterIdSnapshot: 'chapter-1',
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
    });

    return { mock, service };
  }

  it('saves a correct SINGLE_CHOICE answer without mutating participant aggregates before settlement', async () => {
    const { mock, service } = createService();

    const result = await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'request-choice',
      answerVersion: 1,
      answer: {
        optionId: 'option-correct',
      },
    });

    expect(result.data.accepted).toBe(true);
    expect(result.data).not.toHaveProperty('isCorrect');
    expect(result.data.answerVersion).toBe(1);
    expect(mock.battleParticipants.get('participant-a')?.score).toBe(0);
    expect(mock.battleParticipants.get('participant-a')?.correctCount).toBe(0);
    expect([...mock.battleAnswers.values()][0]?.isCorrect).toBe(true);
  });

  it('stores training answers through the regular BattleAnswer flow', async () => {
    const { mock, service } = createService();
    mock.battleRooms.get('room-1')!.mode = 'TRAINING';
    mock.battleRooms.get('room-1')!.skillCode = 'PYTHON';

    await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'training-request',
      answerVersion: 1,
      answer: {
        optionId: 'option-wrong',
      },
    });

    expect([...mock.battleAnswers.values()]).toEqual([
      expect.objectContaining({
        battleRoomId: 'room-1',
        userId: USER_A_ID,
        clientRequestId: 'training-request',
        isCorrect: false,
      }),
    ]);
  });

  it('returns the same response idempotently for repeated clientRequestId', async () => {
    const { mock, service } = createService();

    const first = await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'same-request',
      answerVersion: 1,
      answer: {
        optionId: 'option-wrong',
      },
    });
    const second = await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'same-request',
      answerVersion: 1,
      answer: {
        optionId: 'option-wrong',
      },
    });

    expect(first.data.battleQuestionId).toBe(second.data.battleQuestionId);
    expect(mock.battleAnswers.size).toBe(1);
    expect(first.data.answerVersion).toBe(second.data.answerVersion);
  });

  it('updates the same question when a newer answerVersion arrives', async () => {
    const { mock, service } = createService();

    await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'request-1',
      answerVersion: 1,
      answer: {
        optionId: 'option-wrong',
      },
    });

    const result = await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'request-2',
      answerVersion: 2,
      answer: {
        optionId: 'option-correct',
      },
    });

    expect(result.data.answerVersion).toBe(2);
    expect(mock.battleAnswers.size).toBe(1);
    expect([...mock.battleAnswers.values()][0]).toMatchObject({
      clientRequestId: 'request-2',
      answerVersion: 2,
      isCorrect: true,
    });
  });

  it('ignores an outdated answerVersion so old requests cannot overwrite the latest answer', async () => {
    const { mock, service } = createService();

    await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'request-new',
      answerVersion: 3,
      answer: {
        optionId: 'option-correct',
      },
    });

    const stale = await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'request-old',
      answerVersion: 2,
      answer: {
        optionId: 'option-wrong',
      },
    });

    expect(stale.data.answerVersion).toBe(3);
    expect([...mock.battleAnswers.values()][0]).toMatchObject({
      clientRequestId: 'request-new',
      answerVersion: 3,
      isCorrect: true,
    });
  });

  it('normalizes CODE_FILL answers before scoring', async () => {
    const { mock, service } = createService();

    await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-code',
      clientRequestId: 'request-code',
      answerVersion: 1,
      answer: {
        value: '  PRINT(1)  ',
      },
    });

    expect([...mock.battleAnswers.values()][0].normalizedAnswer).toBe(
      'print(1)',
    );
  });

  it('rejects invalid option ids and expired rooms', async () => {
    const { mock, service } = createService();

    await expect(
      service.submitAnswer(USER_A_ID, 'room-1', {
        battleQuestionId: 'snapshot-choice',
        clientRequestId: 'request-invalid',
        answerVersion: 1,
        answer: {
          optionId: 'not-an-option',
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    mock.battleRooms.get('room-1')!.expiresAt = new Date(Date.now() - 1000);

    await expect(
      service.submitAnswer(USER_A_ID, 'room-1', {
        battleQuestionId: 'snapshot-code',
        clientRequestId: 'request-expired',
        answerVersion: 1,
        answer: {
          value: 'print(1)',
        },
      }),
    ).rejects.toBeInstanceOf(GoneException);
  });

  it('rejects clientRequestId reuse when payload or version differs', async () => {
    const { service } = createService();

    await service.submitAnswer(USER_A_ID, 'room-1', {
      battleQuestionId: 'snapshot-choice',
      clientRequestId: 'same-request',
      answerVersion: 1,
      answer: {
        optionId: 'option-correct',
      },
    });

    await expect(
      service.submitAnswer(USER_A_ID, 'room-1', {
        battleQuestionId: 'snapshot-choice',
        clientRequestId: 'same-request',
        answerVersion: 2,
        answer: {
          optionId: 'option-wrong',
        },
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
