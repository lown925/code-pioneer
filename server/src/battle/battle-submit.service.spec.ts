import { ConflictException } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleQuestionPresentation,
  BattleQuestionType,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleAnswerService } from './battle-answer.service';
import { BattleNormalizationService } from './battle-normalization.service';
import { BattleDomainService } from './battle-domain.service';
import { BattleRatingService } from './battle-rating.service';
import { BattleRoomService } from './battle-room.service';
import { BattleScoreService } from './battle-score.service';
import { BattleSettlementService } from './battle-settlement.service';
import { BattleSubmitService } from './battle-submit.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_A_ID = '11111111-1111-4111-8111-111111111111';
const USER_B_ID = '22222222-2222-4222-8222-222222222222';

describe('BattleSubmitService', () => {
  function createServices() {
    const mock = createBattlePrismaMock();
    const scoreService = new BattleScoreService();
    const ratingService = new BattleRatingService();
    const domainService = new BattleDomainService(mock.prisma as never);
    const settlementService = new BattleSettlementService(
      mock.prisma as never,
      scoreService,
      ratingService,
      domainService,
    );
    const roomService = new BattleRoomService(
      mock.prisma as never,
      settlementService,
    );
    const submitService = new BattleSubmitService(
      mock.prisma as never,
      roomService,
      settlementService,
    );
    const answerService = new BattleAnswerService(
      mock.prisma as never,
      roomService,
      new BattleNormalizationService(),
      settlementService,
    );

    mock.users.set(USER_A_ID, {
      id: USER_A_ID,
      battleRating: 1000,
      nickname: 'Alpha',
    });
    mock.users.set(USER_B_ID, {
      id: USER_B_ID,
      battleRating: 1000,
      nickname: 'Beta',
    });
    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.IN_PROGRESS,
      questionCount: 2,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A_ID,
      startedAt: new Date(Date.now() - 60000),
      expiresAt: new Date(Date.now() + 60000),
      settledAt: null,
      completedAt: null,
      cancelledAt: null,
      endReason: null,
      winnerUserId: null,
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
      updatedAt: new Date('2026-07-25T10:00:00.000Z'),
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A_ID,
      seat: 1,
      status: BattleParticipantStatus.PLAYING,
      result: BattleResult.NONE,
      joinedAt: new Date('2026-07-25T10:00:01.000Z'),
    });
    mock.battleParticipants.set('participant-b', {
      id: 'participant-b',
      battleRoomId: 'room-1',
      userId: USER_B_ID,
      seat: 2,
      status: BattleParticipantStatus.PLAYING,
      result: BattleResult.NONE,
      joinedAt: new Date('2026-07-25T10:00:02.000Z'),
    });
    mock.battleQuestionSnapshots.set('snapshot-1', {
      id: 'snapshot-1',
      battleRoomId: 'room-1',
      sourceQuizQuestionId: 'source-1',
      orderIndex: 0,
      questionType: BattleQuestionType.SINGLE_CHOICE,
      presentation: BattleQuestionPresentation.TEXT_CHOICE,
      difficulty: null,
      stemSnapshot: [{ type: 'TEXT', text: 'Question 1' }],
      optionsSnapshot: [
        {
          id: 'option-a',
          sourceOptionId: 'source-option-a',
          orderIndex: 0,
          blocks: [{ type: 'TEXT', text: 'Option A' }],
        },
        {
          id: 'option-b',
          sourceOptionId: 'source-option-b',
          orderIndex: 1,
          blocks: [{ type: 'TEXT', text: 'Option B' }],
        },
      ],
      correctAnswerSnapshot: {
        type: 'SINGLE_CHOICE',
        optionId: 'option-a',
      },
      explanationSnapshot: null,
      acceptedAnswersSnapshot: null,
      answerNormalizationSnapshot: null,
      knowledgeTagsSnapshot: null,
      programmingLanguage: null,
      courseIdSnapshot: 'course-1',
      chapterIdSnapshot: 'chapter-1',
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
    });
    mock.battleQuestionSnapshots.set('snapshot-2', {
      id: 'snapshot-2',
      battleRoomId: 'room-1',
      sourceQuizQuestionId: 'source-2',
      orderIndex: 1,
      questionType: BattleQuestionType.SINGLE_CHOICE,
      presentation: BattleQuestionPresentation.TEXT_CHOICE,
      difficulty: null,
      stemSnapshot: [{ type: 'TEXT', text: 'Question 2' }],
      optionsSnapshot: [
        {
          id: 'option-c',
          sourceOptionId: 'source-option-c',
          orderIndex: 0,
          blocks: [{ type: 'TEXT', text: 'Option C' }],
        },
        {
          id: 'option-d',
          sourceOptionId: 'source-option-d',
          orderIndex: 1,
          blocks: [{ type: 'TEXT', text: 'Option D' }],
        },
      ],
      correctAnswerSnapshot: {
        type: 'SINGLE_CHOICE',
        optionId: 'option-c',
      },
      explanationSnapshot: null,
      acceptedAnswersSnapshot: null,
      answerNormalizationSnapshot: null,
      knowledgeTagsSnapshot: null,
      programmingLanguage: null,
      courseIdSnapshot: 'course-1',
      chapterIdSnapshot: 'chapter-1',
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
    });

    return {
      mock,
      submitService,
      answerService,
    };
  }

  it('marks the submitter as SUBMITTED and allows the opponent to continue answering', async () => {
    const { mock, submitService, answerService } = createServices();

    const submitResult = await submitService.submitBattle(USER_A_ID, 'room-1');

    expect(submitResult.data).toMatchObject({
      battleId: 'room-1',
      roomStatus: BattleRoomStatus.IN_PROGRESS,
      participantStatus: BattleParticipantStatus.SUBMITTED,
      waitingForOpponent: true,
      completed: false,
    });
    expect(mock.battleParticipants.get('participant-a')?.status).toBe(
      BattleParticipantStatus.SUBMITTED,
    );

    await expect(
      answerService.submitAnswer(USER_A_ID, 'room-1', {
        battleQuestionId: 'snapshot-1',
        clientRequestId: 'after-submit',
        answerVersion: 1,
        answer: {
          optionId: 'option-a',
        },
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    await expect(
      answerService.submitAnswer(USER_B_ID, 'room-1', {
        battleQuestionId: 'snapshot-1',
        clientRequestId: 'opponent-can-answer',
        answerVersion: 1,
        answer: {
          optionId: 'option-a',
        },
      }),
    ).resolves.toMatchObject({
      data: {
        accepted: true,
      },
    });
  });

  it('keeps repeated submit idempotent and settles when both participants have submitted', async () => {
    const { mock, submitService } = createServices();

    const first = await submitService.submitBattle(USER_A_ID, 'room-1');
    const second = await submitService.submitBattle(USER_A_ID, 'room-1');

    expect(first.data.waitingForOpponent).toBe(true);
    expect(second.data.waitingForOpponent).toBe(true);
    expect(mock.battleParticipants.get('participant-a')?.status).toBe(
      BattleParticipantStatus.SUBMITTED,
    );

    mock.battleAnswers.set('answer-b-1', {
      id: 'answer-b-1',
      battleRoomId: 'room-1',
      participantId: 'participant-b',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_B_ID,
      clientRequestId: 'request-b-1',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt: new Date('2026-07-25T10:03:00.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:03:00.000Z'),
    });

    const finalSubmit = await submitService.submitBattle(USER_B_ID, 'room-1');

    expect(finalSubmit.data.completed).toBe(true);
    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.COMPLETED,
    );
  });

  it('forfeit settles immediately and is idempotent on repeat calls', async () => {
    const { mock, submitService } = createServices();

    const forfeitResult = await submitService.forfeitBattle(USER_A_ID, 'room-1');

    expect(forfeitResult.data.completed).toBe(true);
    expect(mock.battleRooms.get('room-1')).toMatchObject({
      status: BattleRoomStatus.COMPLETED,
      winnerUserId: USER_B_ID,
    });

    const repeated = await submitService.forfeitBattle(USER_A_ID, 'room-1');
    expect(repeated.data.completed).toBe(true);
  });
});
