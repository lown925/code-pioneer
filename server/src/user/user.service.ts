import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CommunityPostStatus, UserStatus } from '../../generated/prisma/enums';
import { type CurrentUserContext } from '../auth/auth.types';
import { isCommunityAvailable } from '../community/community-availability';
import { previewCommunityText } from '../community/community.utils';
import { getUploadStorageRoot } from '../environment/environment.config';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UserFollowListQueryDto } from './dto/user-follow-list-query.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import {
  type PublicUserProfile,
  type UserFollowListItem,
  toPublicUser,
} from './user.types';

const FOLLOW_LIST_DEFAULT_PAGE = 1;
const FOLLOW_LIST_DEFAULT_PAGE_SIZE = 20;
const USER_PROFILE_RECENT_POST_LIMIT = 3;
const USER_AVATAR_UPLOAD_DIR = join(getUploadStorageRoot(), 'avatars');
const USER_AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024;
const USER_AVATAR_EXTENSIONS = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

type UserProfileCommunityPostRecord = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  favoriteCount: number;
  commentCount: number;
  viewCount: number;
  category: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    sortOrder: number;
  };
};

type UploadedUserAvatarFile = {
  buffer: Buffer;
  size: number;
  mimetype: string;
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadCurrentUserAvatar(
    currentUser: CurrentUserContext,
    file: UploadedUserAvatarFile,
    publicBaseUrl: string,
  ) {
    const extension = USER_AVATAR_EXTENSIONS.get(file.mimetype);

    if (!extension) {
      throw new BadRequestException('USER_AVATAR_TYPE_INVALID');
    }

    if (!file.buffer || file.size <= 0) {
      throw new BadRequestException('USER_AVATAR_FILE_REQUIRED');
    }

    if (file.size > USER_AVATAR_MAX_SIZE_BYTES) {
      throw new BadRequestException('USER_AVATAR_TOO_LARGE');
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

    const userDirectory = join(USER_AVATAR_UPLOAD_DIR, currentUser.id);
    const filename = `${Date.now()}-${randomUUID()}${extension}`;
    const absolutePath = join(userDirectory, filename);

    await fs.mkdir(userDirectory, { recursive: true });
    await fs.writeFile(absolutePath, file.buffer);

    return {
      success: true as const,
      data: {
        avatarUrl: `${publicBaseUrl}/uploads/avatars/${currentUser.id}/${filename}`,
      },
    };
  }

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

  async getUserProfile(viewer: CurrentUserContext | null, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        status: UserStatus.NORMAL,
      },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        battleRating: true,
        battleProfile: {
          select: {
            totalBattles: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const [viewerHasFollowed, followingCount, followerCount] =
      await Promise.all([
        viewer && viewer.id !== user.id
          ? this.prisma.userFollow
              .findUnique({
                where: {
                  followerUserId_followedUserId: {
                    followerUserId: viewer.id,
                    followedUserId: user.id,
                  },
                },
                select: {
                  id: true,
                },
              })
              .then((record) => Boolean(record))
          : Promise.resolve(false),
        this.prisma.userFollow.count({
          where: {
            followerUserId: user.id,
          },
        }),
        this.prisma.userFollow.count({
          where: {
            followedUserId: user.id,
          },
        }),
      ]);

    let postCount = 0;
    let recentPosts: UserProfileCommunityPostRecord[] = [];

    if (isCommunityAvailable()) {
      [postCount, recentPosts] = await Promise.all([
        this.prisma.communityPost.count({
          where: {
            authorId: user.id,
            status: CommunityPostStatus.PUBLISHED,
            deletedAt: null,
          },
        }),
        this.prisma.communityPost.findMany({
          where: {
            authorId: user.id,
            status: CommunityPostStatus.PUBLISHED,
            deletedAt: null,
          },
          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],
          take: USER_PROFILE_RECENT_POST_LIMIT,
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            favoriteCount: true,
            commentCount: true,
            viewCount: true,
            category: {
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
                sortOrder: true,
              },
            },
          },
        }),
      ]);
    }

    return {
      success: true as const,
      data: {
        userId: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        battleRating: user.battleRating,
        totalBattles: user.battleProfile?.totalBattles ?? 0,
        followingCount,
        followerCount,
        wrongQuestionCount: 0,
        postCount,
        viewerIsSelf: viewer?.id === user.id,
        viewerHasFollowed,
        recentPosts: recentPosts.map((post) => ({
          postId: post.id,
          title: post.title,
          contentPreview: previewCommunityText(post.content),
          createdAt: post.createdAt,
          category: {
            id: post.category.id,
            key: post.category.key,
            name: post.category.name,
            description: post.category.description,
            sortOrder: post.category.sortOrder,
          },
          favoriteCount: post.favoriteCount,
          commentCount: post.commentCount,
          viewCount: post.viewCount,
        })),
      } satisfies PublicUserProfile,
    };
  }

  async followUser(currentUser: CurrentUserContext, targetUserId: string) {
    const targetUser = await this.assertFollowableUser(targetUserId);

    if (targetUser.id === currentUser.id) {
      throw new BadRequestException('USER_FOLLOW_SELF_NOT_ALLOWED');
    }

    await this.prisma.userFollow.createMany({
      data: [
        {
          followerUserId: currentUser.id,
          followedUserId: targetUser.id,
        },
      ],
      skipDuplicates: true,
    });

    return {
      success: true as const,
      data: {
        userId: targetUser.id,
        followed: true,
      },
    };
  }

  async unfollowUser(currentUser: CurrentUserContext, targetUserId: string) {
    const targetUser = await this.assertFollowableUser(targetUserId);

    if (targetUser.id === currentUser.id) {
      throw new BadRequestException('USER_FOLLOW_SELF_NOT_ALLOWED');
    }

    await this.prisma.userFollow.deleteMany({
      where: {
        followerUserId: currentUser.id,
        followedUserId: targetUser.id,
      },
    });

    return {
      success: true as const,
      data: {
        userId: targetUser.id,
        followed: false,
      },
    };
  }

  async getFollowingUsers(
    viewer: CurrentUserContext | null,
    userId: string,
    query: UserFollowListQueryDto,
  ) {
    await this.assertVisibleUser(userId);
    return this.getFollowList({
      viewerUserId: viewer?.id ?? null,
      ownerUserId: userId,
      page: query.page,
      pageSize: query.pageSize,
      relation: 'following',
    });
  }

  async getFollowerUsers(
    viewer: CurrentUserContext | null,
    userId: string,
    query: UserFollowListQueryDto,
  ) {
    await this.assertVisibleUser(userId);
    return this.getFollowList({
      viewerUserId: viewer?.id ?? null,
      ownerUserId: userId,
      page: query.page,
      pageSize: query.pageSize,
      relation: 'followers',
    });
  }

  private assertUserIsEditable(status: UserStatus, deletedAt: Date | null) {
    if (deletedAt || status === UserStatus.DELETED) {
      throw new ForbiddenException('USER_DELETED');
    }

    if (status === UserStatus.DISABLED) {
      throw new ForbiddenException('USER_DISABLED');
    }
  }

  private async assertVisibleUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        status: UserStatus.NORMAL,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    return user;
  }

  private async assertFollowableUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        status: UserStatus.NORMAL,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    return user;
  }

  private async getFollowList(options: {
    viewerUserId: string | null;
    ownerUserId: string;
    page?: number;
    pageSize?: number;
    relation: 'following' | 'followers';
  }) {
    const page = options.page ?? FOLLOW_LIST_DEFAULT_PAGE;
    const pageSize = options.pageSize ?? FOLLOW_LIST_DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const where =
      options.relation === 'following'
        ? {
            followerUserId: options.ownerUserId,
            followedUser: {
              deletedAt: null,
              status: UserStatus.NORMAL,
            },
          }
        : {
            followedUserId: options.ownerUserId,
            followerUser: {
              deletedAt: null,
              status: UserStatus.NORMAL,
            },
          };

    const [total, users] = await Promise.all([
      this.prisma.userFollow.count({ where }),
      options.relation === 'following'
        ? this.prisma.userFollow
            .findMany({
              where,
              orderBy: [
                {
                  createdAt: 'desc',
                },
                {
                  id: 'desc',
                },
              ],
              skip,
              take: pageSize,
              select: {
                followedUser: {
                  select: {
                    id: true,
                    nickname: true,
                    avatarUrl: true,
                    battleRating: true,
                  },
                },
              },
            })
            .then((records) => records.map((record) => record.followedUser))
        : this.prisma.userFollow
            .findMany({
              where,
              orderBy: [
                {
                  createdAt: 'desc',
                },
                {
                  id: 'desc',
                },
              ],
              skip,
              take: pageSize,
              select: {
                followerUser: {
                  select: {
                    id: true,
                    nickname: true,
                    avatarUrl: true,
                    battleRating: true,
                  },
                },
              },
            })
            .then((records) => records.map((record) => record.followerUser)),
    ]);

    const visibleUsers = users.filter(
      (user): user is NonNullable<typeof user> => Boolean(user),
    );
    const userIds = visibleUsers.map((user) => user.id);
    const viewerFollowedSet =
      options.viewerUserId && userIds.length > 0
        ? await this.prisma.userFollow
            .findMany({
              where: {
                followerUserId: options.viewerUserId,
                followedUserId: {
                  in: userIds,
                },
              },
              select: {
                followedUserId: true,
              },
            })
            .then(
              (followed) =>
                new Set(followed.map((item) => item.followedUserId)),
            )
        : new Set<string>();

    const items = visibleUsers.map(
      (user) =>
        ({
          userId: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          battleRating: user.battleRating,
          isFollowedByViewer:
            options.viewerUserId === user.id
              ? false
              : viewerFollowedSet.has(user.id),
        }) satisfies UserFollowListItem,
    );

    return {
      success: true as const,
      data: {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        },
      },
    };
  }
}
