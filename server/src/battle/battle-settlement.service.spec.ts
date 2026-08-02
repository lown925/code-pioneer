import {
  BattleEndReason,
  BattleMode,
  BattleParticipantStatus,
  BattleQuestionPresentation,
  BattleQuestionType,
  BattleRatingReason,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleDomainService } from './battle-domain.service';
import { BattleRatingService } from './battle-rating.service';
import { BattleScoreService } from './battle-score.service';
import { BattleSettlementService } from './battle-settlement.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_A_ID = '11111111-1111-4111-8111-111111111111';
const USER_B_ID = '22222222-2222-4222-8222-222222222222';

describe('BattleSettlementService', () => {
  function createService(mode: BattleMode = BattleMode.RANKED) {
    const mock = createBattlePrismaMock();
    const scoreService = new BattleScoreService();
    const ratingService = new BattleRatingService();
    const domainService = new BattleDomainService(mock.prisma as never);
    const service = new BattleSettlementService(
      mock.prisma as never,
      scoreService,
      ratingService,
      domainService,
    );

    mock.users.set(USER_A_ID, {
      id: USER_A_ID,
      battleRating: 1000,
      nickname: 'Alpha',
      avatarUrl: 'https://cdn.example.com/a.png',
    });
    mock.users.set(USER_B_ID, {
      id: USER_B_ID,
      battleRating: 1000,
      nickname: 'Beta',
      avatarUrl: 'https://cdn.example.com/b.png',
    });

    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode,
      status: BattleRoomStatus.IN_PROGRESS,
      questionCount: 3,
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
      winnerUserId: null,
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
      updatedAt: new Date('2026-07-25T10:00:00.000Z'),
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A_ID,
      seat: 1,
      status: BattleParticipantStatus.SUBMITTED,
      result: BattleResult.NONE,
      joinedAt: new Date('2026-07-25T10:00:01.000Z'),
      submittedAt: new Date('2026-07-25T10:03:00.000Z'),
    });
    mock.battleParticipants.set('participant-b', {
      id: 'participant-b',
      battleRoomId: 'room-1',
      userId: USER_B_ID,
      seat: 2,
      status: BattleParticipantStatus.SUBMITTED,
      result: BattleResult.NONE,
      joinedAt: new Date('2026-07-25T10:00:02.000Z'),
      submittedAt: new Date('2026-07-25T10:03:05.000Z'),
    });

    for (let index = 0; index < 3; index += 1) {
      mock.battleQuestionSnapshots.set(`snapshot-${index + 1}`, {
        id: `snapshot-${index + 1}`,
        battleRoomId: 'room-1',
        sourceQuizQuestionId: `source-${index + 1}`,
        orderIndex: index,
        questionType: BattleQuestionType.SINGLE_CHOICE,
        presentation: BattleQuestionPresentation.TEXT_CHOICE,
        difficulty: null,
        stemSnapshot: [{ type: 'TEXT', text: `Question ${index + 1}` }],
        optionsSnapshot: [],
        correctAnswerSnapshot: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
        explanationSnapshot: null,
        acceptedAnswersSnapshot: null,
        answerNormalizationSnapshot: null,
        knowledgeTagsSnapshot: null,
        programmingLanguage: null,
        courseIdSnapshot: 'course-1',
        chapterIdSnapshot: 'chapter-1',
        createdAt: new Date('2026-07-25T10:00:00.000Z'),
      });
    }

    return { mock, service };
  }

  it('settles a ranked battle once, recomputes score from BattleAnswer, updates profiles and logs', async () => {
    const { mock, service } = createService(BattleMode.RANKED);

    mock.battleAnswers.set('answer-a-1', {
      id: 'answer-a-1',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      clientRequestId: 'request-a-1',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt: new Date('2026-07-25T10:03:00.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:03:00.000Z'),
    });
    mock.battleAnswers.set('answer-a-2', {
      id: 'answer-a-2',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-2',
      userId: USER_A_ID,
      clientRequestId: 'request-a-2',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-b' },
      normalizedAnswer: null,
      isCorrect: false,
      scoreDelta: -1,
      submittedAt: new Date('2026-07-25T10:03:02.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:03:02.000Z'),
    });
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
      submittedAt: new Date('2026-07-25T10:03:03.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:03:03.000Z'),
    });

    const settledRoom = await service.normalizeBattleState(
      'room-1',
      new Date('2026-07-25T10:04:00.000Z'),
    );

    expect(settledRoom?.status).toBe(BattleRoomStatus.COMPLETED);
    expect(mock.battleRooms.get('room-1')?.winnerUserId).toBe(USER_B_ID);
    expect(mock.battleParticipants.get('participant-a')).toMatchObject({
      status: BattleParticipantStatus.COMPLETED,
      result: BattleResult.LOSS,
      score: 1,
      correctCount: 1,
      wrongCount: 1,
      unansweredCount: 1,
      ratingBefore: 1000,
      ratingAfter: 984,
    });
    expect(mock.battleParticipants.get('participant-b')).toMatchObject({
      status: BattleParticipantStatus.COMPLETED,
      result: BattleResult.WIN,
      score: 2,
      correctCount: 1,
      wrongCount: 0,
      unansweredCount: 2,
      ratingBefore: 1000,
      ratingAfter: 1016,
    });
    expect(mock.battleProfiles.get(USER_A_ID)).toMatchObject({
      rating: 984,
      highestRating: 1000,
      totalBattles: 1,
      rankedBattles: 1,
      losses: 1,
      currentWinStreak: 0,
    });
    expect(mock.battleProfiles.get(USER_B_ID)).toMatchObject({
      rating: 1016,
      highestRating: 1016,
      totalBattles: 1,
      rankedBattles: 1,
      wins: 1,
      currentWinStreak: 1,
      bestWinStreak: 1,
    });
    expect(
      [...mock.battleRatingLogs.values()].filter(
        (item) => item.reason === BattleRatingReason.BATTLE_RESULT,
      ),
    ).toHaveLength(2);

    await service.normalizeBattleState(
      'room-1',
      new Date('2026-07-25T10:05:00.000Z'),
    );

    expect(mock.battleProfiles.get(USER_A_ID)?.totalBattles).toBe(1);
    expect(mock.battleRatingLogs.size).toBe(2);
  });

  it('auto-submits timeout participants and settles friend battle without rating change or logs', async () => {
    const { mock, service } = createService(BattleMode.FRIEND);
    const expiresAt = new Date('2026-07-25T10:04:00.000Z');
    const room = mock.battleRooms.get('room-1');

    if (room) {
      room.expiresAt = expiresAt;
    }

    const participantA = mock.battleParticipants.get('participant-a');
    const participantB = mock.battleParticipants.get('participant-b');

    if (participantA) {
      participantA.status = BattleParticipantStatus.PLAYING;
      participantA.submittedAt = null;
    }

    if (participantB) {
      participantB.status = BattleParticipantStatus.PLAYING;
      participantB.submittedAt = null;
    }

    mock.battleAnswers.set('answer-a-1', {
      id: 'answer-a-1',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      clientRequestId: 'request-a-1',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt: new Date('2026-07-25T10:03:00.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:03:00.000Z'),
    });

    await service.normalizeBattleState(
      'room-1',
      new Date('2026-07-25T10:04:00.000Z'),
    );

    expect(mock.battleParticipants.get('participant-a')).toMatchObject({
      status: BattleParticipantStatus.COMPLETED,
      result: BattleResult.WIN,
      submittedAt: expiresAt,
      ratingBefore: 1000,
      ratingDelta: 0,
      ratingAfter: 1000,
    });
    expect(mock.battleParticipants.get('participant-b')).toMatchObject({
      status: BattleParticipantStatus.COMPLETED,
      result: BattleResult.LOSS,
      submittedAt: expiresAt,
      ratingBefore: 1000,
      ratingDelta: 0,
      ratingAfter: 1000,
    });
    expect(mock.battleProfiles.get(USER_A_ID)).toMatchObject({
      rating: 1000,
      totalBattles: 1,
      friendBattles: 1,
      wins: 1,
    });
    expect(mock.battleProfiles.get(USER_B_ID)).toMatchObject({
      rating: 1000,
      totalBattles: 1,
      friendBattles: 1,
      losses: 1,
    });
    expect(mock.battleRatingLogs.size).toBe(0);
    expect(mock.battleRooms.get('room-1')?.endReason).toBe(BattleEndReason.EXPIRED);
  });

  it('treats forfeit as an immediate valid loss/win settlement', async () => {
    const { mock, service } = createService(BattleMode.RANKED);
    const participantA = mock.battleParticipants.get('participant-a');

    if (participantA) {
      participantA.status = BattleParticipantStatus.FORFEITED;
      participantA.forfeitedAt = new Date('2026-07-25T10:03:30.000Z');
    }

    await service.normalizeBattleState(
      'room-1',
      new Date('2026-07-25T10:03:31.000Z'),
    );

    expect(mock.battleRooms.get('room-1')).toMatchObject({
      status: BattleRoomStatus.COMPLETED,
      winnerUserId: USER_B_ID,
      endReason: BattleEndReason.USER_FORFEIT,
    });
    expect(mock.battleParticipants.get('participant-a')?.result).toBe(
      BattleResult.LOSS,
    );
    expect(mock.battleParticipants.get('participant-b')?.result).toBe(
      BattleResult.WIN,
    );
  });

  it('rolls back settlement transaction when rating log creation fails', async () => {
    const { mock, service } = createService(BattleMode.RANKED);

    mock.battleAnswers.set('answer-a-1', {
      id: 'answer-a-1',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      clientRequestId: 'request-a-1',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt: new Date('2026-07-25T10:03:00.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:03:00.000Z'),
    });

    const originalCreate = mock.tx.battleRatingLog.create;
    let callCount = 0;
    mock.tx.battleRatingLog.create = jest.fn(async (input) => {
      callCount += 1;

      if (callCount === 2) {
        throw new Error('rating log write failed');
      }

      return originalCreate(input);
    });

    await expect(
      service.normalizeBattleState('room-1', new Date('2026-07-25T10:04:00.000Z')),
    ).rejects.toThrow('rating log write failed');

    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.IN_PROGRESS,
    );
    expect(mock.battleParticipants.get('participant-a')?.status).toBe(
      BattleParticipantStatus.SUBMITTED,
    );
    expect(mock.battleProfiles.size).toBe(0);
    expect(mock.battleRatingLogs.size).toBe(0);
  });

  it('settles only once when multiple requests trigger settlement concurrently', async () => {
    const { mock, service } = createService(BattleMode.RANKED);

    mock.battleAnswers.set('answer-a-1', {
      id: 'answer-a-1',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      clientRequestId: 'request-a-1',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt: new Date('2026-07-25T10:03:00.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:03:00.000Z'),
    });

    await Promise.all([
      service.normalizeBattleState('room-1', new Date('2026-07-25T10:04:00.000Z')),
      service.normalizeBattleState('room-1', new Date('2026-07-25T10:04:00.000Z')),
    ]);

    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.COMPLETED,
    );
    expect(mock.battleProfiles.get(USER_A_ID)?.totalBattles).toBe(1);
    expect(mock.battleProfiles.get(USER_B_ID)?.totalBattles).toBe(1);
    expect(mock.battleRatingLogs.size).toBe(2);
  });

  it('recovers stale SETTLING rooms by retrying settlement', async () => {
    const { mock, service } = createService(BattleMode.RANKED);
    const room = mock.battleRooms.get('room-1');

    if (room) {
      room.status = BattleRoomStatus.SETTLING;
      room.updatedAt = new Date(Date.now() - 31_000);
    }

    mock.battleAnswers.set('answer-a-1', {
      id: 'answer-a-1',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      clientRequestId: 'request-a-1',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt: new Date('2026-07-25T10:03:00.000Z'),
      timeSpentMs: null,
      createdAt: new Date('2026-07-25T10:03:00.000Z'),
    });

    await service.normalizeBattleState('room-1', new Date());

    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.COMPLETED,
    );
    expect(mock.battleRatingLogs.size).toBe(2);
  });
});
