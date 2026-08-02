/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConflictException } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleDomainService } from './battle-domain.service';
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
    const service = new BattleMatchmakingService(
      mock.prisma as never,
      domainService,
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

    return { mock, service };
  }

  it('creates a SEARCHING queue on first join', async () => {
    const { mock, service } = createService();

    const result = await service.joinMatchmaking(USER_A);

    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        status: 'SEARCHING',
        battleId: null,
      }),
    });
    expect(mock.battleQueues.get(USER_A.id)?.status).toBe('SEARCHING');
  });

  it('returns SEARCHING idempotently for repeated join', async () => {
    const { mock, service } = createService();

    await service.joinMatchmaking(USER_A);
    const result = await service.joinMatchmaking(USER_A);

    expect(result.data.status).toBe('SEARCHING');
    expect(mock.battleQueues.size).toBe(1);
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

  it('does not match users outside the initial rating range', async () => {
    const { mock, service } = createService();

    mock.battleQueues.set(USER_B.id, {
      id: 'queue-b',
      userId: USER_B.id,
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
    expect(createdRoom.status).toBe(BattleRoomStatus.WAITING);
    expect(mock.battleQueues.get(USER_A.id)?.status).toBe('MATCHED');
    expect(mock.battleQueues.get(USER_B.id)?.status).toBe('MATCHED');
  });

  it('returns IDLE when status is queried without any queue record', async () => {
    const { service } = createService();

    const result = await service.getMatchmakingStatus(USER_A);

    expect(result.data.status).toBe('IDLE');
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
