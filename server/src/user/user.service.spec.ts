/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserStatus } from '../../generated/prisma/enums';
import { UserService } from './user.service';

type UserRecord = {
  id: string;
  openId: string;
  unionId: string | null;
  nickname: string | null;
  avatarUrl: string | null;
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

function createMockPrisma() {
  const users = new Map<string, UserRecord>();
  const sessions = new Map<string, SessionRecord>();

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
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        return (
          [...users.values()].find(
            (user) =>
              user.id === where.id &&
              (where.deletedAt === undefined ||
                user.deletedAt === where.deletedAt),
          ) ?? null
        );
      }),
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
  };
}

function createService() {
  const { prisma, users, sessions } = createMockPrisma();
  const service = new UserService(prisma as any);

  return { service, prisma, users, sessions };
}

describe('UserService', () => {
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
    expect(users.get(otherUser.id)?.avatarUrl).toBe(
      'https://cdn.example.com/other.png',
    );
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
});
