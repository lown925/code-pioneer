/* eslint-disable @typescript-eslint/require-await */
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  BattleMatchQueueStatus,
  BattleMode,
  BattleParticipantStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleDomainService } from './battle-domain.service';

type UserRecord = {
  id: string;
  battleRating: number;
};

type BattleProfileRecord = {
  id: string;
  userId: string;
  rating: number;
  highestRating: number;
};

function createPrismaMock() {
  const users = new Map<string, UserRecord>();
  const battleProfiles = new Map<string, BattleProfileRecord>();
  const battleQueues = new Map<
    string,
    {
      userId: string;
      status: BattleMatchQueueStatus;
    }
  >();
  const activeParticipants = new Map<
    string,
    {
      battleRoomId: string;
      status: BattleParticipantStatus;
      seat: number;
      battleRoom: {
        mode: BattleMode;
        status: BattleRoomStatus;
        startedAt: Date | null;
        expiresAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        endReason: string | null;
      };
      joinedAt: Date;
    }
  >();

  const tx = {
    user: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        const user = users.get(where.id);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          battleRating: user.battleRating,
        };
      }),
    },
    battleProfile: {
      upsert: jest.fn(
        async ({
          where,
          create,
        }: {
          where: { userId: string };
          create: BattleProfileRecord;
        }) => {
          const existing = battleProfiles.get(where.userId);

          if (existing) {
            return existing;
          }

          const profile = {
            id: `bp-${where.userId}`,
            userId: create.userId,
            rating: create.rating,
            highestRating: create.highestRating,
          };

          battleProfiles.set(where.userId, profile);

          return profile;
        },
      ),
      findUnique: jest.fn(async ({ where }: { where: { userId: string } }) => {
        return battleProfiles.get(where.userId) ?? null;
      }),
    },
    battleMatchQueue: {
      findUnique: jest.fn(async ({ where }: { where: { userId: string } }) => {
        return battleQueues.get(where.userId) ?? null;
      }),
    },
    battleParticipant: {
      findFirst: jest.fn(
        async ({
          where,
        }: {
          where: {
            userId: string;
            battleRoom?: { status?: { in?: BattleRoomStatus[] } };
          };
        }) => {
        const participant = activeParticipants.get(where.userId);

        if (!participant) {
          return null;
        }

          if (
            where.battleRoom?.status?.in &&
            !where.battleRoom.status.in.includes(participant.battleRoom.status)
          ) {
            return null;
          }

        return participant;
        },
      ),
    },
  };

  const prisma = {
    ...tx,
    $transaction: jest.fn(
      async (callback: (transaction: typeof tx) => unknown) => callback(tx),
    ),
  };

  return {
    prisma,
    users,
    battleProfiles,
    battleQueues,
    activeParticipants,
  };
}

describe('BattleDomainService', () => {
  it('creates a battle profile on first ensure', async () => {
    const { prisma, users, battleProfiles } = createPrismaMock();
    users.set('user-1', { id: 'user-1', battleRating: 1050 });
    const service = new BattleDomainService(prisma as never);

    const profile = await service.ensureBattleProfile('user-1');

    expect(profile.rating).toBe(1050);
    expect(profile.highestRating).toBe(1050);
    expect(battleProfiles.size).toBe(1);
  });

  it('does not create a second profile on repeated ensure', async () => {
    const { prisma, users, battleProfiles } = createPrismaMock();
    users.set('user-1', { id: 'user-1', battleRating: 1000 });
    const service = new BattleDomainService(prisma as never);

    await service.ensureBattleProfile('user-1');
    await service.ensureBattleProfile('user-1');

    expect(battleProfiles.size).toBe(1);
  });

  it('does not create duplicate profiles on concurrent ensure', async () => {
    const { prisma, users, battleProfiles } = createPrismaMock();
    users.set('user-1', { id: 'user-1', battleRating: 980 });
    const service = new BattleDomainService(prisma as never);

    await Promise.all([
      service.ensureBattleProfile('user-1'),
      service.ensureBattleProfile('user-1'),
    ]);

    expect(battleProfiles.size).toBe(1);
    expect(battleProfiles.get('user-1')?.rating).toBe(980);
  });

  it('throws when a profile is missing', async () => {
    const { prisma } = createPrismaMock();
    const service = new BattleDomainService(prisma as never);

    await expect(service.getBattleProfile('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when user already has an active battle', async () => {
    const { prisma, activeParticipants } = createPrismaMock();
    activeParticipants.set('user-1', {
      battleRoomId: 'battle-1',
      status: BattleParticipantStatus.PLAYING,
      seat: 1,
      battleRoom: {
        mode: BattleMode.RANKED,
        status: BattleRoomStatus.IN_PROGRESS,
        startedAt: new Date('2026-07-25T10:00:00.000Z'),
        expiresAt: new Date('2026-07-25T10:03:00.000Z'),
        completedAt: null,
        cancelledAt: null,
        endReason: null,
      },
      joinedAt: new Date('2026-07-25T09:59:59.000Z'),
    });
    const service = new BattleDomainService(prisma as never);

    await expect(
      service.assertUserHasNoActiveBattle('user-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not treat CANCELLED rooms as active battles', async () => {
    const { prisma, activeParticipants } = createPrismaMock();
    activeParticipants.set('user-1', {
      battleRoomId: 'battle-1',
      status: BattleParticipantStatus.JOINED,
      seat: 1,
      battleRoom: {
        mode: BattleMode.FRIEND,
        status: BattleRoomStatus.CANCELLED,
        startedAt: null,
        expiresAt: null,
        completedAt: null,
        cancelledAt: new Date('2026-07-27T10:00:00.000Z'),
        endReason: 'SYSTEM_CANCELLED',
      },
      joinedAt: new Date('2026-07-27T09:59:59.000Z'),
    });
    const service = new BattleDomainService(prisma as never);

    await expect(service.assertUserHasNoActiveBattle('user-1')).resolves.toBeUndefined();
  });

  it('does not treat EXPIRED rooms as active battles', async () => {
    const { prisma, activeParticipants } = createPrismaMock();
    activeParticipants.set('user-1', {
      battleRoomId: 'battle-1',
      status: BattleParticipantStatus.JOINED,
      seat: 1,
      battleRoom: {
        mode: BattleMode.FRIEND,
        status: BattleRoomStatus.EXPIRED,
        startedAt: null,
        expiresAt: new Date('2026-07-27T10:00:00.000Z'),
        completedAt: null,
        cancelledAt: null,
        endReason: 'EXPIRED',
      },
      joinedAt: new Date('2026-07-27T09:59:59.000Z'),
    });
    const service = new BattleDomainService(prisma as never);

    await expect(service.assertUserHasNoActiveBattle('user-1')).resolves.toBeUndefined();
  });

  it('does not treat COMPLETED rooms as active battles', async () => {
    const { prisma, activeParticipants } = createPrismaMock();
    activeParticipants.set('user-1', {
      battleRoomId: 'battle-1',
      status: BattleParticipantStatus.COMPLETED,
      seat: 1,
      battleRoom: {
        mode: BattleMode.RANKED,
        status: BattleRoomStatus.COMPLETED,
        startedAt: new Date('2026-07-27T10:00:00.000Z'),
        expiresAt: new Date('2026-07-27T10:03:00.000Z'),
        completedAt: new Date('2026-07-27T10:04:00.000Z'),
        cancelledAt: null,
        endReason: 'NORMAL',
      },
      joinedAt: new Date('2026-07-27T09:59:59.000Z'),
    });
    const service = new BattleDomainService(prisma as never);

    await expect(service.assertUserHasNoActiveBattle('user-1')).resolves.toBeUndefined();
  });

  it('throws when user is already searching', async () => {
    const { prisma, battleQueues } = createPrismaMock();
    battleQueues.set('user-1', {
      userId: 'user-1',
      status: BattleMatchQueueStatus.SEARCHING,
    });
    const service = new BattleDomainService(prisma as never);

    await expect(
      service.assertUserNotSearching('user-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
