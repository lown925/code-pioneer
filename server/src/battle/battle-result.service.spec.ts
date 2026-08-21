import { ConflictException, ForbiddenException } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleResultService } from './battle-result.service';
import { BattleRoomService } from './battle-room.service';
import { BattleDomainService } from './battle-domain.service';
import { BattleRatingService } from './battle-rating.service';
import { BattleScoreService } from './battle-score.service';
import { BattleSettlementService } from './battle-settlement.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_A_ID = '11111111-1111-4111-8111-111111111111';
const USER_B_ID = '22222222-2222-4222-8222-222222222222';
const USER_C_ID = '33333333-3333-4333-8333-333333333333';

describe('BattleResultService', () => {
  function createService(status: BattleRoomStatus) {
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
      domainService,
      settlementService,
    );
    const service = new BattleResultService(
      mock.prisma as never,
      roomService,
      settlementService,
    );
    const now = Date.now();
    const startedAt =
      status === BattleRoomStatus.IN_PROGRESS
        ? new Date(now - 60000)
        : new Date(now + 60000);
    const expiresAt =
      status === BattleRoomStatus.IN_PROGRESS
        ? new Date(now + 120000)
        : new Date(now + 240000);
    const completedAt =
      status === BattleRoomStatus.COMPLETED ? new Date(now - 1000) : null;

    mock.users.set(USER_A_ID, {
      id: USER_A_ID,
      battleRating: 1000,
      nickname: 'Alpha',
      avatarUrl: 'https://cdn.example.com/a.png',
    });
    mock.users.set(USER_B_ID, {
      id: USER_B_ID,
      battleRating: 980,
      nickname: 'Beta',
      avatarUrl: 'https://cdn.example.com/b.png',
    });

    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: BattleMode.RANKED,
      status,
      questionCount: 2,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A_ID,
      startedAt,
      expiresAt,
      settledAt: completedAt,
      completedAt,
      cancelledAt: null,
      endReason: status === BattleRoomStatus.COMPLETED ? 'NORMAL' : null,
      winnerUserId: status === BattleRoomStatus.COMPLETED ? USER_A_ID : null,
      createdAt: new Date(now - 120000),
      updatedAt: completedAt ?? new Date(now - 1000),
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A_ID,
      seat: 1,
      status:
        status === BattleRoomStatus.COMPLETED
          ? BattleParticipantStatus.COMPLETED
          : BattleParticipantStatus.PLAYING,
      result:
        status === BattleRoomStatus.COMPLETED
          ? BattleResult.WIN
          : BattleResult.NONE,
      joinedAt: new Date(now - 90000),
      score: 4,
      correctCount: 2,
      wrongCount: 0,
      unansweredCount: 0,
      ratingBefore: 1000,
      ratingDelta: 16,
      ratingAfter: 1016,
      completedAt: status === BattleRoomStatus.COMPLETED ? completedAt : null,
    });
    mock.battleParticipants.set('participant-b', {
      id: 'participant-b',
      battleRoomId: 'room-1',
      userId: USER_B_ID,
      seat: 2,
      status:
        status === BattleRoomStatus.COMPLETED
          ? BattleParticipantStatus.COMPLETED
          : BattleParticipantStatus.PLAYING,
      result:
        status === BattleRoomStatus.COMPLETED
          ? BattleResult.LOSS
          : BattleResult.NONE,
      joinedAt: new Date(now - 89000),
      score: 1,
      correctCount: 1,
      wrongCount: 1,
      unansweredCount: 0,
      ratingBefore: 980,
      ratingDelta: -16,
      ratingAfter: 964,
      completedAt: status === BattleRoomStatus.COMPLETED ? completedAt : null,
    });

    mock.battleQuestionSnapshots.set('snapshot-1', {
      id: 'snapshot-1',
      battleRoomId: 'room-1',
      orderIndex: 0,
    } as never);
    mock.battleQuestionSnapshots.set('snapshot-2', {
      id: 'snapshot-2',
      battleRoomId: 'room-1',
      orderIndex: 1,
    } as never);
    mock.battleAnswers.set('answer-a-1', {
      id: 'answer-a-1',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      isCorrect: true,
      submittedAt: new Date(now - 5000),
      createdAt: new Date(now - 5000),
    } as never);
    mock.battleAnswers.set('answer-a-2', {
      id: 'answer-a-2',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-2',
      userId: USER_A_ID,
      isCorrect: true,
      submittedAt: new Date(now - 4000),
      createdAt: new Date(now - 4000),
    } as never);
    mock.battleAnswers.set('answer-b-1', {
      id: 'answer-b-1',
      battleRoomId: 'room-1',
      participantId: 'participant-b',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_B_ID,
      isCorrect: false,
      submittedAt: new Date(now - 3000),
      createdAt: new Date(now - 3000),
    } as never);

    return {
      mock,
      service,
    };
  }

  it('returns a pending payload before settlement without leaking scores', async () => {
    const { service } = createService(BattleRoomStatus.IN_PROGRESS);

    const result = await service.getBattleResult(USER_A_ID, 'room-1');

    expect(result.data).toMatchObject({
      battleId: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.IN_PROGRESS,
      completed: false,
    });
    expect(result.data).toMatchObject({
      totalQuestions: 2,
      myAnsweredCount: 2,
      opponentAnsweredCount: 1,
      mySubmitted: false,
      opponentSubmitted: false,
    });
    expect(result.data).not.toHaveProperty('myScore');
    expect(result.data).not.toHaveProperty('opponentScore');
    expect(result.data).not.toHaveProperty('myCorrectCount');
    expect(result.data).not.toHaveProperty('myWrongCount');
    expect(result.data).not.toHaveProperty('accuracy');
    expect(result.data).not.toHaveProperty('isCorrect');
    expect(result.data).not.toHaveProperty('combo');
    expect(result.data).not.toHaveProperty('answerPayload');
  });

  it('returns the completed result summary after settlement', async () => {
    const { service } = createService(BattleRoomStatus.COMPLETED);

    const result = await service.getBattleResult(USER_A_ID, 'room-1');

    expect(result.data).toMatchObject({
      battleId: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.COMPLETED,
      completed: true,
      result: BattleResult.WIN,
      myScore: 4,
      opponentScore: 1,
      ratingBefore: 1000,
      ratingDelta: 16,
      ratingAfter: 1016,
      answeredCount: 2,
      accuracy: 100,
      completionRate: 100,
      bestCombo: 2,
      opponentAnsweredCount: 2,
      opponentAccuracy: 50,
      opponentCompletionRate: 100,
      scoreDifference: 3,
      star: null,
      title: null,
      tierChange: null,
      opponent: {
        userId: USER_B_ID,
        nickname: 'Beta',
      },
    });
  });

  it('returns only the current participant progress for pending training', async () => {
    const { mock, service } = createService(BattleRoomStatus.IN_PROGRESS);
    mock.battleRooms.get('room-1')!.mode = BattleMode.TRAINING;
    mock.battleRooms.get('room-1')!.skillCode = 'PYTHON';
    mock.battleParticipants.delete('participant-b');
    mock.battleAnswers.delete('answer-b-1');

    const result = await service.getBattleResult(USER_A_ID, 'room-1');

    expect(result.data).toMatchObject({
      completed: false,
      totalQuestions: 2,
      myAnsweredCount: 2,
      opponentAnsweredCount: null,
      opponentSubmitted: null,
    });
  });

  it('returns a completed training result without an opponent or rating change', async () => {
    const { mock, service } = createService(BattleRoomStatus.COMPLETED);
    const room = mock.battleRooms.get('room-1')!;
    room.mode = BattleMode.TRAINING;
    room.skillCode = 'PYTHON';
    room.winnerUserId = null;
    mock.battleParticipants.delete('participant-b');

    const participant = mock.battleParticipants.get('participant-a')!;
    participant.result = BattleResult.NONE;
    participant.ratingBefore = 1000;
    participant.ratingDelta = 0;
    participant.ratingAfter = 1000;

    const result = await service.getBattleResult(USER_A_ID, 'room-1');

    expect(result.data).toMatchObject({
      battleId: 'room-1',
      mode: BattleMode.TRAINING,
      status: BattleRoomStatus.COMPLETED,
      completed: true,
      result: BattleResult.NONE,
      myScore: 4,
      opponentScore: null,
      myCorrectCount: 2,
      opponentCorrectCount: null,
      ratingBefore: 1000,
      ratingDelta: 0,
      ratingAfter: 1000,
      answeredCount: 2,
      accuracy: 100,
      completionRate: 100,
      bestCombo: 2,
      opponentAnsweredCount: null,
      opponentAccuracy: null,
      opponentCompletionRate: null,
      scoreDifference: null,
      opponent: null,
    });
  });

  it('returns live AI progress without leaking plan correctness or final score', async () => {
    const { mock, service } = createService(BattleRoomStatus.IN_PROGRESS);
    const room = mock.battleRooms.get('room-1')!;
    room.mode = BattleMode.AI;
    room.skillCode = 'PYTHON';
    mock.battleParticipants.delete('participant-b');
    mock.battleAnswers.delete('answer-b-1');
    mock.battleAiOpponents.set('ai-opponent-1', {
      id: 'ai-opponent-1',
      battleRoomId: room.id,
      displayName: '电脑对手',
      strategyVersion: 'normal-v1',
      seed: 'seed',
      answerPlan: {
        strategyVersion: 'normal-v1',
        questions: [
          {
            battleQuestionSnapshotId: 'snapshot-1',
            orderIndex: 0,
            plannedCompletedOffsetMs: 30_000,
            plannedCorrect: true,
          },
          {
            battleQuestionSnapshotId: 'snapshot-2',
            orderIndex: 1,
            plannedCompletedOffsetMs: 90_000,
            plannedCorrect: false,
          },
        ],
      },
      plannedSubmittedOffsetMs: 100_000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.getBattleResult(USER_A_ID, room.id);

    expect(result.data).toMatchObject({
      completed: false,
      opponentAnsweredCount: 1,
      opponentSubmitted: false,
      opponent: {
        type: 'AI',
        displayName: '电脑对手',
        answeredCount: 1,
        submitted: false,
      },
    });
    expect(result.data.opponent).not.toHaveProperty('correctCount');
    expect(result.data.opponent).not.toHaveProperty('score');
    expect(result.data.opponent).not.toHaveProperty('plannedSubmittedOffsetMs');
  });

  it('returns completed AI statistics, completion times, and server result reason', async () => {
    const { mock, service } = createService(BattleRoomStatus.COMPLETED);
    const room = mock.battleRooms.get('room-1')!;
    room.mode = BattleMode.AI;
    room.skillCode = 'PYTHON';
    room.winnerUserId = USER_A_ID;
    mock.battleParticipants.delete('participant-b');
    mock.battleAnswers.delete('answer-b-1');
    const participant = mock.battleParticipants.get('participant-a')!;
    participant.result = BattleResult.WIN;
    participant.submittedAt = new Date(room.startedAt!.getTime() + 50_000);
    participant.ratingBefore = null;
    participant.ratingDelta = 0;
    participant.ratingAfter = null;
    mock.battleAiOpponents.set('ai-opponent-1', {
      id: 'ai-opponent-1',
      battleRoomId: room.id,
      displayName: '电脑对手',
      strategyVersion: 'normal-v1',
      seed: 'seed',
      answerPlan: {
        strategyVersion: 'normal-v1',
        questions: [
          {
            battleQuestionSnapshotId: 'snapshot-1',
            orderIndex: 0,
            plannedCompletedOffsetMs: 20_000,
            plannedCorrect: true,
          },
          {
            battleQuestionSnapshotId: 'snapshot-2',
            orderIndex: 1,
            plannedCompletedOffsetMs: 40_000,
            plannedCorrect: false,
          },
        ],
      },
      plannedSubmittedOffsetMs: 60_000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.getBattleResult(USER_A_ID, room.id);

    expect(result.data).toMatchObject({
      completed: true,
      mode: BattleMode.AI,
      result: BattleResult.WIN,
      resultReason: 'MORE_CORRECT',
      myCompletionTimeMs: 50_000,
      opponentCompletionTimeMs: 60_000,
      ratingBefore: 0,
      ratingDelta: 0,
      ratingAfter: 0,
      opponent: {
        type: 'AI',
        displayName: '电脑对手',
        answeredCount: 2,
        correctCount: 1,
        wrongCount: 1,
        unansweredCount: 0,
        completionTimeMs: 60_000,
        score: 1,
      },
    });
  });

  it('returns first-placement tier data for a completed skill-ranked battle', async () => {
    const { mock, service } = createService(BattleRoomStatus.COMPLETED);
    const room = mock.battleRooms.get('room-1')! as {
      skillCode?: string | null;
      skill?: { name: string };
    };
    room.skillCode = 'PYTHON';
    room.skill = { name: 'Python' };
    const participant = mock.battleParticipants.get('participant-a')!;
    participant.ratingBefore = 1000;
    participant.ratingAfter = 1080;
    participant.ratingDelta = 80;
    mock.battleRatingLogs.set('log-a', {
      id: 'log-a',
      userId: USER_A_ID,
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      skillCode: 'PYTHON',
      reason: 'BATTLE_RESULT',
      ratingBefore: 1000,
      ratingDelta: 80,
      ratingAfter: 1080,
      createdAt: new Date(Date.now() - 1000),
    } as never);

    const result = await service.getBattleResult(USER_A_ID, 'room-1');

    expect(result.data).toMatchObject({
      star: 3,
      title: 'Python 熟练者',
      beforeStar: null,
      afterStar: 3,
      tierChange: 'PLACED',
    });
  });

  it('uses professional-track logs and titles for a track-ranked battle', async () => {
    const { mock, service } = createService(BattleRoomStatus.COMPLETED);
    const room = mock.battleRooms.get('room-1')! as {
      skillCode?: string | null;
      professionalTrackKey?: string | null;
      skill?: { name: string };
    };
    room.skillCode = 'PYTHON';
    room.professionalTrackKey = 'big-data';
    room.skill = { name: 'Python' };
    const participant = mock.battleParticipants.get('participant-a')!;
    participant.ratingBefore = 1000;
    participant.ratingAfter = 1080;
    participant.ratingDelta = 80;
    mock.battleRatingLogs.set('track-log-a', {
      id: 'track-log-a',
      userId: USER_A_ID,
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      skillCode: 'PYTHON',
      professionalTrackKey: 'big-data',
      reason: 'BATTLE_RESULT',
      ratingBefore: 1000,
      ratingDelta: 80,
      ratingAfter: 1080,
      createdAt: new Date(Date.now() - 1000),
    } as never);

    const result = await service.getBattleResult(USER_A_ID, 'room-1');

    expect(result.data.professionalTrackKey).toBe('big-data');
    expect(result.data.star).toBe(3);
    expect(result.data.title).not.toContain('Python');
  });

  it('rejects non-participants and not-started rooms', async () => {
    const { mock, service } = createService(BattleRoomStatus.READY);

    await expect(
      service.getBattleResult(USER_A_ID, 'room-1'),
    ).rejects.toBeInstanceOf(ConflictException);

    mock.battleRooms.get('room-1')!.status = BattleRoomStatus.COMPLETED;

    await expect(
      service.getBattleResult(USER_C_ID, 'room-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
