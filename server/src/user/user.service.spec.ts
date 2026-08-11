/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { CommunityPostStatus, UserStatus } from '../../generated/prisma/enums';
import { UserService } from './user.service';

const originalAppEnvironment = process.env.APP_ENV;

type UserRecord = {
  id: string;
  openId: string;
  unionId: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  major: string | null;
  grade: string | null;
  learningDirection: string | null;
  technicalInterests: string[];
  careerDirection: string | null;
  status: UserStatus;
  experience: number;
  battleRating: number;
  continuousLearningDays: number;
  lastLearningDate: Date | null;
  lastLoginAt: Date | null;
  disabledReason: string | null;
  disabledAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type SessionRecord = {
  id: string;
  userId: string;
  refreshTokenHash: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserFollowRecord = {
  id: string;
  followerUserId: string;
  followedUserId: string;
  createdAt: Date;
};

type CommunityPostRecord = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  status: CommunityPostStatus;
  favoriteCount: number;
  commentCount: number;
  viewCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  category: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    sortOrder: number;
  };
};

function createMockPrisma() {
  const users = new Map<string, UserRecord>();
  const sessions = new Map<string, SessionRecord>();
  const follows = new Map<string, UserFollowRecord>();
  const posts = new Map<string, CommunityPostRecord>();

  const followKey = (followerUserId: string, followedUserId: string) =>
    `${followerUserId}:${followedUserId}`;

  const prisma = {
    user: {
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const user: UserRecord = {
          id: data.id ?? randomUUID(),
          openId: data.openId ?? `mock-openid-${randomUUID()}`,
          unionId: data.unionId ?? null,
          nickname: data.nickname ?? null,
          avatarUrl: data.avatarUrl ?? null,
          major: data.major ?? null,
          grade: data.grade ?? null,
          learningDirection: data.learningDirection ?? null,
          technicalInterests: data.technicalInterests ?? [],
          careerDirection: data.careerDirection ?? null,
          status: data.status ?? UserStatus.NORMAL,
          experience: data.experience ?? 0,
          battleRating: data.battleRating ?? 1000,
          continuousLearningDays: data.continuousLearningDays ?? 0,
          lastLearningDate: data.lastLearningDate ?? null,
          lastLoginAt: data.lastLoginAt ?? null,
          disabledReason: data.disabledReason ?? null,
          disabledAt: data.disabledAt ?? null,
          deletedAt: data.deletedAt ?? null,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
        };

        users.set(user.id, user);
        return user;
      }),
      findFirst: jest.fn(
        async ({ where, select }: { where: any; select?: any }) => {
          const user =
            [...users.values()].find((item) => {
              if (where.id !== undefined && item.id !== where.id) {
                return false;
              }

              if (
                where.deletedAt !== undefined &&
                item.deletedAt !== where.deletedAt
              ) {
                return false;
              }

              if (where.status !== undefined) {
                if (
                  typeof where.status === 'object' &&
                  where.status.not !== undefined
                ) {
                  if (item.status === where.status.not) {
                    return false;
                  }
                } else if (item.status !== where.status) {
                  return false;
                }
              }

              return true;
            }) ?? null;

          if (!user || !select) {
            return user;
          }

          return buildSelectedUser(user, select, follows);
        },
      ),
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        if (where.id) {
          return users.get(where.id) ?? null;
        }

        return null;
      }),
      update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
        const existing = users.get(where.id);

        if (!existing) {
          throw new Error('User not found');
        }

        const updated: UserRecord = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };

        users.set(updated.id, updated);
        return updated;
      }),
    },
    userSession: {
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const session: SessionRecord = {
          id: data.id ?? randomUUID(),
          userId: data.userId,
          refreshTokenHash: data.refreshTokenHash ?? null,
          expiresAt: data.expiresAt ?? new Date(now.getTime() + 60_000),
          revokedAt: data.revokedAt ?? null,
          lastUsedAt: data.lastUsedAt ?? null,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
        };

        sessions.set(session.id, session);
        return session;
      }),
      updateMany: jest.fn(
        async ({ where, data }: { where: any; data: any }) => {
          let count = 0;

          for (const [id, session] of sessions.entries()) {
            if (
              session.userId === where.userId &&
              (where.revokedAt === undefined ||
                session.revokedAt === where.revokedAt)
            ) {
              sessions.set(id, {
                ...session,
                ...data,
                updatedAt: new Date(),
              });
              count += 1;
            }
          }

          return { count };
        },
      ),
    },
    userFollow: {
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        const relation = where.followerUserId_followedUserId;
        if (!relation) {
          return null;
        }

        return (
          follows.get(
            followKey(relation.followerUserId, relation.followedUserId),
          ) ?? null
        );
      }),
      createMany: jest.fn(
        async ({
          data,
        }: {
          data: Array<{ followerUserId: string; followedUserId: string }>;
        }) => {
          let count = 0;

          data.forEach((item) => {
            const key = followKey(item.followerUserId, item.followedUserId);
            if (follows.has(key)) {
              return;
            }

            follows.set(key, {
              id: randomUUID(),
              followerUserId: item.followerUserId,
              followedUserId: item.followedUserId,
              createdAt: new Date(),
            });
            count += 1;
          });

          return { count };
        },
      ),
      deleteMany: jest.fn(async ({ where }: { where: any }) => {
        let count = 0;

        for (const [key, follow] of follows.entries()) {
          if (
            follow.followerUserId === where.followerUserId &&
            follow.followedUserId === where.followedUserId
          ) {
            follows.delete(key);
            count += 1;
          }
        }

        return { count };
      }),
      count: jest.fn(async ({ where }: { where: any }) => {
        return [...follows.values()].filter((follow) => {
          if (
            where.followerUserId !== undefined &&
            follow.followerUserId !== where.followerUserId
          ) {
            return false;
          }

          if (
            where.followedUserId !== undefined &&
            follow.followedUserId !== where.followedUserId
          ) {
            return false;
          }

          return true;
        }).length;
      }),
      findMany: jest.fn(
        async ({ where, select }: { where: any; select: any }) => {
          if (where.followedUserId?.in) {
            return [...follows.values()]
              .filter(
                (follow) =>
                  follow.followerUserId === where.followerUserId &&
                  where.followedUserId.in.includes(follow.followedUserId),
              )
              .map((follow) => ({
                followedUserId: follow.followedUserId,
              }));
          }

          const filtered = [...follows.values()].filter((follow) => {
            if (
              where.followerUserId !== undefined &&
              follow.followerUserId !== where.followerUserId
            ) {
              return false;
            }

            if (
              where.followedUserId !== undefined &&
              follow.followedUserId !== where.followedUserId
            ) {
              return false;
            }

            return true;
          });

          return filtered.map((follow) => {
            if (select.followedUser) {
              return {
                followedUser: buildSelectedUser(
                  users.get(follow.followedUserId)!,
                  select.followedUser.select,
                  follows,
                ),
              };
            }

            return {
              followerUser: buildSelectedUser(
                users.get(follow.followerUserId)!,
                select.followerUser.select,
                follows,
              ),
            };
          });
        },
      ),
    },
    communityPost: {
      count: jest.fn(async ({ where }: { where: any }) => {
        return [...posts.values()].filter((post) => {
          if (
            where.authorId !== undefined &&
            post.authorId !== where.authorId
          ) {
            return false;
          }

          if (where.status !== undefined && post.status !== where.status) {
            return false;
          }

          if (where.deletedAt === null && post.deletedAt !== null) {
            return false;
          }

          return true;
        }).length;
      }),
      findMany: jest.fn(
        async ({ where, take }: { where: any; take?: number }) => {
          return [...posts.values()]
            .filter((post) => {
              if (
                where.authorId !== undefined &&
                post.authorId !== where.authorId
              ) {
                return false;
              }

              if (where.status !== undefined && post.status !== where.status) {
                return false;
              }

              if (where.deletedAt === null && post.deletedAt !== null) {
                return false;
              }

              return true;
            })
            .sort(
              (left, right) =>
                right.createdAt.getTime() - left.createdAt.getTime(),
            )
            .slice(0, take ?? Number.MAX_SAFE_INTEGER);
        },
      ),
    },
  };

  const transactionClient = {
    user: prisma.user,
    userSession: prisma.userSession,
  };

  return {
    prisma: {
      ...prisma,
      $transaction: jest.fn(
        async (
          callback: (client: typeof transactionClient) => Promise<unknown>,
        ) => callback(transactionClient),
      ),
    },
    users,
    sessions,
    follows,
    posts,
  };
}

function buildSelectedUser(
  user: UserRecord,
  select: Record<string, any>,
  follows: Map<string, UserFollowRecord>,
) {
  const output: Record<string, unknown> = {};

  Object.entries(select).forEach(([key, value]) => {
    if (value === true) {
      output[key] = (user as Record<string, unknown>)[key];
      return;
    }

    if (key === 'battleProfile' && value.select) {
      output[key] = {
        totalBattles: 0,
      };
      return;
    }

    if (key === '_count' && value.select) {
      output[key] = {
        followingRelations: [...follows.values()].filter(
          (follow) => follow.followerUserId === user.id,
        ).length,
        followerRelations: [...follows.values()].filter(
          (follow) => follow.followedUserId === user.id,
        ).length,
      };
    }
  });

  return output;
}

function createService() {
  const { prisma, users, sessions, follows, posts } = createMockPrisma();
  const service = new UserService(prisma as any);

  return { service, prisma, users, sessions, follows, posts };
}

describe('UserService', () => {
  beforeEach(() => {
    process.env.APP_ENV = 'test';
  });

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalAppEnvironment === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = originalAppEnvironment;
    }
  });

  it('stores a valid avatar and returns a stable public URL', async () => {
    const { service, prisma } = createService();
    const currentUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-avatar-upload',
      },
    });
    const mkdirSpy = jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    const writeFileSpy = jest
      .spyOn(fs, 'writeFile')
      .mockResolvedValue(undefined);

    const result = await service.uploadCurrentUserAvatar(
      {
        id: currentUser.id,
        sessionId: 'session-id',
        tokenType: 'USER',
        role: 'NORMAL',
      },
      {
        buffer: Buffer.from('avatar-content'),
        size: 14,
        mimetype: 'image/png',
      },
      'https://api.example.com',
    );

    expect(result.data.avatarUrl).toMatch(
      new RegExp(
        `^https://api\\.example\\.com/uploads/avatars/${currentUser.id}/.+\\.png$`,
      ),
    );
    expect(mkdirSpy).toHaveBeenCalledWith(
      expect.stringContaining(currentUser.id),
      { recursive: true },
    );
    expect(writeFileSpy).toHaveBeenCalledWith(
      expect.stringContaining('.png'),
      Buffer.from('avatar-content'),
    );
  });

  it.each([
    {
      file: {
        buffer: Buffer.from('avatar'),
        size: 6,
        mimetype: 'image/gif',
      },
      code: 'USER_AVATAR_TYPE_INVALID',
    },
    {
      file: {
        buffer: Buffer.alloc(0),
        size: 0,
        mimetype: 'image/png',
      },
      code: 'USER_AVATAR_FILE_REQUIRED',
    },
    {
      file: {
        buffer: Buffer.alloc(1),
        size: 2 * 1024 * 1024 + 1,
        mimetype: 'image/jpeg',
      },
      code: 'USER_AVATAR_TOO_LARGE',
    },
  ])('rejects invalid avatar uploads with $code', async ({ file, code }) => {
    const { service, prisma } = createService();
    const currentUser = await prisma.user.create({
      data: {
        openId: `mock-openid-${code}`,
      },
    });

    await expect(
      service.uploadCurrentUserAvatar(
        {
          id: currentUser.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        file,
        'https://api.example.com',
      ),
    ).rejects.toMatchObject({
      response: {
        message: code,
      },
    });
  });

  it('rejects avatar uploads when the current user is missing', async () => {
    const { service } = createService();

    await expect(
      service.uploadCurrentUserAvatar(
        {
          id: 'missing-user',
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        {
          buffer: Buffer.from('avatar'),
          size: 6,
          mimetype: 'image/webp',
        },
        'https://api.example.com',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects avatar uploads for disabled users', async () => {
    const { service, prisma } = createService();
    const currentUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-disabled-avatar',
        status: UserStatus.DISABLED,
      },
    });

    await expect(
      service.uploadCurrentUserAvatar(
        {
          id: currentUser.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        {
          buffer: Buffer.from('avatar'),
          size: 6,
          mimetype: 'image/jpeg',
        },
        'https://api.example.com',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates only the current user public fields', async () => {
    const { service, prisma, users } = createService();
    const currentUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-1',
        nickname: '旧昵称',
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-2',
        nickname: '其他用户',
        avatarUrl: 'https://cdn.example.com/other.png',
      },
    });

    const result = await service.updateCurrentUser(
      {
        id: currentUser.id,
        sessionId: 'session-id',
        tokenType: 'USER',
        role: 'NORMAL',
      },
      {
        nickname: '新昵称',
        avatarUrl: 'https://cdn.example.com/avatar.png',
      },
    );

    expect(result).toEqual({
      success: true,
      data: {
        id: currentUser.id,
        nickname: '新昵称',
        avatarUrl: 'https://cdn.example.com/avatar.png',
        major: null,
        grade: null,
        learningDirection: null,
        technicalInterests: [],
        careerDirection: null,
        status: UserStatus.NORMAL,
        experience: 0,
        battleRating: 1000,
        continuousLearningDays: 0,
        lastLoginAt: null,
        createdAt: currentUser.createdAt,
      },
    });
    expect(users.get(currentUser.id)?.nickname).toBe('新昵称');
    expect(users.get(currentUser.id)?.avatarUrl).toBe(
      'https://cdn.example.com/avatar.png',
    );
    expect(users.get(otherUser.id)?.nickname).toBe('其他用户');
  });

  it('returns empty Growth fields for an existing user without a profile', async () => {
    const { service, prisma } = createService();
    const user = await prisma.user.create({
      data: {
        openId: 'mock-openid-empty-growth-profile',
      },
    });

    const result = await service.getCurrentUser({
      id: user.id,
      sessionId: 'session-id',
      tokenType: 'USER',
      role: 'NORMAL',
    });

    expect(result.data).toMatchObject({
      id: user.id,
      major: null,
      grade: null,
      learningDirection: null,
      technicalInterests: [],
      careerDirection: null,
    });
  });

  it('creates and overwrites only the current user Growth profile', async () => {
    const { service, prisma, users } = createService();
    const currentUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-growth-owner',
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-growth-other',
        major: 'major.artificial_intelligence',
        technicalInterests: ['interest.ai_ml'],
      },
    });
    const currentUserContext = {
      id: currentUser.id,
      sessionId: 'session-id',
      tokenType: 'USER' as const,
      role: 'NORMAL' as const,
    };

    await service.updateCurrentUser(currentUserContext, {
      major: 'major.computer_science',
      grade: 'grade.freshman',
      learningDirection: 'direction.backend',
      technicalInterests: ['interest.python', 'custom:Power BI'],
      careerDirection: 'career.backend_engineer',
    });
    const updated = await service.updateCurrentUser(currentUserContext, {
      major: 'custom:金融工程',
      technicalInterests: ['interest.sql'],
    });

    expect(updated.data).toMatchObject({
      major: 'custom:金融工程',
      grade: 'grade.freshman',
      learningDirection: 'direction.backend',
      technicalInterests: ['interest.sql'],
      careerDirection: 'career.backend_engineer',
    });
    expect(users.get(otherUser.id)).toMatchObject({
      major: 'major.artificial_intelligence',
      technicalInterests: ['interest.ai_ml'],
    });
  });

  it('clears Growth scalar fields with null and interests with an empty array', async () => {
    const { service, prisma } = createService();
    const user = await prisma.user.create({
      data: {
        openId: 'mock-openid-growth-clear',
        major: 'major.software_engineering',
        grade: 'grade.senior',
        learningDirection: 'direction.frontend',
        technicalInterests: ['interest.javascript'],
        careerDirection: 'career.frontend_engineer',
      },
    });

    const result = await service.updateCurrentUser(
      {
        id: user.id,
        sessionId: 'session-id',
        tokenType: 'USER',
        role: 'NORMAL',
      },
      {
        major: null,
        grade: null,
        learningDirection: null,
        technicalInterests: [],
        careerDirection: null,
      },
    );

    expect(result.data).toMatchObject({
      major: null,
      grade: null,
      learningDirection: null,
      technicalInterests: [],
      careerDirection: null,
    });
  });

  it('rejects empty profile updates', async () => {
    const { service } = createService();

    await expect(
      service.updateCurrentUser(
        {
          id: 'missing-user',
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        {},
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects updates when the current user is missing', async () => {
    const { service } = createService();

    await expect(
      service.updateCurrentUser(
        {
          id: 'missing-user',
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        {
          nickname: '码站学员',
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects updates for disabled users', async () => {
    const { service, prisma } = createService();
    const user = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-3',
        status: UserStatus.DISABLED,
      },
    });

    await expect(
      service.updateCurrentUser(
        {
          id: user.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        {
          nickname: '码站学员',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('soft deletes the current user and revokes all of their sessions', async () => {
    const { service, prisma, users, sessions } = createService();
    const currentUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-4',
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-5',
      },
    });

    const currentSessionOne = await prisma.userSession.create({
      data: {
        userId: currentUser.id,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const currentSessionTwo = await prisma.userSession.create({
      data: {
        userId: currentUser.id,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const otherSession = await prisma.userSession.create({
      data: {
        userId: otherUser.id,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    await expect(
      service.deleteCurrentUser(
        {
          id: currentUser.id,
          sessionId: currentSessionOne.id,
          tokenType: 'USER',
          role: 'NORMAL',
        },
        {
          confirmation: 'DELETE',
        },
      ),
    ).resolves.toEqual({
      success: true,
      data: {},
    });

    expect(users.get(currentUser.id)?.status).toBe(UserStatus.DELETED);
    expect(users.get(currentUser.id)?.deletedAt).toEqual(expect.any(Date));
    expect(sessions.get(currentSessionOne.id)?.revokedAt).toEqual(
      expect.any(Date),
    );
    expect(sessions.get(currentSessionTwo.id)?.revokedAt).toEqual(
      expect.any(Date),
    );
    expect(sessions.get(otherSession.id)?.revokedAt).toBeNull();
  });

  it('rejects account deletion for already deleted users', async () => {
    const { service, prisma } = createService();
    const user = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-6',
        status: UserStatus.DELETED,
        deletedAt: new Date('2026-07-19T00:00:00.000Z'),
      },
    });

    await expect(
      service.deleteCurrentUser(
        {
          id: user.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        {
          confirmation: 'DELETE',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows following and unfollowing another user idempotently', async () => {
    const { service, prisma, follows } = createService();
    const currentUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-follow-1',
      },
    });
    const targetUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-follow-2',
      },
    });

    await expect(
      service.followUser(
        {
          id: currentUser.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        targetUser.id,
      ),
    ).resolves.toEqual({
      success: true,
      data: {
        userId: targetUser.id,
        followed: true,
      },
    });

    await expect(
      service.followUser(
        {
          id: currentUser.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        targetUser.id,
      ),
    ).resolves.toEqual({
      success: true,
      data: {
        userId: targetUser.id,
        followed: true,
      },
    });

    expect(follows.size).toBe(1);

    await expect(
      service.unfollowUser(
        {
          id: currentUser.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        targetUser.id,
      ),
    ).resolves.toEqual({
      success: true,
      data: {
        userId: targetUser.id,
        followed: false,
      },
    });

    await expect(
      service.unfollowUser(
        {
          id: currentUser.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        targetUser.id,
      ),
    ).resolves.toEqual({
      success: true,
      data: {
        userId: targetUser.id,
        followed: false,
      },
    });
  });

  it('rejects following self', async () => {
    const { service, prisma } = createService();
    const currentUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-user-service-follow-self',
      },
    });

    await expect(
      service.followUser(
        {
          id: currentUser.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        currentUser.id,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each(['development', 'test'] as const)(
    'aggregates public user profile and Community posts in APP_ENV=%s',
    async (appEnvironment) => {
      process.env.APP_ENV = appEnvironment;
      const { service, prisma, follows, posts } = createService();
      const viewer = await prisma.user.create({
        data: {
          openId: 'mock-openid-user-service-profile-viewer',
          nickname: '查看者',
        },
      });
      const author = await prisma.user.create({
        data: {
          openId: 'mock-openid-user-service-profile-author',
          nickname: '发帖用户',
          battleRating: 1210,
        },
      });

      follows.set(`${viewer.id}:${author.id}`, {
        id: randomUUID(),
        followerUserId: viewer.id,
        followedUserId: author.id,
        createdAt: new Date(),
      });

      posts.set(randomUUID(), {
        id: randomUUID(),
        authorId: author.id,
        title: '第一篇帖子',
        content: '这是一段用于生成摘要的帖子内容',
        status: CommunityPostStatus.PUBLISHED,
        favoriteCount: 3,
        commentCount: 2,
        viewCount: 10,
        deletedAt: null,
        createdAt: new Date('2026-07-30T09:00:00.000Z'),
        category: {
          id: randomUUID(),
          key: 'GENERAL',
          name: '综合交流',
          description: null,
          sortOrder: 1,
        },
      });

      const result = await service.getUserProfile(
        {
          id: viewer.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        author.id,
      );

      expect(result.success).toBe(true);
      expect(result.data.userId).toBe(author.id);
      expect(result.data.viewerHasFollowed).toBe(true);
      expect(result.data.viewerIsSelf).toBe(false);
      expect(result.data.recentPosts).toHaveLength(1);
      expect(result.data.postCount).toBe(1);
    },
  );

  it.each(['production', 'trial'] as const)(
    'keeps public profile fields but omits Community posts in APP_ENV=%s',
    async (appEnvironment) => {
      process.env.APP_ENV = appEnvironment;
      const { service, prisma, follows, posts } = createService();
      const viewer = await prisma.user.create({
        data: {
          openId: `mock-openid-${appEnvironment}-profile-viewer`,
          nickname: '查看者',
        },
      });
      const author = await prisma.user.create({
        data: {
          openId: `mock-openid-${appEnvironment}-profile-author`,
          nickname: '目标用户',
          avatarUrl: 'https://cdn.example.com/avatar.png',
          battleRating: 1210,
          major: 'major.computer_science',
          grade: 'grade.junior',
          learningDirection: 'direction.backend',
          technicalInterests: ['interest.python'],
          careerDirection: 'career.backend_engineer',
        },
      });

      follows.set(`${viewer.id}:${author.id}`, {
        id: randomUUID(),
        followerUserId: viewer.id,
        followedUserId: author.id,
        createdAt: new Date(),
      });
      posts.set(randomUUID(), {
        id: randomUUID(),
        authorId: author.id,
        title: '不可公开的历史帖子',
        content: '正式环境不应查询或返回这段内容',
        status: CommunityPostStatus.PUBLISHED,
        favoriteCount: 3,
        commentCount: 2,
        viewCount: 10,
        deletedAt: null,
        createdAt: new Date('2026-07-30T09:00:00.000Z'),
        category: {
          id: randomUUID(),
          key: 'GENERAL',
          name: '综合交流',
          description: null,
          sortOrder: 1,
        },
      });

      const result = await service.getUserProfile(
        {
          id: viewer.id,
          sessionId: 'session-id',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        author.id,
      );

      expect(result.data).toMatchObject({
        userId: author.id,
        nickname: '目标用户',
        avatarUrl: 'https://cdn.example.com/avatar.png',
        battleRating: 1210,
        followingCount: 0,
        followerCount: 1,
        postCount: 0,
        recentPosts: [],
        viewerHasFollowed: true,
        viewerIsSelf: false,
      });
      expect(prisma.communityPost.count).not.toHaveBeenCalled();
      expect(prisma.communityPost.findMany).not.toHaveBeenCalled();
      expect(result.data).not.toHaveProperty('major');
      expect(result.data).not.toHaveProperty('grade');
      expect(result.data).not.toHaveProperty('learningDirection');
      expect(result.data).not.toHaveProperty('technicalInterests');
      expect(result.data).not.toHaveProperty('careerDirection');
    },
  );
});
