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
import { AI_STRATEGY_VERSION } from './battle.constants';

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

  it('rejects an AI room with a missing persisted plan without side effects', async () => {
    const { mock, service } = createService(BattleMode.AI);
    mock.battleParticipants.delete('participant-b');

    const result = await service.normalizeBattleState(
      'room-1',
      new Date('2026-07-25T10:03:30.000Z'),
    );

    expect(result?.status).toBe(BattleRoomStatus.IN_PROGRESS);
    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.IN_PROGRESS,
    );
    expect(mock.battleProfiles.size).toBe(0);
    expect(mock.userBattleSkillRatings.size).toBe(0);
    expect(mock.battleRatingLogs.size).toBe(0);
  });

  it('settles AI by correct count first, then server completion time, without rating writes', async () => {
    const { mock, service } = createService(BattleMode.AI);
    mock.battleParticipants.delete('participant-b');
    const room = mock.battleRooms.get('room-1')!;
    const startedAt = new Date('2026-07-25T10:00:00.000Z');
    const submittedAt = new Date('2026-07-25T10:00:09.000Z');
    room.startedAt = startedAt;
    room.expiresAt = new Date('2026-07-25T10:03:00.000Z');
    room.skillCode = 'PYTHON';
    room.status = BattleRoomStatus.IN_PROGRESS;
    const participant = mock.battleParticipants.get('participant-a')!;
    participant.status = BattleParticipantStatus.SUBMITTED;
    participant.submittedAt = submittedAt;

    mock.battleAiOpponents.set('ai-opponent-1', {
      id: 'ai-opponent-1',
      battleRoomId: room.id,
      displayName: '电脑对手',
      strategyVersion: AI_STRATEGY_VERSION,
      seed: 'seed',
      answerPlan: {
        strategyVersion: AI_STRATEGY_VERSION,
        questions: [
          {
            battleQuestionSnapshotId: 'snapshot-1',
            orderIndex: 0,
            plannedCompletedOffsetMs: 5_000,
            plannedCorrect: true,
          },
          {
            battleQuestionSnapshotId: 'snapshot-2',
            orderIndex: 1,
            plannedCompletedOffsetMs: 7_000,
            plannedCorrect: true,
          },
          {
            battleQuestionSnapshotId: 'snapshot-3',
            orderIndex: 2,
            plannedCompletedOffsetMs: 9_000,
            plannedCorrect: false,
          },
        ],
      },
      plannedSubmittedOffsetMs: 10_000,
      createdAt: startedAt,
      updatedAt: startedAt,
    });
    mock.battleAnswers.set('answer-a-1', {
      id: 'answer-a-1',
      battleRoomId: room.id,
      participantId: participant.id,
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      clientRequestId: 'request-a-1',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt,
      timeSpentMs: null,
      createdAt: submittedAt,
    });
    mock.battleAnswers.set('answer-a-2', {
      id: 'answer-a-2',
      battleRoomId: room.id,
      participantId: participant.id,
      battleQuestionSnapshotId: 'snapshot-2',
      userId: USER_A_ID,
      clientRequestId: 'request-a-2',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-a' },
      normalizedAnswer: null,
      isCorrect: true,
      scoreDelta: 2,
      submittedAt,
      timeSpentMs: null,
      createdAt: submittedAt,
    });

    await service.normalizeBattleState(
      room.id,
      new Date('2026-07-25T10:00:10.000Z'),
    );

    expect(mock.battleRooms.get(room.id)).toMatchObject({
      status: BattleRoomStatus.COMPLETED,
      winnerUserId: USER_A_ID,
    });
    expect(mock.battleParticipants.get(participant.id)).toMatchObject({
      status: BattleParticipantStatus.COMPLETED,
      result: BattleResult.WIN,
      correctCount: 2,
      wrongCount: 0,
      unansweredCount: 1,
      ratingBefore: null,
      ratingDelta: 0,
      ratingAfter: null,
    });
    expect(mock.battleProfiles.get(USER_A_ID)).toMatchObject({
      totalBattles: 1,
      wins: 1,
      rankedBattles: 0,
    });
    expect(mock.userBattleSkillRatings.size).toBe(0);
    expect(mock.battleRatingLogs.size).toBe(0);
  });

  it('settles an AI forfeit immediately as a loss without waiting for the plan', async () => {
    const { mock, service } = createService(BattleMode.AI);
    mock.battleParticipants.delete('participant-b');
    const room = mock.battleRooms.get('room-1')!;
    room.startedAt = new Date('2026-07-25T10:00:00.000Z');
    room.expiresAt = new Date('2026-07-25T10:03:00.000Z');
    room.status = BattleRoomStatus.IN_PROGRESS;
    mock.battleAiOpponents.set('ai-opponent-1', {
      id: 'ai-opponent-1',
      battleRoomId: room.id,
      displayName: '电脑对手',
      strategyVersion: AI_STRATEGY_VERSION,
      seed: 'seed',
      answerPlan: {
        strategyVersion: AI_STRATEGY_VERSION,
        questions: [
          ...[1, 2, 3].map((index) => ({
            battleQuestionSnapshotId: `snapshot-${index}`,
            orderIndex: index - 1,
            plannedCompletedOffsetMs: index * 5_000,
            plannedCorrect: index !== 3,
          })),
        ],
      },
      plannedSubmittedOffsetMs: 20_000,
      createdAt: room.startedAt,
      updatedAt: room.startedAt,
    });
    const participant = mock.battleParticipants.get('participant-a')!;
    participant.status = BattleParticipantStatus.FORFEITED;
    participant.forfeitedAt = new Date('2026-07-25T10:00:02.000Z');

    await service.normalizeBattleState(
      room.id,
      new Date('2026-07-25T10:00:03.000Z'),
    );

    expect(mock.battleRooms.get(room.id)).toMatchObject({
      status: BattleRoomStatus.COMPLETED,
      winnerUserId: null,
      endReason: BattleEndReason.USER_FORFEIT,
    });
    expect(mock.battleParticipants.get(participant.id)?.result).toBe(
      BattleResult.LOSS,
    );
    expect(mock.battleRatingLogs.size).toBe(0);
    expect(mock.userBattleSkillRatings.size).toBe(0);
  });

  it('keeps an early-submitted AI battle in progress until the persisted AI time', async () => {
    const { mock, service } = createService(BattleMode.AI);
    mock.battleParticipants.delete('participant-b');
    const room = mock.battleRooms.get('room-1')!;
    const startedAt = new Date('2026-07-25T10:00:00.000Z');
    room.startedAt = startedAt;
    room.expiresAt = new Date('2026-07-25T10:03:00.000Z');
    room.status = BattleRoomStatus.IN_PROGRESS;
    const participant = mock.battleParticipants.get('participant-a')!;
    participant.status = BattleParticipantStatus.SUBMITTED;
    participant.submittedAt = new Date('2026-07-25T10:00:05.000Z');
    mock.battleAiOpponents.set('ai-opponent-1', {
      id: 'ai-opponent-1',
      battleRoomId: room.id,
      displayName: '电脑对手',
      strategyVersion: AI_STRATEGY_VERSION,
      seed: 'seed',
      answerPlan: {
        strategyVersion: AI_STRATEGY_VERSION,
        questions: [1, 2, 3].map((index) => ({
          battleQuestionSnapshotId: `snapshot-${index}`,
          orderIndex: index - 1,
          plannedCompletedOffsetMs: index * 10_000,
          plannedCorrect: index !== 3,
        })),
      },
      plannedSubmittedOffsetMs: 40_000,
      createdAt: startedAt,
      updatedAt: startedAt,
    });

    const pending = await service.normalizeBattleState(
      room.id,
      new Date('2026-07-25T10:00:20.000Z'),
    );

    expect(pending?.status).toBe(BattleRoomStatus.IN_PROGRESS);
    expect(mock.battleProfiles.size).toBe(0);

    await Promise.all([
      service.normalizeBattleState(
        room.id,
        new Date('2026-07-25T10:00:40.000Z'),
      ),
      service.normalizeBattleState(
        room.id,
        new Date('2026-07-25T10:00:40.000Z'),
      ),
    ]);
    await service.normalizeBattleState(
      room.id,
      new Date('2026-07-25T10:00:41.000Z'),
    );

    expect(mock.battleRooms.get(room.id)?.status).toBe(
      BattleRoomStatus.COMPLETED,
    );
    expect(mock.battleProfiles.get(USER_A_ID)?.totalBattles).toBe(1);
    expect(mock.battleRatingLogs.size).toBe(0);
  });

  it('uses the room deadline as the timed-out user completion time', async () => {
    const { mock, service } = createService(BattleMode.AI);
    mock.battleParticipants.delete('participant-b');
    const room = mock.battleRooms.get('room-1')!;
    const startedAt = new Date('2026-07-25T10:00:00.000Z');
    const deadline = new Date('2026-07-25T10:03:00.000Z');
    room.startedAt = startedAt;
    room.expiresAt = deadline;
    room.status = BattleRoomStatus.IN_PROGRESS;
    const participant = mock.battleParticipants.get('participant-a')!;
    participant.status = BattleParticipantStatus.PLAYING;
    participant.submittedAt = null;
    mock.battleAiOpponents.set('ai-opponent-1', {
      id: 'ai-opponent-1',
      battleRoomId: room.id,
      displayName: '电脑对手',
      strategyVersion: AI_STRATEGY_VERSION,
      seed: 'seed',
      answerPlan: {
        strategyVersion: AI_STRATEGY_VERSION,
        questions: [1, 2, 3].map((index) => ({
          battleQuestionSnapshotId: `snapshot-${index}`,
          orderIndex: index - 1,
          plannedCompletedOffsetMs: index * 10_000,
          plannedCorrect: index !== 3,
        })),
      },
      plannedSubmittedOffsetMs: 40_000,
      createdAt: startedAt,
      updatedAt: startedAt,
    });

    await service.normalizeBattleState(room.id, deadline);

    expect(mock.battleParticipants.get(participant.id)).toMatchObject({
      status: BattleParticipantStatus.COMPLETED,
      submittedAt: deadline,
      result: BattleResult.LOSS,
    });
    expect(mock.battleRooms.get(room.id)).toMatchObject({
      status: BattleRoomStatus.COMPLETED,
      endReason: BattleEndReason.EXPIRED,
      winnerUserId: null,
    });
  });

  it('auto-submits timeout participants and settles friend battle without rating change or logs', async () => {
    const { mock, service } = createService(BattleMode.FRIEND);
    const expiresAt = new Date('2026-07-25T10:04:00.000Z');
    const room = mock.battleRooms.get('room-1');

    if (room) {
      room.expiresAt = expiresAt;
      room.skillCode = 'PYTHON';
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
    expect(mock.battleRooms.get('room-1')?.endReason).toBe(
      BattleEndReason.EXPIRED,
    );
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
      service.normalizeBattleState(
        'room-1',
        new Date('2026-07-25T10:04:00.000Z'),
      ),
    ).rejects.toThrow('rating log write failed');

    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.IN_PROGRESS,
    );
    expect(mock.battleParticipants.get('participant-a')?.status).toBe(
      BattleParticipantStatus.SUBMITTED,
    );
    expect(mock.battleProfiles.size).toBe(0);
    expect(mock.battleRatingLogs.size).toBe(0);
    expect(mock.userBattleSkillRatings.size).toBe(0);
  });

  it('settles skill rating while updating profile totals without replacing legacy rating', async () => {
    const { mock, service } = createService(BattleMode.RANKED);
    mock.battleRooms.get('room-1')!.skillCode = 'PYTHON';
    mock.userBattleSkillRatings.set(`${USER_A_ID}:PYTHON`, {
      id: 'skill-a',
      userId: USER_A_ID,
      skillCode: 'PYTHON',
      rating: 1200,
      highestRating: 1300,
      rankedBattles: 3,
      wins: 2,
      losses: 1,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 2,
    });
    mock.userBattleSkillRatings.set(`${USER_B_ID}:PYTHON`, {
      id: 'skill-b',
      userId: USER_B_ID,
      skillCode: 'PYTHON',
      rating: 1000,
      highestRating: 1000,
      rankedBattles: 1,
      wins: 0,
      losses: 1,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
    });

    await service.normalizeBattleState(
      'room-1',
      new Date('2026-07-25T10:04:00.000Z'),
    );

    expect(mock.battleProfiles.get(USER_A_ID)).toMatchObject({
      rating: 1000,
      highestRating: 1000,
      totalBattles: 1,
      rankedBattles: 1,
      draws: 1,
    });
    expect(mock.battleProfiles.get(USER_B_ID)).toMatchObject({
      rating: 1000,
      highestRating: 1000,
      totalBattles: 1,
      rankedBattles: 1,
      draws: 1,
    });
    expect(
      mock.userBattleSkillRatings.get(`${USER_A_ID}:PYTHON`),
    ).toMatchObject({
      rankedBattles: 4,
      highestRating: 1300,
    });
    expect(
      [...mock.battleRatingLogs.values()].every(
        (log) => log.skillCode === 'PYTHON',
      ),
    ).toBe(true);
  });

  it('settles a single-player training room without changing rating or ranked statistics', async () => {
    const { mock, service } = createService(BattleMode.TRAINING);
    mock.battleRooms.get('room-1')!.skillCode = 'PYTHON';
    mock.battleParticipants.delete('participant-b');
    mock.userBattleSkillRatings.set(`${USER_A_ID}:PYTHON`, {
      id: 'skill-a',
      userId: USER_A_ID,
      skillCode: 'PYTHON',
      rating: 1280,
      highestRating: 1320,
      rankedBattles: 4,
      wins: 3,
      losses: 1,
      draws: 0,
      currentWinStreak: 2,
      bestWinStreak: 3,
    });
    mock.battleAnswers.set('answer-a-1', {
      id: 'answer-a-1',
      battleRoomId: 'room-1',
      participantId: 'participant-a',
      battleQuestionSnapshotId: 'snapshot-1',
      userId: USER_A_ID,
      clientRequestId: 'request-a-1',
      answerVersion: 1,
      answerPayload: { type: 'SINGLE_CHOICE', optionId: 'option-b' },
      normalizedAnswer: null,
      isCorrect: false,
      scoreDelta: -1,
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
      result: BattleResult.NONE,
      score: -1,
      wrongCount: 1,
      unansweredCount: 2,
      ratingBefore: 1000,
      ratingDelta: 0,
      ratingAfter: 1000,
    });
    expect(mock.battleProfiles.get(USER_A_ID)).toMatchObject({
      rating: 1000,
      totalBattles: 1,
      rankedBattles: 0,
      friendBattles: 0,
      trainingBattles: 1,
      wins: 0,
      losses: 0,
      draws: 0,
      currentWinStreak: 0,
    });
    expect(
      mock.userBattleSkillRatings.get(`${USER_A_ID}:PYTHON`),
    ).toMatchObject({
      rating: 1280,
      rankedBattles: 4,
      currentWinStreak: 2,
    });
    expect(mock.battleRatingLogs.size).toBe(0);
    expect(mock.battleRooms.get('room-1')).toMatchObject({
      status: BattleRoomStatus.COMPLETED,
      winnerUserId: null,
      endReason: BattleEndReason.NORMAL,
    });
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
      service.normalizeBattleState(
        'room-1',
        new Date('2026-07-25T10:04:00.000Z'),
      ),
      service.normalizeBattleState(
        'room-1',
        new Date('2026-07-25T10:04:00.000Z'),
      ),
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
