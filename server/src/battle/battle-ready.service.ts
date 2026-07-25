import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  BattleParticipantStatus,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleQuestionService } from './battle-question.service';
import { BattleRoomService } from './battle-room.service';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BattleReadyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleQuestionService: BattleQuestionService,
    private readonly battleRoomService: BattleRoomService,
  ) {}

  async readyBattle(currentUser: CurrentUserContext, battleId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
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
          status: true,
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

      if (
        room.status === BattleRoomStatus.CANCELLED ||
        room.status === BattleRoomStatus.EXPIRED ||
        room.status === BattleRoomStatus.COMPLETED ||
        room.status === BattleRoomStatus.SETTLING
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
      }

      if (room.participants.length < 2) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_PARTICIPANTS_INCOMPLETE,
        );
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
        await tx.battleParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            status: BattleParticipantStatus.READY,
            readyAt: now,
          },
        });
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
        refreshedParticipants.length === 2 &&
        refreshedParticipants.every(
          (item) => item.status === BattleParticipantStatus.READY,
        );

      if (!allReady) {
        if (room.status === BattleRoomStatus.WAITING) {
          await tx.battleRoom.update({
            where: {
              id: battleId,
            },
            data: {
              status: BattleRoomStatus.READY,
            },
          });
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
          if (room.questionSnapshots.length > 0) {
            throw new ConflictException(
              BATTLE_ERROR_CODES.BATTLE_ALREADY_STARTED,
            );
          }

          await this.battleQuestionService.createQuestionSnapshotsAndStartCountdown(
            tx,
            {
              battleId,
              questionCount: room.questionCount,
              durationSeconds: room.durationSeconds,
              now,
            },
          );
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

    return {
      success: true as const,
      data,
    };
  }
}
