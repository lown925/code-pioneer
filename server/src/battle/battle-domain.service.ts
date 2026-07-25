import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BattleMatchQueueStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import {
  ACTIVE_BATTLE_ROOM_STATUSES,
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
