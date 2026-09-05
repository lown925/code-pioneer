import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleDomainService } from './battle-domain.service';
import { type CurrentUserContext } from '../auth/auth.types';
import { BattleSettlementService } from './battle-settlement.service';
import { PrismaService } from '../prisma/prisma.service';
import { getProfessionalTrackIdentity } from '../course/course-catalog';
import {
  parseBattleAiAnswerPlan,
  projectBattleAiProgress,
} from './battle-ai-plan';
import type {
  BattleParticipantSummary,
  BattleRoomDetailPayload,
  BattleRoomSummaryPayload,
  BattleTransactionClient,
} from './battle.types';
import { resolveParticipantTrack } from './battle-compatibility';

type BattleClient = PrismaService | BattleTransactionClient;

type RoomRecord = {
  id: string;
  mode: string;
  skillCode: string | null;
  professionalTrackKey: string | null;
  status: BattleRoomStatus;
  questionCount: number;
  durationSeconds: number;
  createdAt: Date;
  startedAt: Date | null;
  expiresAt: Date | null;
  participants: Array<{
    id: string;
    userId: string;
    professionalTrackKey: string | null;
    seat: number;
    status: BattleParticipantStatus;
    user: {
      id: string;
      nickname: string | null;
      avatarUrl: string | null;
    };
  }>;
  aiOpponent: {
    displayName: string;
    answerPlan: unknown;
    plannedSubmittedOffsetMs: number;
  } | null;
};

@Injectable()
export class BattleRoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleDomainService: BattleDomainService,
    private readonly battleSettlementService?: BattleSettlementService,
  ) {}

  async getBattleRoom(currentUser: CurrentUserContext, battleId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleDomainService.acquireBattleRoomLock(battleId, tx);
      await this.battleDomainService.normalizeExpiredFriendRoom(
        battleId,
        now,
        tx,
      );
      await this.battleDomainService.normalizeExpiredRankedMatchRoom(
        battleId,
        now,
        tx,
      );
      await this.advanceRoomStateIfNeeded(battleId, now, tx);
      await this.battleSettlementService?.normalizeBattleState(
        battleId,
        now,
        tx,
      );

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

    const detail = this.toBattleRoomDetail(
      room,
      currentParticipant?.status ?? null,
      answeredCount,
      serverTime,
    );
    if (currentParticipant) {
      const track = resolveParticipantTrack(currentParticipant, room);
      const opponentParticipant = room.participants.find(
        (participant) => participant.user.id !== userId,
      );
      const opponentTrack = opponentParticipant
        ? resolveParticipantTrack(opponentParticipant, room)
        : null;
      return {
        ...detail,
        professionalTrackKey: track,
        professionalTrack: getProfessionalTrackIdentity(track),
        myProfessionalTrackKey: track,
        opponentProfessionalTrackKey: opponentTrack,
      };
    }
    return detail;
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
      skill: room.skillCode,
      professionalTrackKey: room.professionalTrackKey,
      professionalTrack: getProfessionalTrackIdentity(room.professionalTrackKey),
      status: room.status,
      questionCount: room.questionCount,
      durationSeconds: room.durationSeconds,
      createdAt: room.createdAt,
      startedAt: room.startedAt,
      expiresAt: room.expiresAt,
      serverTime,
      participants,
      opponent: this.toAiLiveOpponent(room, serverTime),
    };
  }

  private toAiLiveOpponent(room: RoomRecord, serverTime: Date) {
    if (room.mode !== BattleMode.AI) {
      return null;
    }

    if (!room.aiOpponent) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID);
    }

    const answerPlan = parseBattleAiAnswerPlan(room.aiOpponent.answerPlan);

    if (!answerPlan) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID);
    }

    const progress = projectBattleAiProgress({
      startedAt: room.startedAt,
      serverTime,
      answerPlan,
      plannedSubmittedOffsetMs: room.aiOpponent.plannedSubmittedOffsetMs,
    });

    return {
      type: 'AI' as const,
      displayName: room.aiOpponent.displayName,
      answeredCount: progress.answeredCount,
      submitted: progress.submitted,
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
      completed: room.status === BattleRoomStatus.COMPLETED,
      resultAvailable: room.status === BattleRoomStatus.COMPLETED,
    };
  }

  private readonly roomSelect = {
    id: true,
    mode: true,
    skillCode: true,
    professionalTrackKey: true,
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
        professionalTrackKey: true,
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
    aiOpponent: {
      select: {
        displayName: true,
        answerPlan: true,
        plannedSubmittedOffsetMs: true,
      },
    },
  } as const;
}
