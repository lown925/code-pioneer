import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  BattleParticipantStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  BattleParticipantSummary,
  BattleRoomDetailPayload,
  BattleRoomSummaryPayload,
  BattleTransactionClient,
} from './battle.types';

type BattleClient = PrismaService | BattleTransactionClient;

type RoomRecord = {
  id: string;
  mode: string;
  status: BattleRoomStatus;
  questionCount: number;
  durationSeconds: number;
  createdAt: Date;
  startedAt: Date | null;
  expiresAt: Date | null;
  participants: Array<{
    id: string;
    userId: string;
    seat: number;
    status: BattleParticipantStatus;
    user: {
      id: string;
      nickname: string | null;
      avatarUrl: string | null;
    };
  }>;
};

@Injectable()
export class BattleRoomService {
  constructor(private readonly prisma: PrismaService) {}

  async getBattleRoom(currentUser: CurrentUserContext, battleId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.advanceRoomStateIfNeeded(battleId, now, tx);

      const room = await this.getBattleRoomDetailByIdForUser(
        currentUser.id,
        battleId,
        tx,
        now,
      );

      if (!room) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      return room;
    });

    return {
      success: true as const,
      data,
    };
  }

  async advanceRoomStateIfNeeded(
    battleId: string,
    now: Date,
    client?: BattleClient,
  ) {
    const prisma = client ?? this.prisma;
    const room = await prisma.battleRoom.findUnique({
      where: { id: battleId },
      select: {
        id: true,
        status: true,
        startedAt: true,
      },
    });

    if (
      !room ||
      room.status !== BattleRoomStatus.COUNTDOWN ||
      !room.startedAt ||
      room.startedAt.getTime() > now.getTime()
    ) {
      return room;
    }

    const updated = await prisma.battleRoom.updateMany({
      where: {
        id: battleId,
        status: BattleRoomStatus.COUNTDOWN,
        startedAt: {
          lte: now,
        },
      },
      data: {
        status: BattleRoomStatus.IN_PROGRESS,
      },
    });

    if (updated.count === 1) {
      await prisma.battleParticipant.updateMany({
        where: {
          battleRoomId: battleId,
          status: BattleParticipantStatus.READY,
        },
        data: {
          status: BattleParticipantStatus.PLAYING,
        },
      });
    }

    return prisma.battleRoom.findUnique({
      where: { id: battleId },
      select: {
        id: true,
        status: true,
        startedAt: true,
      },
    });
  }

  async getBattleRoomForUser(
    userId: string,
    battleId: string,
    client?: BattleClient,
  ) {
    const prisma = client ?? this.prisma;

    return prisma.battleRoom.findFirst({
      where: {
        id: battleId,
        participants: {
          some: {
            userId,
          },
        },
      },
      select: this.roomSelect,
    }) as Promise<RoomRecord | null>;
  }

  async getBattleRoomSummaryById(battleId: string, client?: BattleClient) {
    const prisma = client ?? this.prisma;
    const room = await prisma.battleRoom.findUnique({
      where: { id: battleId },
      select: this.roomSelect,
    });

    return room ? this.toBattleRoomSummary(room, new Date()) : null;
  }

  async getBattleRoomDetailByIdForUser(
    userId: string,
    battleId: string,
    client?: BattleClient,
    serverTime = new Date(),
  ) {
    const prisma = client ?? this.prisma;
    const room = await this.getBattleRoomForUser(userId, battleId, prisma);

    if (!room) {
      return null;
    }

    const currentParticipant = room.participants.find(
      (participant) => participant.userId === userId,
    );

    const answeredCount = currentParticipant
      ? await prisma.battleAnswer.count({
          where: {
            participantId: currentParticipant.id,
          },
        })
      : 0;

    return this.toBattleRoomDetail(
      room,
      currentParticipant?.status ?? null,
      answeredCount,
      serverTime,
    );
  }

  private toBattleRoomSummary(
    room: RoomRecord,
    serverTime: Date,
  ): BattleRoomSummaryPayload {
    const participants: BattleParticipantSummary[] = room.participants
      .map((participant) => ({
        userId: participant.user.id,
        nickname: participant.user.nickname,
        avatarUrl: participant.user.avatarUrl,
        seat: participant.seat,
        status: participant.status,
      }))
      .sort((left, right) => left.seat - right.seat);

    return {
      battleId: room.id,
      mode: room.mode,
      status: room.status,
      questionCount: room.questionCount,
      durationSeconds: room.durationSeconds,
      createdAt: room.createdAt,
      startedAt: room.startedAt,
      expiresAt: room.expiresAt,
      serverTime,
      participants,
    };
  }

  private toBattleRoomDetail(
    room: RoomRecord,
    currentParticipantStatus: BattleParticipantStatus | null,
    answeredCount: number,
    serverTime: Date,
  ): BattleRoomDetailPayload {
    return {
      ...this.toBattleRoomSummary(room, serverTime),
      currentParticipantStatus,
      answeredCount,
      totalQuestionCount: room.questionCount,
    };
  }

  private readonly roomSelect = {
    id: true,
    mode: true,
    status: true,
    questionCount: true,
    durationSeconds: true,
    createdAt: true,
    startedAt: true,
    expiresAt: true,
    participants: {
      select: {
        id: true,
        userId: true,
        seat: true,
        status: true,
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
    },
  } as const;
}
