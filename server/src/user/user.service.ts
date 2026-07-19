import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserStatus } from '../../generated/prisma/enums';
import { type CurrentUserContext } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { toPublicUser } from './user.types';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateCurrentUser(
    currentUser: CurrentUserContext,
    dto: UpdateCurrentUserDto,
  ) {
    if (dto.nickname === undefined && dto.avatarUrl === undefined) {
      throw new BadRequestException('INVALID_PARAMETER');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: currentUser.id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    this.assertUserIsEditable(user.status, user.deletedAt);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...(dto.nickname !== undefined ? { nickname: dto.nickname } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
    });

    return {
      success: true as const,
      data: toPublicUser(updatedUser),
    };
  }

  async deleteCurrentUser(
    currentUser: CurrentUserContext,
    dto: DeleteAccountDto,
  ) {
    if (dto.confirmation !== 'DELETE') {
      throw new BadRequestException('INVALID_PARAMETER');
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: currentUser.id,
        },
      });

      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      if (user.deletedAt || user.status === UserStatus.DELETED) {
        throw new ForbiddenException('USER_DELETED');
      }

      if (user.status === UserStatus.DISABLED) {
        throw new ForbiddenException('USER_DISABLED');
      }

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: UserStatus.DELETED,
          deletedAt: now,
        },
      });

      await tx.userSession.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
          lastUsedAt: now,
        },
      });
    });

    return {
      success: true as const,
      data: {},
    };
  }

  private assertUserIsEditable(status: UserStatus, deletedAt: Date | null) {
    if (deletedAt || status === UserStatus.DELETED) {
      throw new ForbiddenException('USER_DELETED');
    }

    if (status === UserStatus.DISABLED) {
      throw new ForbiddenException('USER_DISABLED');
    }
  }
}
