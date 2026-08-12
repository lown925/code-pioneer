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
  user?: UserRecord | null;
};

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  APP_ENV: process.env.APP_ENV,
  AUTH_MOCK_ENABLED: process.env.AUTH_MOCK_ENABLED,
  WECHAT_APP_ID: process.env.WECHAT_APP_ID,
  WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
};
const originalFetch = global.fetch;

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
          deletedAt: data.deletedAt ?? null,
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
    process.env.APP_ENV = 'development';
    process.env.AUTH_MOCK_ENABLED = 'true';
    process.env.WECHAT_APP_ID = 'test-wechat-app-id';
    process.env.WECHAT_APP_SECRET = 'test-wechat-app-secret';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES = '15m';
    process.env.JWT_REFRESH_EXPIRES = '30d';
  });

  afterAll(() => {
    restoreEnv('NODE_ENV');
    restoreEnv('APP_ENV');
    restoreEnv('AUTH_MOCK_ENABLED');
    restoreEnv('WECHAT_APP_ID');
    restoreEnv('WECHAT_APP_SECRET');
    restoreEnv('JWT_ACCESS_SECRET');
    restoreEnv('JWT_REFRESH_SECRET');
    restoreEnv('JWT_ACCESS_EXPIRES');
    restoreEnv('JWT_REFRESH_EXPIRES');
    global.fetch = originalFetch;
  });

  afterEach(() => {
    process.env.NODE_ENV = 'development';
    process.env.APP_ENV = 'development';
    process.env.AUTH_MOCK_ENABLED = 'true';
    process.env.WECHAT_APP_ID = 'test-wechat-app-id';
    process.env.WECHAT_APP_SECRET = 'test-wechat-app-secret';
    global.fetch = originalFetch;
  });

  it('logs in with a valid WeChat jscode2session response', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        openid: 'wechat-openid-001',
        unionid: 'wechat-unionid-001',
      }),
    })) as unknown as typeof fetch;
    const { service, users, sessions } = createService();

    const result = await service.wechatLogin({ code: 'one-time-code' });

    expect(result.success).toBe(true);
    expect(result.data.isNewUser).toBe(true);
    expect(users.size).toBe(1);
    expect(sessions.size).toBe(1);
    expect([...users.values()][0]).toMatchObject({
      openId: 'wechat-openid-001',
      unionId: 'wechat-unionid-001',
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns a stable configuration error without exposing credentials', async () => {
    delete process.env.WECHAT_APP_ID;
    delete process.env.WECHAT_APP_SECRET;
    const { service } = createService();

    const error = await service
      .wechatLogin({ code: 'one-time-code' })
      .catch((caught: unknown) => caught);

    expect(error).toMatchObject({
      response: { message: 'WECHAT_LOGIN_CONFIGURATION_INVALID' },
    });
    expect(JSON.stringify(error)).not.toContain('test-wechat-app-secret');
  });

  it('maps invalid or reused WeChat codes without exposing upstream text', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        errcode: 40029,
        errmsg: 'invalid code contains upstream diagnostic details',
      }),
    })) as unknown as typeof fetch;
    const { service } = createService();

    const error = await service
      .wechatLogin({ code: 'invalid-code' })
      .catch((caught: unknown) => caught);

    expect(error).toMatchObject({
      response: { message: 'WECHAT_LOGIN_CODE_INVALID' },
    });
    expect(JSON.stringify(error)).not.toContain('upstream diagnostic details');
  });

  it.each([
    ['non-2xx response', { ok: false, json: async () => ({}) }],
    [
      'malformed response',
      { ok: true, json: async () => Promise.reject(new Error('invalid json')) },
    ],
    ['missing openid', { ok: true, json: async () => ({}) }],
  ])('maps %s to a stable upstream failure', async (_name, response) => {
    global.fetch = jest.fn(async () => response) as unknown as typeof fetch;
    const { service } = createService();

    await expect(
      service.wechatLogin({ code: 'one-time-code' }),
    ).rejects.toMatchObject({
      response: { message: 'WECHAT_LOGIN_UPSTREAM_FAILED' },
    });
  });

  it('rejects mock login in trial and production environments', async () => {
    process.env.APP_ENV = 'trial';
    process.env.AUTH_MOCK_ENABLED = 'true';
    const { service } = createService();

    await expect(
      service.wechatLogin({
        code: 'ignored',
        mockOpenId: 'forbidden-mock-user',
      }),
    ).rejects.toMatchObject({
      response: { message: 'MOCK_LOGIN_DISABLED' },
    });
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

  it('creates fixed dev users, valid sessions, and reusable user JWTs', async () => {
    const { service, users, sessions } = createService();

    const playerA = await service.devLogin({ account: 'player-a' });
    const playerB = await service.devLogin({ account: 'player-b' });

    expect([...users.values()]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          openId: 'dev:test-player-a',
          nickname: '测试玩家 A',
          status: UserStatus.NORMAL,
        }),
        expect.objectContaining({
          openId: 'dev:test-player-b',
          nickname: '测试玩家 B',
          status: UserStatus.NORMAL,
        }),
      ]),
    );
    expect(users.size).toBe(2);
    expect(sessions.size).toBe(2);
    await expect(
      service.validateAccessToken(playerA.data.accessToken),
    ).resolves.toMatchObject({
      id: playerA.data.user.id,
      tokenType: 'USER',
      role: 'NORMAL',
    });
    await expect(
      service.validateAccessToken(playerB.data.accessToken),
    ).resolves.toMatchObject({
      id: playerB.data.user.id,
      tokenType: 'USER',
      role: 'NORMAL',
    });
  });

  it('reuses the fixed dev user while creating a session for every login', async () => {
    const { service, users, sessions } = createService();

    const first = await service.devLogin({ account: 'player-a' });
    const second = await service.devLogin({ account: 'player-a' });

    expect(first.data.isNewUser).toBe(true);
    expect(second.data.isNewUser).toBe(false);
    expect(first.data.user.id).toBe(second.data.user.id);
    expect(users.size).toBe(1);
    expect(sessions.size).toBe(2);
  });

  it.each([
    ['production', 'true'],
    ['trial', 'true'],
    [undefined, 'true'],
    ['', 'true'],
    ['Development', 'true'],
    ['development', 'false'],
    ['development', undefined],
  ])(
    'fails closed for APP_ENV=%s and AUTH_MOCK_ENABLED=%s',
    async (appEnvironment, mockEnabled) => {
      if (appEnvironment === undefined) {
        delete process.env.APP_ENV;
      } else {
        process.env.APP_ENV = appEnvironment;
      }

      if (mockEnabled === undefined) {
        delete process.env.AUTH_MOCK_ENABLED;
      } else {
        process.env.AUTH_MOCK_ENABLED = mockEnabled;
      }

      const { service, users, sessions } = createService();

      await expect(
        service.devLogin({ account: 'player-a' }),
      ).rejects.toMatchObject({
        status: 404,
        response: { message: 'DEV_LOGIN_NOT_FOUND' },
      });
      expect(users.size).toBe(0);
      expect(sessions.size).toBe(0);
    },
  );

  it('allows dev login in the explicit test environment', async () => {
    process.env.APP_ENV = 'test';
    process.env.AUTH_MOCK_ENABLED = 'true';
    const { service } = createService();

    await expect(
      service.devLogin({ account: 'player-b' }),
    ).resolves.toMatchObject({
      success: true,
      data: {
        user: {
          nickname: '测试玩家 B',
        },
      },
    });
  });

  it('rejects re-login for users already marked as DELETED', async () => {
    const { service, prisma, sessions, users } = createService();
    const deletedUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-deleted-status',
        status: UserStatus.DELETED,
      },
    });
    const originalLastLoginAt = deletedUser.lastLoginAt;

    await expect(
      service.wechatLogin({
        code: 'ignored',
        mockOpenId: deletedUser.openId,
      }),
    ).rejects.toMatchObject({
      response: {
        message: 'USER_DELETED',
      },
    });

    expect(sessions.size).toBe(0);
    expect(users.get(deletedUser.id)?.lastLoginAt).toBe(originalLastLoginAt);
  });

  it('rejects re-login for users with deletedAt set even if status is NORMAL', async () => {
    const { service, prisma, sessions, users } = createService();
    const deletedUser = await prisma.user.create({
      data: {
        openId: 'mock-openid-deleted-at',
        status: UserStatus.NORMAL,
        deletedAt: new Date('2026-07-19T00:00:00.000Z'),
      },
    });
    const originalLastLoginAt = deletedUser.lastLoginAt;

    await expect(
      service.wechatLogin({
        code: 'ignored',
        mockOpenId: deletedUser.openId,
      }),
    ).rejects.toMatchObject({
      response: {
        message: 'USER_DELETED',
      },
    });

    expect(sessions.size).toBe(0);
    expect(users.get(deletedUser.id)?.lastLoginAt).toBe(originalLastLoginAt);
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
