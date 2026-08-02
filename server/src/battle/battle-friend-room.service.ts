import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BattleEndReason,
  BattleInvitationStatus,
  BattleMode,
  BattleParticipantStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import {
  BATTLE_CORRECT_SCORE,
  BATTLE_DURATION_SECONDS,
  BATTLE_UNANSWERED_SCORE,
  BATTLE_WRONG_SCORE,
  DEFAULT_BATTLE_QUESTION_COUNT,
  FRIEND_INVITATION_TTL_MINUTES,
} from './battle.constants';
import { BattleDomainService } from './battle-domain.service';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleRoomService } from './battle-room.service';
import { BattleTokenService } from './battle-token.service';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  BattleTransactionClient,
  FriendRoomPreviewPayload,
} from './battle.types';

type InvitationRecord = {
  id: string;
  battleRoomId: string;
  inviterUserId: string;
  inviteeUserId: string | null;
  token: string;
  inviteCode: string | null;
  status: BattleInvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  cancelledAt: Date | null;
  inviterUser: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  battleRoom: {
    id: string;
    mode: BattleMode;
    status: BattleRoomStatus;
    expiresAt: Date | null;
    participants: Array<{
      userId: string;
      seat: number;
    }>;
  };
};

@Injectable()
export class BattleFriendRoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleDomainService: BattleDomainService,
    private readonly battleTokenService: BattleTokenService,
    private readonly battleRoomService: BattleRoomService,
  ) {}

  async createFriendRoom(currentUser: CurrentUserContext) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleDomainService.ensureBattleProfile(currentUser.id, tx);
      await this.battleDomainService.assertUserHasNoActiveBattle(
        currentUser.id,
        tx,
      );
      await this.battleDomainService.assertUserNotSearching(currentUser.id, tx);

      const expiresAt = new Date(
        now.getTime() + FRIEND_INVITATION_TTL_MINUTES * 60 * 1000,
      );
      const room = await tx.battleRoom.create({
        data: {
          mode: BattleMode.FRIEND,
          status: BattleRoomStatus.WAITING,
          questionCount: DEFAULT_BATTLE_QUESTION_COUNT,
          durationSeconds: BATTLE_DURATION_SECONDS,
          correctScore: BATTLE_CORRECT_SCORE,
          wrongScore: BATTLE_WRONG_SCORE,
          unansweredScore: BATTLE_UNANSWERED_SCORE,
          createdByUserId: currentUser.id,
          expiresAt,
        },
        select: {
          id: true,
          mode: true,
          status: true,
        },
      });

      await tx.battleParticipant.create({
        data: {
          battleRoomId: room.id,
          userId: currentUser.id,
          seat: 1,
          status: BattleParticipantStatus.JOINED,
          result: BattleResult.NONE,
        },
      });

      const invitation = await this.createInvitationWithUniqueToken(tx, {
        battleRoomId: room.id,
        inviterUserId: currentUser.id,
        expiresAt,
      });

      return {
        battleId: room.id,
        mode: room.mode,
        status: room.status,
        invitationToken: invitation.token,
        inviteCode: invitation.inviteCode,
        sharePath: `/pages/battle/friend-room?invitationToken=${invitation.token}`,
        expiresAt,
        serverTime: now,
      };
    });

    return {
      success: true as const,
      data,
    };
  }

  async previewFriendRoom(
    currentUser: CurrentUserContext,
    invitationToken: string,
  ) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const invitation = await this.getInvitationByToken(tx, invitationToken);

      if (!invitation) {
        throw new NotFoundException(
          BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID,
        );
      }

      const normalizedInvitation = await this.expireInvitationIfNeeded(
        tx,
        invitation,
        now,
      );

      return this.toPreviewPayload(
        currentUser.id,
        normalizedInvitation,
        now,
        tx,
      );
    });

    return {
      success: true as const,
      data,
    };
  }

  async previewFriendRoomByInviteCode(
    currentUser: CurrentUserContext,
    inviteCode: string,
  ) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const invitation = await this.getInvitationByInviteCode(tx, inviteCode);

      if (!invitation) {
        throw new NotFoundException(
          BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID,
        );
      }

      const normalizedInvitation = await this.expireInvitationIfNeeded(
        tx,
        invitation,
        now,
      );

      return this.toPreviewPayload(
        currentUser.id,
        normalizedInvitation,
        now,
        tx,
      );
    });

    return {
      success: true as const,
      data,
    };
  }

  async joinFriendRoom(
    currentUser: CurrentUserContext,
    invitationToken: string,
  ) {
    return this.joinFriendRoomByResolver(currentUser, (tx) =>
      this.getInvitationByToken(tx, invitationToken),
    );
  }

  async joinFriendRoomByInviteCode(
    currentUser: CurrentUserContext,
    inviteCode: string,
  ) {
    return this.joinFriendRoomByResolver(currentUser, (tx) =>
      this.getInvitationByInviteCode(tx, inviteCode),
    );
  }

  async cancelFriendRoom(
    currentUser: CurrentUserContext,
    invitationToken: string,
  ) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      let invitation = await this.getInvitationByToken(tx, invitationToken);

      if (!invitation) {
        throw new NotFoundException(
          BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID,
        );
      }

      invitation = await this.expireInvitationIfNeeded(tx, invitation, now);

      if (invitation.inviterUserId !== currentUser.id) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      if (invitation.status === BattleInvitationStatus.EXPIRED) {
        return this.toPreviewPayload(currentUser.id, invitation, now, tx);
      }

      if (
        invitation.battleRoom.status === BattleRoomStatus.IN_PROGRESS ||
        invitation.battleRoom.status === BattleRoomStatus.SETTLING ||
        invitation.battleRoom.status === BattleRoomStatus.COMPLETED
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
      }

      if (invitation.battleRoom.status === BattleRoomStatus.CANCELLED) {
        return this.toPreviewPayload(
          currentUser.id,
          {
            ...invitation,
            status:
              invitation.status === BattleInvitationStatus.ACTIVE
                ? BattleInvitationStatus.CANCELLED
                : invitation.status,
          },
          now,
          tx,
        );
      }

      const released =
        await this.battleDomainService.cancelCancellableBattleRoomForUser(
          currentUser.id,
          now,
          tx,
        );

      if (!released || released.battleRoomId !== invitation.battleRoomId) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
      }

      invitation = await this.getInvitationByToken(tx, invitationToken);

      if (!invitation) {
        throw new NotFoundException(
          BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID,
        );
      }

      return this.toPreviewPayload(
        currentUser.id,
        {
          ...invitation,
          status: BattleInvitationStatus.CANCELLED,
          battleRoom: {
            ...invitation.battleRoom,
            status: BattleRoomStatus.CANCELLED,
          },
        },
        now,
        tx,
      );
    });

    return {
      success: true as const,
      data,
    };
  }

  private async joinFriendRoomByResolver(
    currentUser: CurrentUserContext,
    resolveInvitation: (
      tx: BattleTransactionClient,
    ) => Promise<InvitationRecord | null>,
  ) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleDomainService.ensureBattleProfile(currentUser.id, tx);

      let invitation = await resolveInvitation(tx);

      if (!invitation) {
        throw new NotFoundException(
          BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID,
        );
      }

      invitation = await this.expireInvitationIfNeeded(tx, invitation, now);

      const existingParticipant = invitation.battleRoom.participants.find(
        (participant) => participant.userId === currentUser.id,
      );

      if (existingParticipant) {
        const room = await this.battleRoomService.getBattleRoomSummaryById(
          invitation.battleRoomId,
          tx,
        );

        if (!room) {
          throw new NotFoundException(BATTLE_ERROR_CODES.BATTLE_NOT_FOUND);
        }

        return room;
      }

      if (invitation.status === BattleInvitationStatus.EXPIRED) {
        throw new GoneException(BATTLE_ERROR_CODES.BATTLE_INVITATION_EXPIRED);
      }

      if (invitation.status === BattleInvitationStatus.ACCEPTED) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_INVITATION_ALREADY_ACCEPTED,
        );
      }

      if (invitation.status !== BattleInvitationStatus.ACTIVE) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID,
        );
      }

      if (invitation.battleRoom.mode !== BattleMode.FRIEND) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
      }

      if (invitation.battleRoom.status !== BattleRoomStatus.WAITING) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
      }

      if (invitation.inviterUserId === currentUser.id) {
        throw new ForbiddenException(
          BATTLE_ERROR_CODES.BATTLE_CANNOT_INVITE_SELF,
        );
      }

      await this.battleDomainService.assertUserHasNoActiveBattle(
        currentUser.id,
        tx,
      );
      await this.battleDomainService.assertUserNotSearching(currentUser.id, tx);

      if (invitation.battleRoom.participants.length >= 2) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_ROOM_FULL);
      }

      try {
        await tx.battleParticipant.create({
          data: {
            battleRoomId: invitation.battleRoomId,
            userId: currentUser.id,
            seat: 2,
            status: BattleParticipantStatus.JOINED,
            result: BattleResult.NONE,
          },
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          const participant = await tx.battleParticipant.findFirst({
            where: {
              battleRoomId: invitation.battleRoomId,
              userId: currentUser.id,
            },
            select: {
              id: true,
            },
          });

          if (participant) {
            const room = await this.battleRoomService.getBattleRoomSummaryById(
              invitation.battleRoomId,
              tx,
            );

            if (!room) {
              throw new NotFoundException(BATTLE_ERROR_CODES.BATTLE_NOT_FOUND);
            }

            return room;
          }

          throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_ROOM_FULL);
        }

        throw error;
      }

      const invitationUpdate = await tx.battleInvitation.updateMany({
        where: {
          id: invitation.id,
          status: BattleInvitationStatus.ACTIVE,
        },
        data: {
          status: BattleInvitationStatus.ACCEPTED,
          inviteeUserId: currentUser.id,
          acceptedAt: now,
        },
      });

      if (invitationUpdate.count !== 1) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_INVITATION_ALREADY_ACCEPTED,
        );
      }

      const room = await this.battleRoomService.getBattleRoomSummaryById(
        invitation.battleRoomId,
        tx,
      );

      if (!room) {
        throw new NotFoundException(BATTLE_ERROR_CODES.BATTLE_NOT_FOUND);
      }

      return room;
    });

    return {
      success: true as const,
      data,
    };
  }

  private async createInvitationWithUniqueToken(
    tx: BattleTransactionClient,
    input: {
      battleRoomId: string;
      inviterUserId: string;
      expiresAt: Date;
    },
  ) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = this.battleTokenService.generateInvitationToken();
      const inviteCode = this.battleTokenService.generateInviteCode();

      try {
        return await tx.battleInvitation.create({
          data: {
            battleRoomId: input.battleRoomId,
            inviterUserId: input.inviterUserId,
            status: BattleInvitationStatus.ACTIVE,
            token,
            inviteCode,
            expiresAt: input.expiresAt,
          },
          select: {
            token: true,
            inviteCode: true,
          },
        });
      } catch (error) {
        if (!this.isUniqueConstraintError(error)) {
          throw error;
        }
      }
    }

    throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID);
  }

  private async expireInvitationIfNeeded(
    tx: BattleTransactionClient,
    invitation: InvitationRecord,
    now: Date,
  ) {
    if (
      invitation.status !== BattleInvitationStatus.ACTIVE ||
      invitation.expiresAt.getTime() > now.getTime()
    ) {
      return invitation;
    }

    await tx.battleInvitation.update({
      where: { id: invitation.id },
      data: {
        status: BattleInvitationStatus.EXPIRED,
      },
    });

    if (invitation.battleRoom.status === BattleRoomStatus.WAITING) {
      await tx.battleRoom.update({
        where: { id: invitation.battleRoomId },
        data: {
          status: BattleRoomStatus.EXPIRED,
          endReason: BattleEndReason.EXPIRED,
        },
      });
    }

    return {
      ...invitation,
      status: BattleInvitationStatus.EXPIRED,
      battleRoom: {
        ...invitation.battleRoom,
        status:
          invitation.battleRoom.status === BattleRoomStatus.WAITING
            ? BattleRoomStatus.EXPIRED
            : invitation.battleRoom.status,
      },
    };
  }

  private toPreviewPayload(
    currentUserId: string,
    invitation: InvitationRecord,
    now: Date,
    tx?: BattleTransactionClient,
  ): Promise<FriendRoomPreviewPayload> | FriendRoomPreviewPayload {
    const participantIds = invitation.battleRoom.participants.map(
      (participant) => participant.userId,
    );
    const isInviter = invitation.inviterUserId === currentUserId;
    const isParticipant = participantIds.includes(currentUserId);

    let canJoin = true;
    let cannotJoinReason: string | null = null;

    if (invitation.status === BattleInvitationStatus.EXPIRED) {
      canJoin = false;
      cannotJoinReason = BATTLE_ERROR_CODES.BATTLE_INVITATION_EXPIRED;
    } else if (invitation.status === BattleInvitationStatus.CANCELLED) {
      canJoin = false;
      cannotJoinReason = BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID;
    } else if (invitation.status === BattleInvitationStatus.ACCEPTED) {
      canJoin = isParticipant;
      cannotJoinReason = isParticipant
        ? null
        : BATTLE_ERROR_CODES.BATTLE_ROOM_FULL;
    } else if (isInviter) {
      canJoin = false;
      cannotJoinReason = BATTLE_ERROR_CODES.BATTLE_CANNOT_INVITE_SELF;
    } else if (
      invitation.battleRoom.status !== BattleRoomStatus.WAITING ||
      invitation.battleRoom.participants.length >= 2
    ) {
      canJoin = false;
      cannotJoinReason = BATTLE_ERROR_CODES.BATTLE_ROOM_FULL;
    } else if (invitation.status !== BattleInvitationStatus.ACTIVE) {
      canJoin = false;
      cannotJoinReason = BATTLE_ERROR_CODES.BATTLE_INVITATION_INVALID;
    }

    const finalize = (result: {
      canJoin: boolean;
      cannotJoinReason: string | null;
    }) => ({
      battleId: invitation.battleRoomId,
      roomStatus: invitation.battleRoom.status,
      invitationStatus: invitation.status,
      inviteCode: invitation.inviteCode,
      inviter: {
        userId: invitation.inviterUser.id,
        nickname: invitation.inviterUser.nickname,
        avatarUrl: invitation.inviterUser.avatarUrl,
      },
      participantCount: invitation.battleRoom.participants.length,
      expiresAt: invitation.expiresAt,
      canJoin: result.canJoin,
      cannotJoinReason: result.cannotJoinReason,
      serverTime: now,
    });

    if (!tx || !canJoin || isParticipant) {
      return finalize({ canJoin, cannotJoinReason });
    }

    return this.resolvePreviewJoinability(tx, currentUserId).then((result) =>
      finalize(result),
    );
  }

  private async getInvitationByToken(
    tx: BattleTransactionClient,
    invitationToken: string,
  ) {
    return tx.battleInvitation.findUnique({
      where: { token: invitationToken },
      select: {
        id: true,
        battleRoomId: true,
        inviterUserId: true,
        inviteeUserId: true,
        token: true,
        inviteCode: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        cancelledAt: true,
        inviterUser: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
        battleRoom: {
          select: {
            id: true,
            mode: true,
            status: true,
            expiresAt: true,
            participants: {
              select: {
                userId: true,
                seat: true,
              },
            },
          },
        },
      },
    }) as Promise<InvitationRecord | null>;
  }

  private async getInvitationByInviteCode(
    tx: BattleTransactionClient,
    inviteCode: string,
  ) {
    return tx.battleInvitation.findUnique({
      where: {
        inviteCode: inviteCode.trim().toUpperCase(),
      },
      select: {
        id: true,
        battleRoomId: true,
        inviterUserId: true,
        inviteeUserId: true,
        token: true,
        inviteCode: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        cancelledAt: true,
        inviterUser: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
        battleRoom: {
          select: {
            id: true,
            mode: true,
            status: true,
            expiresAt: true,
            participants: {
              select: {
                userId: true,
                seat: true,
              },
            },
          },
        },
      },
    }) as Promise<InvitationRecord | null>;
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2002'
    );
  }

  private async resolvePreviewJoinability(
    tx: BattleTransactionClient,
    userId: string,
  ) {
    const activeBattle = await this.battleDomainService.getActiveBattleForUser(
      userId,
      tx,
    );

    if (activeBattle) {
      return {
        canJoin: false,
        cannotJoinReason: BATTLE_ERROR_CODES.BATTLE_ALREADY_ACTIVE,
      };
    }

    try {
      await this.battleDomainService.assertUserNotSearching(userId, tx);
      return {
        canJoin: true,
        cannotJoinReason: null,
      };
    } catch {
      return {
        canJoin: false,
        cannotJoinReason: BATTLE_ERROR_CODES.BATTLE_ALREADY_MATCHING,
      };
    }
  }
}
