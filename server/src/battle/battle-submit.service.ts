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
import { BattleRoomService } from './battle-room.service';
import { BattleSettlementService } from './battle-settlement.service';
import { PrismaService } from '../prisma/prisma.service';
import type { BattleSubmitActionPayload } from './battle.types';

@Injectable()
export class BattleSubmitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleRoomService: BattleRoomService,
    private readonly battleSettlementService: BattleSettlementService,
  ) {}

  async submitBattle(currentUserId: string, battleId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleRoomService.advanceRoomStateIfNeeded(battleId, now, tx);
      await this.battleSettlementService.normalizeBattleState(battleId, now, tx);

      const { room, participant } =
        await this.battleSettlementService.assertParticipantBattle(
          battleId,
          currentUserId,
          tx,
        );

      if (room.status === BattleRoomStatus.COMPLETED) {
        return this.buildActionPayload(
          battleId,
          room.status,
          BattleParticipantStatus.COMPLETED,
          false,
          true,
          now,
        );
      }

      if (room.status === BattleRoomStatus.SETTLING) {
        return this.buildActionPayload(
          battleId,
          room.status,
          participant.status,
          false,
          false,
          now,
        );
      }

      if (room.status !== BattleRoomStatus.IN_PROGRESS) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_NOT_STARTED);
      }

      if (participant.status === BattleParticipantStatus.COMPLETED) {
        return this.buildActionPayload(
          battleId,
          BattleRoomStatus.COMPLETED,
          BattleParticipantStatus.COMPLETED,
          false,
          true,
          now,
        );
      }

      if (participant.status === BattleParticipantStatus.FORFEITED) {
        await this.battleSettlementService.normalizeBattleState(
          battleId,
          now,
          tx,
        );

        return this.buildActionPayload(
          battleId,
          BattleRoomStatus.SETTLING,
          participant.status,
          false,
          false,
          now,
        );
      }

      if (participant.status === BattleParticipantStatus.SUBMITTED) {
        return this.buildActionPayload(
          battleId,
          room.status,
          participant.status,
          true,
          false,
          now,
        );
      }

      if (participant.status !== BattleParticipantStatus.PLAYING) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
      }

      await tx.battleParticipant.update({
        where: {
          id: participant.id,
        },
        data: {
          status: BattleParticipantStatus.SUBMITTED,
          submittedAt: now,
        },
      });

      const normalizedRoom = await this.battleSettlementService.normalizeBattleState(
        battleId,
        now,
        tx,
      );
      const completed = normalizedRoom?.status === BattleRoomStatus.COMPLETED;
      const roomStatus = normalizedRoom?.status ?? BattleRoomStatus.IN_PROGRESS;

      return this.buildActionPayload(
        battleId,
        roomStatus,
        completed
          ? BattleParticipantStatus.COMPLETED
          : BattleParticipantStatus.SUBMITTED,
        !completed,
        completed,
        now,
      );
    });

    return {
      success: true as const,
      data,
    };
  }

  async forfeitBattle(currentUserId: string, battleId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleRoomService.advanceRoomStateIfNeeded(battleId, now, tx);
      await this.battleSettlementService.normalizeBattleState(battleId, now, tx);

      const { room, participant } =
        await this.battleSettlementService.assertParticipantBattle(
          battleId,
          currentUserId,
          tx,
        );

      if (room.status === BattleRoomStatus.COMPLETED) {
        return this.buildActionPayload(
          battleId,
          room.status,
          BattleParticipantStatus.COMPLETED,
          false,
          true,
          now,
        );
      }

      if (
        room.status !== BattleRoomStatus.COUNTDOWN &&
        room.status !== BattleRoomStatus.IN_PROGRESS &&
        room.status !== BattleRoomStatus.SETTLING
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_CANNOT_FORFEIT);
      }

      if (room.mode === BattleMode.TRAINING) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_CANNOT_FORFEIT);
      }

      if (participant.status === BattleParticipantStatus.COMPLETED) {
        return this.buildActionPayload(
          battleId,
          BattleRoomStatus.COMPLETED,
          BattleParticipantStatus.COMPLETED,
          false,
          true,
          now,
        );
      }

      if (participant.status === BattleParticipantStatus.FORFEITED) {
        return this.buildActionPayload(
          battleId,
          room.status,
          participant.status,
          false,
          false,
          now,
        );
      }

      if (
        participant.status !== BattleParticipantStatus.READY &&
        participant.status !== BattleParticipantStatus.PLAYING &&
        participant.status !== BattleParticipantStatus.SUBMITTED
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_CANNOT_FORFEIT);
      }

      await tx.battleParticipant.update({
        where: {
          id: participant.id,
        },
        data: {
          status: BattleParticipantStatus.FORFEITED,
          forfeitedAt: now,
        },
      });

      const normalizedRoom = await this.battleSettlementService.normalizeBattleState(
        battleId,
        now,
        tx,
      );
      const completed = normalizedRoom?.status === BattleRoomStatus.COMPLETED;

      return this.buildActionPayload(
        battleId,
        normalizedRoom?.status ?? BattleRoomStatus.SETTLING,
        completed
          ? BattleParticipantStatus.COMPLETED
          : BattleParticipantStatus.FORFEITED,
        false,
        completed,
        now,
      );
    });

    return {
      success: true as const,
      data,
    };
  }

  private buildActionPayload(
    battleId: string,
    roomStatus: string,
    participantStatus: string | null,
    waitingForOpponent: boolean,
    completed: boolean,
    serverTime: Date,
  ): BattleSubmitActionPayload {
    return {
      battleId,
      roomStatus,
      participantStatus,
      waitingForOpponent,
      completed,
      serverTime,
    };
  }
}
