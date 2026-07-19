/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { UserStatus } from '../../generated/prisma/enums';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';

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
  lastLoginAt: Date | null;
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
  user?: UserRecord | null;
};

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  AUTH_MOCK_ENABLED: process.env.AUTH_MOCK_ENABLED,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
};

function restoreEnv(key: keyof typeof originalEnv) {
  const value = originalEnv[key];

  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

function createMockPrisma() {
  const users = new Map<string, UserRecord>();
  const sessions = new Map<string, SessionRecord>();

  const prisma = {
    user: {
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        if (where.id) {
          return users.get(where.id) ?? null;
        }

        if (where.openId) {
          return (
            [...users.values()].find((user) => user.openId === where.openId) ??
            null
          );
        }

        return null;
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const user: UserRecord = {
          id: randomUUID(),
          openId: data.openId,
          unionId: data.unionId ?? null,
          nickname: data.nickname ?? null,
          avatarUrl: data.avatarUrl ?? null,
          status: data.status ?? UserStatus.NORMAL,
          experience: data.experience ?? 0,
          battleRating: data.battleRating ?? 1000,
          continuousLearningDays: data.continuousLearningDays ?? 0,
          lastLoginAt: data.lastLoginAt ?? null,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
        };

        users.set(user.id, user);
        return user;
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
      findFirst: jest.fn(),
    },
    userSession: {
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const session: SessionRecord = {
          id: randomUUID(),
          userId: data.userId,
          refreshTokenHash: data.refreshTokenHash ?? null,
          expiresAt: data.expiresAt,
          revokedAt: data.revokedAt ?? null,
          lastUsedAt: data.lastUsedAt ?? null,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
          user: users.get(data.userId) ?? null,
        };

        sessions.set(session.id, session);
        return session;
      }),
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        const session = sessions.get(where.id) ?? null;

        if (!session) {
          return null;
        }

        return {
          ...session,
          user: users.get(session.userId) ?? null,
        };
      }),
      update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
        const existing = sessions.get(where.id);

        if (!existing) {
          throw new Error('Session not found');
        }

        const updated: SessionRecord = {
          ...existing,
          ...data,
          updatedAt: new Date(),
          user: users.get(existing.userId) ?? null,
        };

        sessions.set(updated.id, updated);
        return updated;
      }),
      updateMany: jest.fn(
        async ({ where, data }: { where: any; data: any }) => {
          const existing = sessions.get(where.id);

          if (
            !existing ||
            existing.userId !== where.userId ||
            existing.refreshTokenHash !== where.refreshTokenHash ||
            existing.revokedAt !== where.revokedAt ||
            existing.expiresAt.getTime() <= where.expiresAt.gt.getTime()
          ) {
            return { count: 0 };
          }

          const updated: SessionRecord = {
            ...existing,
            ...data,
            updatedAt: new Date(),
            user: users.get(existing.userId) ?? null,
          };

          sessions.set(updated.id, updated);
          return { count: 1 };
        },
      ),
    },
    $transaction: jest.fn(async (callback: (client: any) => Promise<any>) =>
      callback(prisma),
    ),
  };

  return { prisma, users, sessions };
}

function createService() {
  const { prisma, users, sessions } = createMockPrisma();
  const service = new AuthService(prisma, new JwtService());

  return { service, prisma, users, sessions };
}

describe('AuthService', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_MOCK_ENABLED = 'true';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES = '15m';
    process.env.JWT_REFRESH_EXPIRES = '30d';
  });

  afterAll(() => {
    restoreEnv('NODE_ENV');
    restoreEnv('AUTH_MOCK_ENABLED');
    restoreEnv('JWT_ACCESS_SECRET');
    restoreEnv('JWT_REFRESH_SECRET');
    restoreEnv('JWT_ACCESS_EXPIRES');
    restoreEnv('JWT_REFRESH_EXPIRES');
  });

  it('reuses users and creates sessions on mock login', async () => {
    const { service, users, sessions } = createService();

    const first = await service.wechatLogin({
      code: 'ignored',
      mockOpenId: 'mock-openid-001',
    });

    expect(first.success).toBe(true);
    expect(first.data.isNewUser).toBe(true);
    expect(first.data.accessToken).toEqual(expect.any(String));
    expect(first.data.refreshToken).toEqual(expect.any(String));
    expect(users.size).toBe(1);
    expect(sessions.size).toBe(1);

    const second = await service.wechatLogin({
      code: 'ignored-again',
      mockOpenId: 'mock-openid-001',
    });

    expect(second.data.isNewUser).toBe(false);
    expect(users.size).toBe(1);
    expect(sessions.size).toBe(2);
  });

  it('rotates refresh tokens and invalidates the old token', async () => {
    const { service, sessions } = createService();

    const login = await service.wechatLogin({
      code: 'ignored',
      mockOpenId: 'mock-openid-002',
    });
    const sessionBeforeRefresh = [...sessions.values()][0];
    const originalExpiresAt = sessionBeforeRefresh.expiresAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const rotated = await service.refresh({
      refreshToken: login.data.refreshToken,
    });

    expect(rotated.data.accessToken).not.toEqual(login.data.accessToken);
    expect(rotated.data.refreshToken).not.toEqual(login.data.refreshToken);

    const session = [...sessions.values()][0];
    expect(session.refreshTokenHash).toBe(
      createHash('sha256').update(rotated.data.refreshToken).digest('hex'),
    );
    expect(session.expiresAt.getTime()).toBeGreaterThan(
      originalExpiresAt.getTime(),
    );

    await expect(
      service.refresh({
        refreshToken: login.data.refreshToken,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.refresh({
        refreshToken: login.data.refreshToken,
      }),
    ).rejects.toMatchObject({
      response: {
        message: 'REFRESH_TOKEN_INVALID',
      },
    });
  });

  it('logs out sessions idempotently and keeps revoked access tokens invalid for normal protected flows', async () => {
    const { service, sessions } = createService();

    const login = await service.wechatLogin({
      code: 'ignored',
      mockOpenId: 'mock-openid-003',
    });

    const currentUser = await service.validateAccessToken(
      login.data.accessToken,
    );

    expect(currentUser).toEqual({
      id: expect.any(String),
      sessionId: expect.any(String),
      tokenType: 'USER',
      role: 'NORMAL',
    });

    await expect(service.logout(currentUser)).resolves.toEqual({
      success: true,
      data: {},
    });

    const session = [...sessions.values()][0];
    expect(session.revokedAt).toEqual(expect.any(Date));
    const firstRevokedAt = session.revokedAt;

    const logoutValidation = await service.validateLogoutAccessToken(
      login.data.accessToken,
    );
    await expect(service.logout(logoutValidation)).resolves.toEqual({
      success: true,
      data: {},
    });

    expect([...sessions.values()][0].revokedAt).toBe(firstRevokedAt);

    await expect(
      service.validateAccessToken(login.data.accessToken),
    ).rejects.toMatchObject({
      response: {
        message: 'SESSION_REVOKED',
      },
    });
  });

  it('does not let a second logout touch another user session', async () => {
    const { service, sessions } = createService();

    const firstLogin = await service.wechatLogin({
      code: 'ignored',
      mockOpenId: 'mock-openid-005',
    });
    const secondLogin = await service.wechatLogin({
      code: 'ignored',
      mockOpenId: 'mock-openid-006',
    });

    const firstCurrentUser = await service.validateAccessToken(
      firstLogin.data.accessToken,
    );
    const secondCurrentUser = await service.validateAccessToken(
      secondLogin.data.accessToken,
    );

    await service.logout(firstCurrentUser);
    const secondSessionBefore = sessions.get(secondCurrentUser.sessionId);

    const logoutValidation = await service.validateLogoutAccessToken(
      firstLogin.data.accessToken,
    );
    await service.logout(logoutValidation);

    const secondSessionAfter = sessions.get(secondCurrentUser.sessionId);
    expect(secondSessionAfter?.revokedAt).toBe(secondSessionBefore?.revokedAt);
    expect(secondSessionAfter?.lastUsedAt).toBe(
      secondSessionBefore?.lastUsedAt,
    );
  });

  it('rejects refresh tokens in the logout auth flow', async () => {
    const { service } = createService();
    const login = await service.wechatLogin({
      code: 'ignored',
      mockOpenId: 'mock-openid-007',
    });

    await expect(
      service.validateLogoutAccessToken(login.data.refreshToken),
    ).rejects.toMatchObject({
      response: {
        message: 'ACCESS_TOKEN_INVALID',
      },
    });
  });

  it('rejects invalid access tokens in the logout auth flow', async () => {
    const { service } = createService();

    await expect(
      service.validateLogoutAccessToken('forged-access-token'),
    ).rejects.toMatchObject({
      response: {
        message: 'ACCESS_TOKEN_INVALID',
      },
    });
  });

  it('rejects refresh after logout revokes the active session', async () => {
    const { service } = createService();
    const login = await service.wechatLogin({
      code: 'ignored',
      mockOpenId: 'mock-openid-008',
    });

    const currentUser = await service.validateAccessToken(
      login.data.accessToken,
    );
    await service.logout(currentUser);

    await expect(
      service.refresh({
        refreshToken: login.data.refreshToken,
      }),
    ).rejects.toMatchObject({
      response: {
        message: 'SESSION_REVOKED',
      },
    });
  });

  it('rejects disabled users when validating access tokens', async () => {
    const { service, prisma } = createService();

    const user = await prisma.user.create({
      data: {
        openId: 'mock-openid-004',
        status: UserStatus.DISABLED,
      },
    });

    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const token = new JwtService().signAccessToken({
      sub: user.id,
      userId: user.id,
      sessionId: session.id,
      tokenType: 'USER',
      role: 'NORMAL',
    });

    await expect(service.validateAccessToken(token)).rejects.toMatchObject({
      response: {
        message: 'USER_DISABLED',
      },
    });
  });
});
