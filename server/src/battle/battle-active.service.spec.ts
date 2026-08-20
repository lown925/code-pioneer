import {
  BattleMode,
  BattleParticipantStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleActiveService } from './battle-active.service';

type RecoveryBattle = {
  battleRoomId: string;
  participantStatus: BattleParticipantStatus;
  roomStatus: BattleRoomStatus;
  mode: BattleMode;
  skillCode: string | null;
  skillName: string | null;
  invitationToken: string | null;
  inviteCode: string | null;
  seat: number;
  startedAt: Date | null;
  expiresAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  endReason: null;
};

function createBattle(
  roomStatus: BattleRoomStatus,
  options: Partial<RecoveryBattle> = {},
): RecoveryBattle {
  return {
    battleRoomId: 'battle-1',
    participantStatus: BattleParticipantStatus.PLAYING,
    roomStatus,
    mode: BattleMode.RANKED,
    skillCode: 'PYTHON',
    skillName: 'Python',
    invitationToken: null,
    inviteCode: null,
    seat: 1,
    startedAt: new Date('2026-08-20T08:00:00.000Z'),
    expiresAt: new Date('2026-08-20T08:03:00.000Z'),
    completedAt:
      roomStatus === BattleRoomStatus.COMPLETED
        ? new Date('2026-08-20T08:02:00.000Z')
        : null,
    cancelledAt: null,
    endReason: null,
    ...options,
  };
}

function createService(options?: {
  activeSequence?: Array<RecoveryBattle | null>;
  recentCompleted?: RecoveryBattle | null;
}) {
  const tx = {};
  const prisma = {
    $transaction: jest.fn(async (callback: (client: unknown) => unknown) =>
      callback(tx),
    ),
  };
  const activeSequence = [...(options?.activeSequence ?? [null])];
  const domainService = {
    acquireUserBattleLock: jest.fn(async () => undefined),
    acquireBattleRoomLock: jest.fn(async () => undefined),
    normalizeExpiredFriendRoomsForUser: jest.fn(async () => 0),
    normalizeExpiredRankedMatchRoomsForUser: jest.fn(async () => 0),
    getActiveBattleForUser: jest.fn(
      async () => activeSequence.shift() ?? null,
    ),
    getRecentCompletedBattleForUser: jest.fn(
      async () => options?.recentCompleted ?? null,
    ),
  };
  const roomService = {
    advanceRoomStateIfNeeded: jest.fn(async () => undefined),
  };
  const settlementService = {
    normalizeBattleState: jest.fn(async () => undefined),
  };
  const service = new BattleActiveService(
    prisma as never,
    domainService as never,
    roomService as never,
    settlementService as never,
  );

  return {
    service,
    domainService,
    roomService,
    settlementService,
  };
}

describe('BattleActiveService', () => {
  it.each([BattleRoomStatus.WAITING, BattleRoomStatus.READY])(
    'maps %s ranked rooms to room recovery',
    async (roomStatus) => {
      const battle = createBattle(roomStatus, {
        participantStatus:
          roomStatus === BattleRoomStatus.READY
            ? BattleParticipantStatus.READY
            : BattleParticipantStatus.JOINED,
      });
      const { service } = createService({
        activeSequence: [battle, battle],
      });

      await expect(service.getActiveBattle('user-1')).resolves.toMatchObject({
        data: {
          battleId: battle.battleRoomId,
          recoveryTarget: 'ROOM',
          readOnly: false,
        },
      });
    },
  );

  it.each([
    [BattleMode.RANKED, BattleRoomStatus.COUNTDOWN],
    [BattleMode.FRIEND, BattleRoomStatus.IN_PROGRESS],
    [BattleMode.TRAINING, BattleRoomStatus.IN_PROGRESS],
    [BattleMode.AI, BattleRoomStatus.IN_PROGRESS],
  ])('maps %s %s battles to play recovery', async (mode, roomStatus) => {
    const battle = createBattle(roomStatus, { mode });
    const { service } = createService({
      activeSequence: [battle, battle],
    });

    await expect(service.getActiveBattle('user-1')).resolves.toMatchObject({
      data: {
        mode,
        recoveryTarget: 'PLAY',
        readOnly: false,
      },
    });
  });

  it.each([
    [BattleRoomStatus.IN_PROGRESS, BattleParticipantStatus.SUBMITTED],
    [BattleRoomStatus.SETTLING, BattleParticipantStatus.SUBMITTED],
  ])(
    'restores %s/%s as read-only play',
    async (roomStatus, participantStatus) => {
      const battle = createBattle(roomStatus, { participantStatus });
      const { service } = createService({
        activeSequence: [battle, battle],
      });

      await expect(service.getActiveBattle('user-1')).resolves.toMatchObject({
        data: {
          recoveryTarget: 'PLAY',
          readOnly: true,
        },
      });
    },
  );

  it('returns a recently completed battle as result recovery', async () => {
    const completed = createBattle(BattleRoomStatus.COMPLETED, {
      participantStatus: BattleParticipantStatus.COMPLETED,
      mode: BattleMode.AI,
    });
    const { service } = createService({ recentCompleted: completed });

    await expect(service.getActiveBattle('user-1')).resolves.toMatchObject({
      data: {
        battleId: completed.battleRoomId,
        recoveryTarget: 'RESULT',
        readOnly: true,
      },
    });
  });

  it.each([BattleRoomStatus.EXPIRED, BattleRoomStatus.CANCELLED])(
    'does not expose %s rooms as recoverable',
    async (roomStatus) => {
      const { service } = createService({
        recentCompleted: createBattle(roomStatus),
      });

      await expect(service.getActiveBattle('user-1')).resolves.toEqual({
        success: true,
        data: null,
      });
    },
  );

  it('normalizes ready TTL before deciding that recovery disappeared', async () => {
    const waiting = createBattle(BattleRoomStatus.WAITING, {
      participantStatus: BattleParticipantStatus.JOINED,
    });
    const { service, domainService, roomService, settlementService } =
      createService({ activeSequence: [waiting, null] });

    await expect(service.getActiveBattle('user-1')).resolves.toEqual({
      success: true,
      data: null,
    });
    expect(
      domainService.normalizeExpiredRankedMatchRoomsForUser,
    ).toHaveBeenCalledTimes(1);
    expect(roomService.advanceRoomStateIfNeeded).toHaveBeenCalledWith(
      waiting.battleRoomId,
      expect.any(Date),
      expect.anything(),
    );
    expect(settlementService.normalizeBattleState).toHaveBeenCalledTimes(1);
  });
});
