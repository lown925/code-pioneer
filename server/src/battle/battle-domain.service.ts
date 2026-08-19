import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import {
  BattleEndReason,
  BattleInvitationStatus,
  BattleMatchQueueStatus,
  BattleMode,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import {
  ACTIVE_BATTLE_ROOM_STATUSES,
  CANCELLABLE_BATTLE_ROOM_STATUSES,
  INITIAL_BATTLE_RATING,
  MIN_BATTLE_RATING,
  MATCH_SEARCHING_STATUS,
} from './battle.constants';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { PrismaService } from '../prisma/prisma.service';
import type { BattleTransactionClient } from './battle.types';

type BattleClient = PrismaService | BattleTransactionClient;

@Injectable()
export class BattleDomainService {
  constructor(private readonly prisma: PrismaService) {}

  /** Serialize entry points that can create or claim a battle for one user. */
  async acquireUserBattleLock(userId: string, tx: BattleTransactionClient) {
    await tx.$queryRaw(
      Prisma.sql`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${`battle:user:${userId}`}, 0))`,
    );
  }

  async acquireBattleRoomLock(
    battleRoomId: string,
    tx: BattleTransactionClient,
  ) {
    await tx.$queryRaw(
      Prisma.sql`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${`battle:room:${battleRoomId}`}, 0))`,
    );
  }

  async tryAcquireUserBattleLock(userId: string, tx: BattleTransactionClient) {
    const rows = await tx.$queryRaw<Array<{ locked: boolean }>>(
      Prisma.sql`SELECT pg_try_advisory_xact_lock(hashtextextended(${`battle:user:${userId}`}, 0)) AS locked`,
    );

    return rows[0]?.locked === true;
  }

  async normalizeExpiredFriendRoom(
    battleRoomId: string,
    now: Date,
    tx: BattleTransactionClient,
  ) {
    const roomUpdate = await tx.battleRoom.updateMany({
      where: {
        id: battleRoomId,
        mode: BattleMode.FRIEND,
        status: {
          in: [BattleRoomStatus.WAITING, BattleRoomStatus.READY],
        },
        expiresAt: { lte: now },
        startedAt: null,
      },
      data: {
        status: BattleRoomStatus.EXPIRED,
        endReason: BattleEndReason.EXPIRED,
      },
    });

    if (roomUpdate.count !== 1) {
      return false;
    }

    await tx.battleInvitation.updateMany({
      where: {
        battleRoomId,
        status: {
          in: [BattleInvitationStatus.ACTIVE, BattleInvitationStatus.ACCEPTED],
        },
      },
      data: {
        status: BattleInvitationStatus.EXPIRED,
      },
    });

    return true;
  }

  async normalizeExpiredFriendRoomsForUser(
    userId: string,
    now: Date,
    tx: BattleTransactionClient,
  ) {
    const participants = await tx.battleParticipant.findMany({
      where: {
        userId,
        battleRoom: {
          mode: BattleMode.FRIEND,
          status: {
            in: [BattleRoomStatus.WAITING, BattleRoomStatus.READY],
          },
          expiresAt: { lte: now },
          startedAt: null,
        },
      },
      select: { battleRoomId: true },
    });

    let normalizedCount = 0;
    for (const participant of participants) {
      await this.acquireBattleRoomLock(participant.battleRoomId, tx);
      if (
        await this.normalizeExpiredFriendRoom(participant.battleRoomId, now, tx)
      ) {
        normalizedCount += 1;
      }
    }

    return normalizedCount;
  }

  async normalizeExpiredRankedMatchRoom(
    battleRoomId: string,
    now: Date,
    tx: BattleTransactionClient,
  ) {
    const roomUpdate = await tx.battleRoom.updateMany({
      where: {
        id: battleRoomId,
        mode: BattleMode.RANKED,
        status: {
          in: [BattleRoomStatus.WAITING, BattleRoomStatus.READY],
        },
        expiresAt: { lte: now },
        startedAt: null,
      },
      data: {
        status: BattleRoomStatus.EXPIRED,
        endReason: BattleEndReason.EXPIRED,
      },
    });

    if (roomUpdate.count !== 1) {
      return false;
    }

    await tx.battleMatchQueue.updateMany({
      where: {
        status: BattleMatchQueueStatus.MATCHED,
        matchedBattleRoomId: battleRoomId,
      },
      data: {
        status: BattleMatchQueueStatus.CANCELLED,
        matchedBattleRoomId: null,
        matchedAt: null,
        cancelledAt: now,
      },
    });

    return true;
  }

  async normalizeExpiredRankedMatchRoomsForUser(
    userId: string,
    now: Date,
    tx: BattleTransactionClient,
  ) {
    const participants = await tx.battleParticipant.findMany({
      where: {
        userId,
        battleRoom: {
          mode: BattleMode.RANKED,
          status: {
            in: [BattleRoomStatus.WAITING, BattleRoomStatus.READY],
          },
          expiresAt: { lte: now },
          startedAt: null,
        },
      },
      select: { battleRoomId: true },
    });

    let normalizedCount = 0;
    for (const participant of participants) {
      await this.acquireBattleRoomLock(participant.battleRoomId, tx);
      if (
        await this.normalizeExpiredRankedMatchRoom(
          participant.battleRoomId,
          now,
          tx,
        )
      ) {
        normalizedCount += 1;
      }
    }

    return normalizedCount;
  }

  async ensureBattleProfile(userId: string, client?: BattleClient) {
    if (client) {
      return this.ensureBattleProfileWithClient(client, userId);
    }

    return this.prisma.$transaction(async (tx) =>
      this.ensureBattleProfileWithClient(tx, userId),
    );
  }

  async getBattleProfile(userId: string, client?: BattleClient) {
    const prisma = client ?? this.prisma;
    const profile = await prisma.battleProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(BATTLE_ERROR_CODES.BATTLE_PROFILE_NOT_FOUND);
    }

    return profile;
  }

  async assertUserHasNoActiveBattle(userId: string, client?: BattleClient) {
    const activeBattle = await this.getActiveBattleForUser(userId, client);

    if (activeBattle) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_ALREADY_ACTIVE);
    }
  }

  async assertUserNotSearching(userId: string, client?: BattleClient) {
    const prisma = client ?? this.prisma;
    const queueRecord = await prisma.battleMatchQueue.findUnique({
      where: { userId },
      select: { status: true },
    });

    if (queueRecord?.status === MATCH_SEARCHING_STATUS) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_ALREADY_MATCHING);
    }
  }

  async getActiveBattleForUser(userId: string, client?: BattleClient) {
    const prisma = client ?? this.prisma;
    const participant = await prisma.battleParticipant.findFirst({
      where: {
        userId,
        battleRoom: {
          status: {
            in: [...ACTIVE_BATTLE_ROOM_STATUSES] as BattleRoomStatus[],
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
      select: {
        battleRoomId: true,
        status: true,
        seat: true,
        battleRoom: {
          select: {
            mode: true,
            status: true,
            startedAt: true,
            expiresAt: true,
            completedAt: true,
            cancelledAt: true,
            endReason: true,
          },
        },
      },
    });

    if (!participant) {
      return null;
    }

    return {
      battleRoomId: participant.battleRoomId,
      participantStatus: participant.status,
      roomStatus: participant.battleRoom.status,
      mode: participant.battleRoom.mode,
      seat: participant.seat,
      startedAt: participant.battleRoom.startedAt,
      expiresAt: participant.battleRoom.expiresAt,
      completedAt: participant.battleRoom.completedAt,
      cancelledAt: participant.battleRoom.cancelledAt,
      endReason: participant.battleRoom.endReason,
    };
  }

  isActiveRoomStatus(status: BattleRoomStatus) {
    return ACTIVE_BATTLE_ROOM_STATUSES.includes(status);
  }

  isSearchingStatus(status: BattleMatchQueueStatus) {
    return status === MATCH_SEARCHING_STATUS;
  }

  async cancelCancellableBattleRoomForUser(
    userId: string,
    now: Date,
    tx: BattleTransactionClient,
  ) {
    const participant = await tx.battleParticipant.findFirst({
      where: {
        userId,
        battleRoom: {
          status: {
            in: [...CANCELLABLE_BATTLE_ROOM_STATUSES] as BattleRoomStatus[],
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
      select: {
        battleRoomId: true,
        battleRoom: {
          select: {
            id: true,
            mode: true,
            status: true,
            invitation: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!participant) {
      return null;
    }

    await this.acquireBattleRoomLock(participant.battleRoomId, tx);

    const roomUpdate = await tx.battleRoom.updateMany({
      where: {
        id: participant.battleRoomId,
        status: {
          in: [...CANCELLABLE_BATTLE_ROOM_STATUSES] as BattleRoomStatus[],
        },
      },
      data: {
        status: BattleRoomStatus.CANCELLED,
        cancelledAt: now,
        completedAt: null,
        settledAt: null,
        endReason: BattleEndReason.SYSTEM_CANCELLED,
      },
    });

    if (roomUpdate.count !== 1) {
      return null;
    }

    await tx.battleMatchQueue.updateMany({
      where: {
        matchedBattleRoomId: participant.battleRoomId,
      },
      data: {
        status: BattleMatchQueueStatus.CANCELLED,
        matchedBattleRoomId: null,
        matchedAt: null,
        cancelledAt: now,
      },
    });

    if (participant.battleRoom.invitation) {
      await tx.battleInvitation.updateMany({
        where: {
          id: participant.battleRoom.invitation.id,
          status: {
            in: [
              BattleInvitationStatus.ACTIVE,
              BattleInvitationStatus.ACCEPTED,
            ],
          },
        },
        data: {
          status: BattleInvitationStatus.CANCELLED,
          cancelledAt: now,
        },
      });
    }

    return {
      battleRoomId: participant.battleRoomId,
      mode: participant.battleRoom.mode,
      previousStatus: participant.battleRoom.status,
    };
  }

  private async ensureBattleProfileWithClient(
    prisma: BattleClient,
    userId: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        battleRating: true,
      },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const initialRating = Math.max(
      MIN_BATTLE_RATING,
      user.battleRating ?? INITIAL_BATTLE_RATING,
    );

    return prisma.battleProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        rating: initialRating,
        highestRating: initialRating,
      },
    });
  }
}
