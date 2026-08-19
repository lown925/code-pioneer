import { ForbiddenException } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { createBattlePrismaMock } from './battle-test.helpers';
import { BattleDomainService } from './battle-domain.service';
import { BattleRoomService } from './battle-room.service';

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

describe('BattleRoomService', () => {
  function createService() {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const service = new BattleRoomService(mock.prisma as never, domainService);

    mock.users.set(USER_A.id, {
      id: USER_A.id,
      battleRating: 1000,
      nickname: 'Host',
      avatarUrl: 'https://cdn.example.com/host.png',
    });
    mock.users.set(USER_B.id, {
      id: USER_B.id,
      battleRating: 1020,
      nickname: 'Guest',
      avatarUrl: 'https://cdn.example.com/guest.png',
    });
    mock.battleRooms.set('room-1', {
      id: 'room-1',
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
      battleRoomId: 'room-1',
      userId: USER_A.id,
      seat: 1,
      status: BattleParticipantStatus.JOINED,
      result: BattleResult.NONE,
      joinedAt: new Date('2026-07-25T10:00:00.000Z'),
    });
    mock.battleParticipants.set('participant-b', {
      id: 'participant-b',
      battleRoomId: 'room-1',
      userId: USER_B.id,
      seat: 2,
      status: BattleParticipantStatus.JOINED,
      result: BattleResult.NONE,
      joinedAt: new Date('2026-07-25T10:00:01.000Z'),
    });

    return { mock, service };
  }

  it('returns room summaries for participants only', async () => {
    const { service } = createService();

    const result = await service.getBattleRoom(USER_A, 'room-1');

    expect(result.data.battleId).toBe('room-1');
    expect(result.data.participants).toEqual([
      {
        userId: USER_A.id,
        nickname: 'Host',
        avatarUrl: 'https://cdn.example.com/host.png',
        seat: 1,
        status: BattleParticipantStatus.JOINED,
      },
      {
        userId: USER_B.id,
        nickname: 'Guest',
        avatarUrl: 'https://cdn.example.com/guest.png',
        seat: 2,
        status: BattleParticipantStatus.JOINED,
      },
    ]);
  });

  it('rejects non-participants', async () => {
    const { service } = createService();

    await expect(
      service.getBattleRoom(
        {
          id: '33333333-3333-4333-8333-333333333333',
          sessionId: 'session-c',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        'room-1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('normalizes an expired friend room during room polling', async () => {
    const { mock } = createService();
    const domainService = new BattleDomainService(mock.prisma as never);
    const service = new BattleRoomService(mock.prisma as never, domainService);

    const room = mock.battleRooms.get('room-1')!;
    room.expiresAt = new Date(Date.now() - 1000);
    mock.battleRooms.set(room.id, room);

    const result = await service.getBattleRoom(USER_A, 'room-1');

    expect(result.data.status).toBe(BattleRoomStatus.EXPIRED);
    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.EXPIRED,
    );
  });

  it('normalizes an expired ranked ready room during room polling', async () => {
    const { mock, service } = createService();
    const room = mock.battleRooms.get('room-1')!;
    room.mode = BattleMode.RANKED;
    room.status = BattleRoomStatus.READY;
    room.expiresAt = new Date(Date.now() - 1000);
    mock.battleRooms.set(room.id, room);

    const result = await service.getBattleRoom(USER_A, 'room-1');

    expect(result.data.status).toBe(BattleRoomStatus.EXPIRED);
    expect(mock.battleRooms.get('room-1')?.endReason).toBe('EXPIRED');
    expect(mock.battleQuestionSnapshots.size).toBe(0);
    expect(mock.battleRatingLogs.size).toBe(0);
  });
});
