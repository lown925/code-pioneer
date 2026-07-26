import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { BattleResult, BattleRoomStatus } from '../../generated/prisma/enums';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleRoomService } from './battle-room.service';
import { BattleSettlementService } from './battle-settlement.service';
import { PrismaService } from '../prisma/prisma.service';
import type { BattleResultPayload } from './battle.types';

@Injectable()
export class BattleResultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleRoomService: BattleRoomService,
    private readonly battleSettlementService: BattleSettlementService,
  ) {}

  async getBattleResult(currentUserId: string, battleId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleRoomService.advanceRoomStateIfNeeded(battleId, now, tx);
      await this.battleSettlementService.normalizeBattleState(battleId, now, tx);

      const room = await tx.battleRoom.findFirst({
        where: {
          id: battleId,
          participants: {
            some: {
              userId: currentUserId,
            },
          },
        },
        select: {
          id: true,
          mode: true,
          status: true,
          endReason: true,
          completedAt: true,
          participants: {
            select: {
              id: true,
              userId: true,
              result: true,
              score: true,
              correctCount: true,
              wrongCount: true,
              unansweredCount: true,
              ratingBefore: true,
              ratingDelta: true,
              ratingAfter: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (!room) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      if (
        room.status === BattleRoomStatus.WAITING ||
        room.status === BattleRoomStatus.READY
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_NOT_STARTED);
      }

      if (
        room.status === BattleRoomStatus.COUNTDOWN ||
        room.status === BattleRoomStatus.IN_PROGRESS ||
        room.status === BattleRoomStatus.SETTLING
      ) {
        return {
          battleId: room.id,
          mode: room.mode,
          status: room.status,
          completed: false,
          serverTime: now,
        } satisfies BattleResultPayload;
      }

      const currentParticipant = room.participants.find(
        (participant) => participant.userId === currentUserId,
      );
      const opponentParticipant = room.participants.find(
        (participant) => participant.userId !== currentUserId,
      );

      if (!currentParticipant || !opponentParticipant || !room.completedAt) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
        );
      }

      if (
        currentParticipant.result === BattleResult.NONE ||
        opponentParticipant.result === BattleResult.NONE
      ) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_SETTLEMENT_DATA_INVALID,
        );
      }

      return {
        battleId: room.id,
        mode: room.mode,
        status: BattleRoomStatus.COMPLETED,
        completed: true,
        result: currentParticipant.result,
        myScore: currentParticipant.score,
        opponentScore: opponentParticipant.score,
        myCorrectCount: currentParticipant.correctCount,
        myWrongCount: currentParticipant.wrongCount,
        myUnansweredCount: currentParticipant.unansweredCount,
        opponentCorrectCount: opponentParticipant.correctCount,
        opponentWrongCount: opponentParticipant.wrongCount,
        opponentUnansweredCount: opponentParticipant.unansweredCount,
        ratingBefore: currentParticipant.ratingBefore ?? 0,
        ratingDelta: currentParticipant.ratingDelta,
        ratingAfter: currentParticipant.ratingAfter ?? 0,
        opponent: {
          userId: opponentParticipant.user.id,
          nickname: opponentParticipant.user.nickname,
          avatarUrl: opponentParticipant.user.avatarUrl,
        },
        endReason: room.endReason,
        completedAt: room.completedAt,
        serverTime: now,
      } satisfies BattleResultPayload;
    });

    return {
      success: true as const,
      data,
    };
  }
}
