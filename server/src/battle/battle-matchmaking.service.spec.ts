/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConflictException } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleDomainService } from './battle-domain.service';
import {
  AI_UNLOCK_SECONDS,
  MATCHMAKING_TTL_SECONDS,
  RANKED_MATCH_READY_TTL_SECONDS,
} from './battle.constants';
import { createBattlePrismaMock } from './battle-test.helpers';
import { BattleMatchmakingService } from './battle-matchmaking.service';

const USER_A = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: 'session-a',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const USER_B = {
  id: '22222222-2222-4222-8222-222222222222',
  sessionId: 'session-b',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

describe('BattleMatchmakingService', () => {
  function createService() {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const skillRatings = new Map<string, { rating: number }>();
    const skillService = {
      assertAvailableSkill: jest.fn(async (skill: string) => ({
        code: skill,
        name: skill === 'PYTHON' ? 'Python' : skill,
      })),
      ensureUserSkillRating: jest.fn(async (userId: string) => {
        const existing = skillRatings.get(userId);

        if (existing) {
          return existing;
        }

        const rating = { rating: 1000 };
        skillRatings.set(userId, rating);
        return rating;
      }),
    };
    const service = new BattleMatchmakingService(
      mock.prisma as never,
      domainService,
      skillService as never,
    );

    mock.users.set(USER_A.id, {
      id: USER_A.id,
      battleRating: 1000,
      nickname: 'User A',
    });
    mock.users.set(USER_B.id, {
      id: USER_B.id,
      battleRating: 1040,
      nickname: 'User B',
    });

    return { mock, service, skillService, skillRatings };
  }

  it('creates a SEARCHING queue on first join', async () => {
    const { mock, service, skillService } = createService();

    const result = await service.joinMatchmaking(USER_A);

    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        status: 'SEARCHING',
        battleId: null,
        waitingCount: 1,
      }),
    });
    expect(mock.battleQueues.get(USER_A.id)?.status).toBe('SEARCHING');
    expect(mock.battleQueues.get(USER_A.id)?.skillCode).toBe('PYTHON');
    const queue = mock.battleQueues.get(USER_A.id)!;
    expect(queue.expiresAt!.getTime() - queue.searchStartedAt!.getTime()).toBe(
      MATCHMAKING_TTL_SECONDS * 1000,
    );
    expect(result.data.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.data.remainingSearchMs).toBeGreaterThan(0);
    expect(result.data.aiAvailable).toBe(false);
    expect(skillService.ensureUserSkillRating).toHaveBeenCalledTimes(1);
  });

  it('matches users across professional tracks and persists each queue track', async () => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const trackService = {
      normalize: jest.fn((trackKey?: string) => trackKey ?? 'big-data'),
      getRating: jest.fn(async () => null),
      ensureRating: jest.fn(),
    };
    const skillService = {
      assertAvailableSkill: jest.fn(async () => ({
        code: 'PYTHON',
        name: 'Python',
      })),
    };
    const service = new BattleMatchmakingService(
      mock.prisma as never,
      domainService,
      skillService as never,
      trackService as never,
    );

    const first = await service.joinMatchmaking(USER_A, 'PYTHON', 'big-data');
    const isolated = await service.joinMatchmaking(
      USER_B,
      'PYTHON',
      'computer-science',
    );

    expect(first.data.status).toBe('SEARCHING');
    expect(isolated.data.status).toBe('MATCHED');
    expect(mock.battleRooms.size).toBe(1);
    expect(mock.battleQueues.get(USER_A.id)?.professionalTrackKey).toBe(
      'big-data',
    );
    expect(trackService.getRating).toHaveBeenCalledWith(
      USER_A.id,
      'big-data',
      expect.anything(),
    );
    expect(trackService.ensureRating).not.toHaveBeenCalled();
    expect(mock.battleQueues.get(USER_B.id)?.professionalTrackKey).toBe(
      'computer-science',
    );
    expect(
      [...mock.battleParticipants.values()].find((participant) => participant.userId === USER_A.id)
        ?.professionalTrackKey,
    ).toBe('big-data');
    expect(
      [...mock.battleParticipants.values()].find((participant) => participant.userId === USER_B.id)
        ?.professionalTrackKey,
    ).toBe('computer-science');
    expect([...mock.battleRooms.values()][0]?.professionalTrackKey).toBe('computer-science');
  });

  it.each([
    ['big-data', 'software-engineering'],
    ['computer-science', 'big-data'],
  ])('matches cross-track pair %s + %s', async (firstTrack, secondTrack) => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const trackService = {
      normalize: jest.fn((trackKey?: string) => trackKey ?? 'big-data'),
      getRating: jest.fn(async () => null),
      ensureRating: jest.fn(),
    };
    const skillService = {
      assertAvailableSkill: jest.fn(async () => ({ code: 'PYTHON', name: 'Python' })),
    };
    const service = new BattleMatchmakingService(
      mock.prisma as never,
      domainService,
      skillService as never,
      trackService as never,
    );

    await service.joinMatchmaking(USER_A, 'PYTHON', firstTrack);
    const result = await service.joinMatchmaking(USER_B, 'PYTHON', secondTrack);

    expect(result.data.status).toBe('MATCHED');
    expect(mock.battleRooms.size).toBe(1);
  });

  it('does not create a room when a legacy searching queue has no track', async () => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const trackService = {
      normalize: jest.fn((trackKey?: string) => trackKey ?? 'big-data'),
      getRating: jest.fn(async () => null),
      ensureRating: jest.fn(),
    };
    const skillService = {
      assertAvailableSkill: jest.fn(async () => ({ code: 'PYTHON', name: 'Python' })),
    };
    const service = new BattleMatchmakingService(
      mock.prisma as never,
      domainService,
      skillService as never,
      trackService as never,
    );

    mock.battleQueues.set(USER_A.id, {
      id: 'queue-a',
      userId: USER_A.id,
      skillCode: 'PYTHON',
      professionalTrackKey: null,
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
    });

    const result = await service.joinMatchmaking(USER_A, 'PYTHON', 'big-data');

    expect(result.data.status).toBe('SEARCHING');
    expect(mock.battleRooms.size).toBe(0);
  });

  it('counts unexpired queues from every valid track in the unified pool', async () => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const trackService = {
      normalize: jest.fn((trackKey?: string) => trackKey ?? 'big-data'),
      getRating: jest.fn(async () => null),
      ensureRating: jest.fn(),
    };
    const skillService = {
      assertAvailableSkill: jest.fn(async () => ({ code: 'PYTHON', name: 'Python' })),
    };
    const service = new BattleMatchmakingService(
      mock.prisma as never,
      domainService,
      skillService as never,
      trackService as never,
    );

    const now = Date.now();
    for (const [userId, professionalTrackKey] of [
      [USER_B.id, 'software-engineering'],
      ['33333333-3333-4333-8333-333333333333', 'computer-science'],
    ] as const) {
      mock.battleQueues.set(userId, {
        id: `queue-${userId}`,
        userId,
        skillCode: 'PYTHON',
        professionalTrackKey,
        status: 'SEARCHING',
        ratingSnapshot: 1000,
        matchedBattleRoomId: null,
        searchStartedAt: new Date(now - 5000),
        matchedAt: null,
        cancelledAt: null,
        expiresAt: new Date(now + 120000),
      });
    }

    const result = await service.getMatchmakingStatus(USER_A, 'PYTHON', 'big-data');

    expect(result.data.waitingCount).toBe(2);
  });

  it('unlocks AI from server time after two minutes without expiring the queue', async () => {
    const { mock, service } = createService();
    const now = Date.now();
    mock.battleQueues.set(USER_A.id, {
      id: 'queue-a',
      userId: USER_A.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - AI_UNLOCK_SECONDS * 1000 - 5000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now + 10 * 60 * 1000),
      updatedAt: new Date(now - 30000),
    });

    const result = await service.getMatchmakingStatus(USER_A, 'PYTHON');

    expect(result.data.status).toBe('SEARCHING');
    expect(result.data.elapsedMs).toBeGreaterThanOrEqual(
      AI_UNLOCK_SECONDS * 1000,
    );
    expect(result.data.remainingSearchMs).toBeGreaterThan(0);
    expect(result.data.aiAvailable).toBe(true);
  });

  it('returns SEARCHING idempotently for repeated join', async () => {
    const { mock, service, skillRatings } = createService();

    await service.joinMatchmaking(USER_A);
    const result = await service.joinMatchmaking(USER_A);

    expect(result.data.status).toBe('SEARCHING');
    expect(mock.battleQueues.size).toBe(1);
    expect(skillRatings.size).toBe(1);
  });

  it('uses the selected skill rating for the queue snapshot', async () => {
    const { mock, service, skillService } = createService();
    skillService.ensureUserSkillRating.mockResolvedValueOnce({ rating: 1280 });

    await service.joinMatchmaking(USER_A, 'PYTHON');

    expect(mock.battleQueues.get(USER_A.id)?.ratingSnapshot).toBe(1280);
  });

  it('returns MATCHED when the current queue already points to an active room', async () => {
    const { mock, service } = createService();

    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.WAITING,
      questionCount: 20,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A.id,
      expiresAt: null,
      endReason: null,
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
      startedAt: null,
    });
    mock.battleQueues.set(USER_A.id, {
      id: 'queue-1',
      userId: USER_A.id,
      status: 'MATCHED',
      ratingSnapshot: 1000,
      matchedBattleRoomId: 'room-1',
      searchStartedAt: new Date('2026-07-25T10:00:00.000Z'),
      matchedAt: new Date('2026-07-25T10:00:10.000Z'),
      cancelledAt: null,
      expiresAt: new Date('2026-07-25T10:02:00.000Z'),
    });

    const result = await service.joinMatchmaking(USER_A);

    expect(result.data.status).toBe('MATCHED');
    expect(result.data.battleId).toBe('room-1');
  });

  it('preserves the locked professional track when recovering an active queue', async () => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const trackService = {
      normalize: jest.fn((trackKey?: string) => trackKey ?? 'big-data'),
      getRating: jest.fn(async () => null),
      ensureRating: jest.fn(),
    };
    const skillService = {
      assertAvailableSkill: jest.fn(async () => ({
        code: 'PYTHON',
        name: 'Python',
      })),
    };
    const service = new BattleMatchmakingService(
      mock.prisma as never,
      domainService,
      skillService as never,
      trackService as never,
    );

    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.WAITING,
      professionalTrackKey: 'big-data',
      questionCount: 20,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A.id,
      expiresAt: null,
      endReason: null,
      createdAt: new Date(),
      startedAt: null,
    });
    mock.battleQueues.set(USER_A.id, {
      id: 'queue-1',
      userId: USER_A.id,
      skillCode: 'PYTHON',
      professionalTrackKey: 'big-data',
      status: 'MATCHED',
      ratingSnapshot: 1000,
      matchedBattleRoomId: 'room-1',
      searchStartedAt: new Date(),
      matchedAt: new Date(),
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
    });

    const result = await service.joinMatchmaking(
      USER_A,
      'PYTHON',
      'computer-science',
    );

    expect(result.data.status).toBe('MATCHED');
    expect(result.data.battleId).toBe('room-1');
    expect(result.data.professionalTrackKey).toBe('big-data');
  });

  it('rejects join when the user is already in an active friend room', async () => {
    const { mock, service } = createService();

    mock.battleRooms.set('friend-room', {
      id: 'friend-room',
      mode: BattleMode.FRIEND,
      status: BattleRoomStatus.WAITING,
      questionCount: 20,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A.id,
      expiresAt: null,
      endReason: null,
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
      startedAt: null,
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'friend-room',
      userId: USER_A.id,
      seat: 1,
      status: BattleParticipantStatus.JOINED,
      result: 'NONE',
      joinedAt: new Date('2026-07-25T10:00:00.000Z'),
    });

    await expect(service.joinMatchmaking(USER_A)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('normalizes an expired friend room before allowing matchmaking', async () => {
    const { mock, service } = createService();

    mock.battleRooms.set('stale-friend-room', {
      id: 'stale-friend-room',
      mode: BattleMode.FRIEND,
      status: BattleRoomStatus.WAITING,
      questionCount: 20,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A.id,
      expiresAt: new Date(Date.now() - 1000),
      endReason: 'EXPIRED',
      startedAt: null,
      createdAt: new Date(),
    });
    mock.battleParticipants.set('stale-participant', {
      id: 'stale-participant',
      battleRoomId: 'stale-friend-room',
      userId: USER_A.id,
      seat: 1,
      status: BattleParticipantStatus.JOINED,
      result: 'NONE',
      joinedAt: new Date(),
    });

    const result = await service.joinMatchmaking(USER_A);

    expect(result.data.status).toBe('SEARCHING');
    expect(mock.battleRooms.get('stale-friend-room')?.status).toBe(
      BattleRoomStatus.EXPIRED,
    );
  });

  it('does not match users outside the initial rating range', async () => {
    const { mock, service } = createService();

    mock.battleQueues.set(USER_B.id, {
      id: 'queue-b',
      userId: USER_B.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1300,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
    });

    const result = await service.joinMatchmaking(USER_A);

    expect(result.data.status).toBe('SEARCHING');
    expect(mock.battleRooms.size).toBe(0);
  });

  it('expands allowed range based on waiting time and matches eligible users', async () => {
    const { mock, service } = createService();
    const now = new Date();

    mock.battleQueues.set(USER_B.id, {
      id: 'queue-b',
      userId: USER_B.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1250,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now.getTime() - 40000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now.getTime() + 120000),
    });

    const result = await service.joinMatchmaking(USER_A);

    expect(result.data.status).toBe('MATCHED');
    expect(mock.battleRooms.size).toBe(1);
    const participants = [...mock.battleParticipants.values()];
    expect(participants).toHaveLength(2);
    expect(participants.map((item) => item.seat).sort()).toEqual([1, 2]);
  });

  it('marks both queues as MATCHED and creates a ranked waiting room after a successful match', async () => {
    const { mock, service } = createService();

    mock.battleQueues.set(USER_B.id, {
      id: 'queue-b',
      userId: USER_B.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1040,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(Date.now() - 5000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
    });

    const result = await service.joinMatchmaking(USER_A);

    expect(result.data.status).toBe('MATCHED');
    const createdRoom = [...mock.battleRooms.values()][0];
    expect(createdRoom.mode).toBe(BattleMode.RANKED);
    expect(createdRoom.skillCode).toBe('PYTHON');
    expect(createdRoom.status).toBe(BattleRoomStatus.WAITING);
    expect(createdRoom.expiresAt).toBeInstanceOf(Date);
    expect(
      createdRoom.expiresAt!.getTime() - createdRoom.createdAt.getTime(),
    ).toBeLessThanOrEqual(RANKED_MATCH_READY_TTL_SECONDS * 1000);
    expect(createdRoom.expiresAt!.getTime()).toBeGreaterThan(
      createdRoom.createdAt.getTime(),
    );
    expect(mock.battleQueues.get(USER_A.id)?.status).toBe('MATCHED');
    expect(mock.battleQueues.get(USER_B.id)?.status).toBe('MATCHED');
  });

  it('matches an eligible queue even when its heartbeat is stale', async () => {
    const { mock, service } = createService();
    const now = Date.now();
    mock.battleQueues.set(USER_B.id, {
      id: 'queue-b',
      userId: USER_B.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1040,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 30000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now + 10 * 60 * 1000),
      updatedAt: new Date(now - 5 * 60 * 1000),
    });

    const result = await service.joinMatchmaking(USER_A, 'PYTHON');

    expect(result.data.status).toBe('MATCHED');
    expect(mock.battleQueues.get(USER_B.id)?.status).toBe('MATCHED');
  });

  it('never matches queues from different skills even after the rating window expands', async () => {
    const { mock, service } = createService();
    const now = new Date();

    mock.battleQueues.set(USER_B.id, {
      id: 'queue-b',
      userId: USER_B.id,
      skillCode: 'JAVASCRIPT',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now.getTime() - 120000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now.getTime() + 120000),
    });

    const result = await service.joinMatchmaking(USER_A, 'PYTHON');

    expect(result.data.status).toBe('SEARCHING');
    expect(mock.battleRooms.size).toBe(0);
    expect(mock.battleQueues.get(USER_B.id)?.status).toBe('SEARCHING');
  });

  it('returns IDLE when status is queried without any queue record', async () => {
    const { service } = createService();

    const result = await service.getMatchmakingStatus(USER_A);

    expect(result.data.status).toBe('IDLE');
  });

  it('counts all unexpired SEARCHING queues regardless of heartbeat freshness', async () => {
    const { mock, service } = createService();
    const now = Date.now();
    mock.battleQueues.set(USER_B.id, {
      id: 'queue-b',
      userId: USER_B.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1040,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 5000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now + 120000),
      updatedAt: new Date(now - 1000),
    });
    mock.battleQueues.set('expired-user', {
      id: 'queue-expired',
      userId: 'expired-user',
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 200000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now - 1000),
      updatedAt: new Date(now - 1000),
    });
    mock.battleQueues.set('cancelled-user', {
      id: 'queue-cancelled',
      userId: 'cancelled-user',
      skillCode: 'PYTHON',
      status: 'CANCELLED',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 10000),
      matchedAt: null,
      cancelledAt: new Date(now - 5000),
      expiresAt: new Date(now + 120000),
      updatedAt: new Date(now - 1000),
    });
    mock.battleQueues.set('matched-user', {
      id: 'queue-matched',
      userId: 'matched-user',
      skillCode: 'PYTHON',
      status: 'MATCHED',
      ratingSnapshot: 1000,
      matchedBattleRoomId: 'matched-room',
      searchStartedAt: new Date(now - 10000),
      matchedAt: new Date(now - 1000),
      cancelledAt: null,
      expiresAt: new Date(now + 120000),
      updatedAt: new Date(now - 1000),
    });
    mock.battleQueues.set('stale-heartbeat-user', {
      id: 'queue-stale-heartbeat',
      userId: 'stale-heartbeat-user',
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 30000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now + 120000),
      updatedAt: new Date(now - 20000),
    });
    mock.battleQueues.set('javascript-user', {
      id: 'queue-javascript',
      userId: 'javascript-user',
      skillCode: 'JAVASCRIPT',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 5000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now + 120000),
      updatedAt: new Date(now - 1000),
    });
    mock.battleQueues.set('legacy-user', {
      id: 'queue-legacy',
      userId: 'legacy-user',
      skillCode: null,
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 5000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now + 120000),
      updatedAt: new Date(now - 1000),
    });

    const result = await service.getMatchmakingStatus(USER_A);

    expect(result.data.status).toBe('IDLE');
    expect(result.data.waitingCount).toBe(2);

    const javascriptResult = await service.getMatchmakingStatus(
      USER_A,
      'JAVASCRIPT',
    );

    expect(javascriptResult.data.status).toBe('IDLE');
    expect(javascriptResult.data.waitingCount).toBe(1);
  });

  it('uses status polling as a heartbeat without creating duplicate queues', async () => {
    const { mock, service } = createService();
    const staleHeartbeat = new Date(Date.now() - 20000);
    mock.battleQueues.set(USER_A.id, {
      id: 'queue-a',
      userId: USER_A.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(Date.now() - 30000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
      updatedAt: staleHeartbeat,
    });

    const first = await service.getMatchmakingStatus(USER_A, 'PYTHON');
    const second = await service.getMatchmakingStatus(USER_A, 'PYTHON');

    expect(first.data.status).toBe('SEARCHING');
    expect(second.data.status).toBe('SEARCHING');
    expect(second.data.waitingCount).toBe(1);
    expect(mock.battleQueues.size).toBe(1);
    expect(
      mock.battleQueues.get(USER_A.id)?.updatedAt?.getTime(),
    ).toBeGreaterThan(staleHeartbeat.getTime());
  });

  it('expires stale SEARCHING queues lazily through the status endpoint', async () => {
    const { mock, service } = createService();

    mock.battleQueues.set(USER_A.id, {
      id: 'queue-a',
      userId: USER_A.id,
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(Date.now() - 200000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });

    const result = await service.getMatchmakingStatus(USER_A);

    expect(result.data.status).toBe('EXPIRED');
    expect(mock.battleQueues.get(USER_A.id)?.status).toBe('EXPIRED');
    expect(result.data.remainingSearchMs).toBe(0);
    expect(result.data.aiAvailable).toBe(true);
  });

  it('expires an unmatched ranked room after the ready deadline and releases both queues', async () => {
    const { mock, service } = createService();
    const expiredAt = new Date(Date.now() - 1000);
    mock.battleRooms.set('ranked-ready-expired', {
      id: 'ranked-ready-expired',
      mode: BattleMode.RANKED,
      skillCode: 'PYTHON',
      status: BattleRoomStatus.READY,
      questionCount: 20,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A.id,
      expiresAt: expiredAt,
      endReason: null,
      createdAt: new Date(expiredAt.getTime() - 45000),
      startedAt: null,
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'ranked-ready-expired',
      userId: USER_A.id,
      seat: 1,
      status: BattleParticipantStatus.READY,
      result: 'NONE',
      joinedAt: new Date(),
    });
    mock.battleParticipants.set('participant-b', {
      id: 'participant-b',
      battleRoomId: 'ranked-ready-expired',
      userId: USER_B.id,
      seat: 2,
      status: BattleParticipantStatus.JOINED,
      result: 'NONE',
      joinedAt: new Date(),
    });
    for (const user of [USER_A, USER_B]) {
      mock.battleQueues.set(user.id, {
        id: `queue-${user.id}`,
        userId: user.id,
        skillCode: 'PYTHON',
        status: 'MATCHED',
        ratingSnapshot: 1000,
        matchedBattleRoomId: 'ranked-ready-expired',
        searchStartedAt: new Date(Date.now() - 60000),
        matchedAt: new Date(Date.now() - 46000),
        cancelledAt: null,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000),
      });
    }

    const result = await service.getMatchmakingStatus(USER_A, 'PYTHON');

    expect(result.data.status).toBe('CANCELLED');
    expect(mock.battleRooms.get('ranked-ready-expired')?.status).toBe(
      BattleRoomStatus.EXPIRED,
    );
    expect(mock.battleRooms.get('ranked-ready-expired')?.endReason).toBe(
      'EXPIRED',
    );
    expect(mock.battleQueues.get(USER_A.id)?.status).toBe('CANCELLED');
    expect(mock.battleQueues.get(USER_B.id)?.status).toBe('CANCELLED');
    expect(mock.battleQueues.get(USER_A.id)?.matchedBattleRoomId).toBeNull();
    expect(mock.battleQueues.get(USER_B.id)?.matchedBattleRoomId).toBeNull();
    expect(mock.battleProfiles.size).toBe(0);
    expect(mock.battleRatingLogs.size).toBe(0);
  });

  it('cancels SEARCHING queues successfully and remains idempotent on repeated cancel', async () => {
    const { mock, service } = createService();
    await service.joinMatchmaking(USER_A);

    const first = await service.cancelMatchmaking(USER_A);
    const second = await service.cancelMatchmaking(USER_A);

    expect(first.data.status).toBe('CANCELLED');
    expect(second.data.status).toBe('CANCELLED');
    expect(mock.battleQueues.get(USER_A.id)?.status).toBe('CANCELLED');
  });

  it('does not allow cancelling an already started matched room', async () => {
    const { mock, service } = createService();

    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.IN_PROGRESS,
      questionCount: 20,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A.id,
      expiresAt: new Date(Date.now() + 60000),
      endReason: null,
      createdAt: new Date(),
      startedAt: new Date(Date.now() - 1000),
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A.id,
      seat: 1,
      status: BattleParticipantStatus.PLAYING,
      result: 'NONE',
      joinedAt: new Date(),
    });
    mock.battleQueues.set(USER_A.id, {
      id: 'queue-1',
      userId: USER_A.id,
      status: 'MATCHED',
      ratingSnapshot: 1000,
      matchedBattleRoomId: 'room-1',
      searchStartedAt: new Date(),
      matchedAt: new Date(),
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
    });

    await expect(service.cancelMatchmaking(USER_A)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('releases a matched waiting ranked room so the user can create a friend room immediately', async () => {
    const { mock, service } = createService();

    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.WAITING,
      questionCount: 20,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A.id,
      expiresAt: null,
      endReason: null,
      createdAt: new Date(),
      startedAt: null,
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A.id,
      seat: 1,
      status: BattleParticipantStatus.JOINED,
      result: 'NONE',
      joinedAt: new Date(),
    });
    mock.battleQueues.set(USER_A.id, {
      id: 'queue-1',
      userId: USER_A.id,
      status: 'MATCHED',
      ratingSnapshot: 1000,
      matchedBattleRoomId: 'room-1',
      searchStartedAt: new Date(),
      matchedAt: new Date(),
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
    });

    const result = await service.cancelMatchmaking(USER_A);

    expect(result.data.status).toBe('CANCELLED');
    expect(mock.battleQueues.get(USER_A.id)?.status).toBe('CANCELLED');
    expect(mock.battleQueues.get(USER_A.id)?.matchedBattleRoomId).toBeNull();
    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.CANCELLED,
    );
  });
});
