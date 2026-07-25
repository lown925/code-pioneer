import { ConflictException, GoneException } from '@nestjs/common';
import {
  BattleInvitationStatus,
  BattleMode,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleDomainService } from './battle-domain.service';
import { BattleFriendRoomService } from './battle-friend-room.service';
import { BattleRoomService } from './battle-room.service';
import { createBattlePrismaMock } from './battle-test.helpers';
import { BattleTokenService } from './battle-token.service';

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

const USER_C = {
  id: '33333333-3333-4333-8333-333333333333',
  sessionId: 'session-c',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

describe('BattleFriendRoomService', () => {
  function createService() {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const roomService = new BattleRoomService(mock.prisma as never);
    const tokenService = new BattleTokenService();
    jest
      .spyOn(tokenService, 'generateInvitationToken')
      .mockReturnValueOnce('safe-token-one')
      .mockReturnValueOnce('safe-token-two')
      .mockReturnValue('safe-token-next');

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
    mock.users.set(USER_C.id, {
      id: USER_C.id,
      battleRating: 980,
      nickname: 'Third',
      avatarUrl: 'https://cdn.example.com/third.png',
    });

    const service = new BattleFriendRoomService(
      mock.prisma as never,
      domainService,
      tokenService,
      roomService,
    );

    return { mock, service, tokenService };
  }

  it('creates a friend room, seat 1 participant, and active invitation token', async () => {
    const { mock, service } = createService();

    const result = await service.createFriendRoom(USER_A);

    expect(result.data.mode).toBe(BattleMode.FRIEND);
    expect(result.data.status).toBe(BattleRoomStatus.WAITING);
    expect(result.data.invitationToken).toBe('safe-token-one');
    expect(result.data.sharePath).toContain('safe-token-one');
    expect(mock.battleRooms.size).toBe(1);
    expect(mock.battleParticipants.size).toBe(1);
    expect([...mock.battleParticipants.values()][0].seat).toBe(1);
    expect([...mock.battleInvitations.values()][0].status).toBe(
      BattleInvitationStatus.ACTIVE,
    );
  });

  it('rejects friend room creation when the user is already matching', async () => {
    const { mock, service } = createService();

    mock.battleQueues.set(USER_A.id, {
      id: 'queue-a',
      userId: USER_A.id,
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
    });

    await expect(service.createFriendRoom(USER_A)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('previews a valid friend room and allows joining by a different user', async () => {
    const { service } = createService();
    const created = await service.createFriendRoom(USER_A);

    const preview = await service.previewFriendRoom(
      USER_B,
      created.data.invitationToken,
    );

    expect(preview.data.canJoin).toBe(true);
    expect(preview.data.inviter.userId).toBe(USER_A.id);
    expect(preview.data.participantCount).toBe(1);
  });

  it('returns canJoin=false when the inviter previews their own invitation', async () => {
    const { service } = createService();
    const created = await service.createFriendRoom(USER_A);

    const preview = await service.previewFriendRoom(
      USER_A,
      created.data.invitationToken,
    );

    expect(preview.data.canJoin).toBe(false);
    expect(preview.data.cannotJoinReason).toBe('BATTLE_CANNOT_INVITE_SELF');
  });

  it('joins a friend room as seat 2 and marks the invitation ACCEPTED', async () => {
    const { mock, service } = createService();
    const created = await service.createFriendRoom(USER_A);

    const result = await service.joinFriendRoom(
      USER_B,
      created.data.invitationToken,
    );

    expect(result.data.status).toBe(BattleRoomStatus.WAITING);
    expect(result.data.participants.map((item) => item.seat).sort()).toEqual([
      1, 2,
    ]);
    expect([...mock.battleInvitations.values()][0].status).toBe(
      BattleInvitationStatus.ACCEPTED,
    );
    expect([...mock.battleInvitations.values()][0].inviteeUserId).toBe(
      USER_B.id,
    );
  });

  it('returns the current room idempotently when the same guest joins twice', async () => {
    const { service } = createService();
    const created = await service.createFriendRoom(USER_A);

    const first = await service.joinFriendRoom(
      USER_B,
      created.data.invitationToken,
    );
    const second = await service.joinFriendRoom(
      USER_B,
      created.data.invitationToken,
    );

    expect(first.data.battleId).toBe(second.data.battleId);
    expect(second.data.participants).toHaveLength(2);
  });

  it('returns the current room when the inviter opens their own invitation link', async () => {
    const { service } = createService();
    const created = await service.createFriendRoom(USER_A);

    const result = await service.joinFriendRoom(
      USER_A,
      created.data.invitationToken,
    );

    expect(result.data.battleId).toBe(created.data.battleId);
    expect(result.data.participants).toEqual([
      expect.objectContaining({
        userId: USER_A.id,
        seat: 1,
      }),
    ]);
  });

  it('prevents a third user from joining an accepted room', async () => {
    const { service } = createService();
    const created = await service.createFriendRoom(USER_A);
    await service.joinFriendRoom(USER_B, created.data.invitationToken);

    await expect(
      service.joinFriendRoom(USER_C, created.data.invitationToken),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('expires stale invitations lazily and blocks joining them', async () => {
    const { mock, service } = createService();
    const created = await service.createFriendRoom(USER_A);
    const invitation = [...mock.battleInvitations.values()][0];

    invitation.expiresAt = new Date(Date.now() - 1000);
    mock.battleInvitations.set(invitation.id, invitation);

    const preview = await service.previewFriendRoom(
      USER_B,
      created.data.invitationToken,
    );

    expect(preview.data.invitationStatus).toBe(BattleInvitationStatus.EXPIRED);
    await expect(
      service.joinFriendRoom(USER_B, created.data.invitationToken),
    ).rejects.toBeInstanceOf(GoneException);
  });

  it('rejects guests who are already searching when previewing or joining', async () => {
    const { mock, service } = createService();
    const created = await service.createFriendRoom(USER_A);

    mock.battleQueues.set(USER_B.id, {
      id: 'queue-b',
      userId: USER_B.id,
      status: 'SEARCHING',
      ratingSnapshot: 1020,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 120000),
    });

    const preview = await service.previewFriendRoom(
      USER_B,
      created.data.invitationToken,
    );
    expect(preview.data.canJoin).toBe(false);
    expect(preview.data.cannotJoinReason).toBe('BATTLE_ALREADY_MATCHING');

    await expect(
      service.joinFriendRoom(USER_B, created.data.invitationToken),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('handles seat 2 contention by allowing only one user to join', async () => {
    const { service } = createService();
    const created = await service.createFriendRoom(USER_A);

    const first = await service.joinFriendRoom(
      USER_B,
      created.data.invitationToken,
    );
    await expect(
      service.joinFriendRoom(USER_C, created.data.invitationToken),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(first.data.participants).toHaveLength(2);
  });

  it('retries on invitation token collision and keeps tokens URL-safe', async () => {
    const { mock, service } = createService();

    mock.battleInvitations.set('existing', {
      id: 'existing',
      battleRoomId: 'room-existing',
      inviterUserId: USER_C.id,
      inviteeUserId: null,
      token: 'safe-token-one',
      status: BattleInvitationStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 600000),
      acceptedAt: null,
      cancelledAt: null,
    });

    const result = await service.createFriendRoom(USER_A);

    expect(result.data.invitationToken).toBe('safe-token-two');
    expect(/^[A-Za-z0-9_-]+$/.test(result.data.invitationToken)).toBe(true);
  });
});
