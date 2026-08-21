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
import { BattleQuestionService } from './battle-question.service';
import { BattleRoomService } from './battle-room.service';
import { BattleDomainService } from './battle-domain.service';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { isBattleAiPlanValid } from './battle-ai-plan';

@Injectable()
export class BattleReadyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleQuestionService: BattleQuestionService,
    private readonly battleRoomService: BattleRoomService,
    private readonly battleDomainService: BattleDomainService,
  ) {}

  async readyBattle(currentUser: CurrentUserContext, battleId: string) {
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
      const room = await tx.battleRoom.findFirst({
        where: {
          id: battleId,
          participants: {
            some: {
              userId: currentUser.id,
            },
          },
        },
        select: {
          id: true,
          mode: true,
          status: true,
          skillCode: true,
          professionalTrackKey: true,
          questionCount: true,
          durationSeconds: true,
          startedAt: true,
          participants: {
            select: {
              id: true,
              userId: true,
              status: true,
            },
          },
          questionSnapshots: {
            select: {
              id: true,
              orderIndex: true,
            },
          },
        },
      });

      if (!room) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      if (
        room.status === BattleRoomStatus.COUNTDOWN ||
        room.status === BattleRoomStatus.IN_PROGRESS
      ) {
        await this.battleRoomService.advanceRoomStateIfNeeded(
          battleId,
          now,
          tx,
        );

        const startedRoom =
          await this.battleRoomService.getBattleRoomDetailByIdForUser(
            currentUser.id,
            battleId,
            tx,
            now,
          );

        if (!startedRoom) {
          throw new ForbiddenException(
            BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT,
          );
        }

        return startedRoom;
      }

      if (room.status === BattleRoomStatus.EXPIRED) {
        return null;
      }

      if (
        room.status === BattleRoomStatus.CANCELLED ||
        room.status === BattleRoomStatus.COMPLETED ||
        room.status === BattleRoomStatus.SETTLING
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
      }

      const isAiBattle = room.mode === BattleMode.AI;

      if (
        (isAiBattle && room.participants.length !== 1) ||
        (!isAiBattle && room.participants.length < 2)
      ) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_PARTICIPANTS_INCOMPLETE,
        );
      }

      if (isAiBattle) {
        const aiOpponent = await tx.battleAiOpponent.findUnique({
          where: { battleRoomId: battleId },
          select: {
            strategyVersion: true,
            answerPlan: true,
            plannedSubmittedOffsetMs: true,
          },
        });

        if (
          !aiOpponent ||
          !isBattleAiPlanValid({
            value: aiOpponent.answerPlan,
            strategyVersion: aiOpponent.strategyVersion,
            plannedSubmittedOffsetMs: aiOpponent.plannedSubmittedOffsetMs,
            durationSeconds: room.durationSeconds,
            snapshots: room.questionSnapshots,
          })
        ) {
          throw new ConflictException(
            BATTLE_ERROR_CODES.BATTLE_AI_PLAN_INVALID,
          );
        }
      }

      const participant = room.participants.find(
        (item) => item.userId === currentUser.id,
      );

      if (!participant) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      if (
        participant.status !== BattleParticipantStatus.JOINED &&
        participant.status !== BattleParticipantStatus.READY
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
      }

      if (participant.status === BattleParticipantStatus.JOINED) {
        const participantUpdate = await tx.battleParticipant.updateMany({
          where: {
            id: participant.id,
            status: BattleParticipantStatus.JOINED,
            battleRoom: {
              status: {
                in: [BattleRoomStatus.WAITING, BattleRoomStatus.READY],
              },
            },
          },
          data: {
            status: BattleParticipantStatus.READY,
            readyAt: now,
          },
        });

        if (participantUpdate.count !== 1) {
          throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
        }
      }

      const refreshedParticipants = await tx.battleParticipant.findMany({
        where: {
          battleRoomId: battleId,
        },
        select: {
          id: true,
          userId: true,
          status: true,
        },
      });

      const allReady =
        refreshedParticipants.length === (isAiBattle ? 1 : 2) &&
        refreshedParticipants.every(
          (item) => item.status === BattleParticipantStatus.READY,
        );

      if (!allReady) {
        if (room.status === BattleRoomStatus.WAITING) {
          const promoted = await tx.battleRoom.updateMany({
            where: {
              id: battleId,
              status: BattleRoomStatus.WAITING,
            },
            data: {
              status: BattleRoomStatus.READY,
            },
          });

          if (promoted.count !== 1) {
            throw new ConflictException(
              BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS,
            );
          }
        }
      } else {
        const claimed = await tx.battleRoom.updateMany({
          where: {
            id: battleId,
            status: {
              in: [BattleRoomStatus.WAITING, BattleRoomStatus.READY],
            },
            startedAt: null,
          },
          data: {
            status: BattleRoomStatus.COUNTDOWN,
          },
        });

        if (claimed.count === 1) {
          if (!isAiBattle && room.questionSnapshots.length > 0) {
            throw new ConflictException(
              BATTLE_ERROR_CODES.BATTLE_ALREADY_STARTED,
            );
          }

          if (isAiBattle) {
            await this.battleQuestionService.startCountdown(tx, {
              battleId,
              skillCode: room.skillCode,
              professionalTrackKey: room.professionalTrackKey,
              questionCount: room.questionCount,
              durationSeconds: room.durationSeconds,
              now,
            });
          } else {
            await this.battleQuestionService.createQuestionSnapshotsAndStartCountdown(
              tx,
              {
                battleId,
                skillCode: room.skillCode,
                professionalTrackKey: room.professionalTrackKey,
                questionCount: room.questionCount,
                durationSeconds: room.durationSeconds,
                now,
              },
            );
          }
        }
      }

      const result =
        await this.battleRoomService.getBattleRoomDetailByIdForUser(
          currentUser.id,
          battleId,
          tx,
          now,
        );

      if (!result) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      return result;
    });

    if (!data) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
    }

    return {
      success: true as const,
      data,
    };
  }
}
