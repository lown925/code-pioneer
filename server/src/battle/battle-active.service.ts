import { Injectable } from '@nestjs/common';
import {
  BattleParticipantStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { COMPLETED_BATTLE_RECOVERY_TTL_SECONDS } from './battle.constants';
import { BattleDomainService } from './battle-domain.service';
import { BattleRoomService } from './battle-room.service';
import { BattleSettlementService } from './battle-settlement.service';
import type {
  ActiveBattleRecoveryPayload,
  BattleActiveRoomSummary,
  BattleRecoveryTarget,
} from './battle.types';

@Injectable()
export class BattleActiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleDomainService: BattleDomainService,
    private readonly battleRoomService: BattleRoomService,
    private readonly battleSettlementService: BattleSettlementService,
  ) {}

  async getActiveBattle(currentUserId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleDomainService.acquireUserBattleLock(currentUserId, tx);
      await this.battleDomainService.normalizeExpiredFriendRoomsForUser(
        currentUserId,
        now,
        tx,
      );
      await this.battleDomainService.normalizeExpiredRankedMatchRoomsForUser(
        currentUserId,
        now,
        tx,
      );

      let battle = await this.battleDomainService.getActiveBattleForUser(
        currentUserId,
        tx,
      );

      if (battle) {
        await this.battleDomainService.acquireBattleRoomLock(
          battle.battleRoomId,
          tx,
        );
        await this.battleRoomService.advanceRoomStateIfNeeded(
          battle.battleRoomId,
          now,
          tx,
        );
        await this.battleSettlementService.normalizeBattleState(
          battle.battleRoomId,
          now,
          tx,
        );
        battle = await this.battleDomainService.getActiveBattleForUser(
          currentUserId,
          tx,
        );
      }

      if (!battle) {
        battle = await this.battleDomainService.getRecentCompletedBattleForUser(
          currentUserId,
          new Date(
            now.getTime() - COMPLETED_BATTLE_RECOVERY_TTL_SECONDS * 1000,
          ),
          tx,
        );
      }

      return this.toRecoveryPayload(battle, now);
    });

    return {
      success: true as const,
      data,
    };
  }

  private toRecoveryPayload(
    battle: BattleActiveRoomSummary | null,
    serverTime: Date,
  ): ActiveBattleRecoveryPayload | null {
    if (
      !battle ||
      battle.roomStatus === BattleRoomStatus.CANCELLED ||
      battle.roomStatus === BattleRoomStatus.EXPIRED
    ) {
      return null;
    }

    return {
      battleId: battle.battleRoomId,
      mode: battle.mode,
      roomStatus: battle.roomStatus,
      participantStatus: battle.participantStatus,
      skillCode: battle.skillCode,
      skillName: battle.skillName,
      invitationToken: battle.invitationToken,
      inviteCode: battle.inviteCode,
      recoveryTarget: this.getRecoveryTarget(battle.roomStatus),
      readOnly:
        battle.roomStatus === BattleRoomStatus.SETTLING ||
        battle.roomStatus === BattleRoomStatus.COMPLETED ||
        battle.participantStatus === BattleParticipantStatus.SUBMITTED ||
        battle.participantStatus === BattleParticipantStatus.FORFEITED ||
        battle.participantStatus === BattleParticipantStatus.COMPLETED,
      serverTime,
    };
  }

  private getRecoveryTarget(roomStatus: string): BattleRecoveryTarget {
    if (roomStatus === BattleRoomStatus.COMPLETED) {
      return 'RESULT';
    }

    if (
      roomStatus === BattleRoomStatus.WAITING ||
      roomStatus === BattleRoomStatus.READY
    ) {
      return 'ROOM';
    }

    return 'PLAY';
  }
}
