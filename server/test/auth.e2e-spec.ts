/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { UserStatus } from '../generated/prisma/enums';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

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
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        if (!where.id) {
          return null;
        }

        const user = users.get(where.id) ?? null;

        if (!user || (where.deletedAt === null && user.deletedAt !== null)) {
          return null;
        }

        return user;
      }),
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

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: ReturnType<typeof createMockPrisma>['prisma'];
  let users: ReturnType<typeof createMockPrisma>['users'];
  let sessions: ReturnType<typeof createMockPrisma>['sessions'];

  beforeAll(async () => {
    process.env.NODE_ENV = 'development';
    process.env.APP_ENV = 'development';
    process.env.AUTH_MOCK_ENABLED = 'true';
    process.env.JWT_ACCESS_SECRET = 'e2e-access-secret';
    process.env.JWT_REFRESH_SECRET = 'e2e-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES = '15m';
    process.env.JWT_REFRESH_EXPIRES = '30d';

    const mock = createMockPrisma();
    prismaMock = mock.prisma;
    users = mock.users;
    sessions = mock.sessions;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(() => {
    process.env.APP_ENV = 'development';
    process.env.AUTH_MOCK_ENABLED = 'true';
  });

  afterAll(async () => {
    await app.close();
    restoreEnv('NODE_ENV');
    restoreEnv('APP_ENV');
    restoreEnv('AUTH_MOCK_ENABLED');
    restoreEnv('JWT_ACCESS_SECRET');
    restoreEnv('JWT_REFRESH_SECRET');
    restoreEnv('JWT_ACCESS_EXPIRES');
    restoreEnv('JWT_REFRESH_EXPIRES');
  });

  it('creates fixed dev users and supports protected API, refresh, and logout', async () => {
    const firstPlayerA = await request(app.getHttpServer())
      .post('/api/v1/auth/dev-login')
      .send({ account: 'player-a' })
      .expect(201);
    const secondPlayerA = await request(app.getHttpServer())
      .post('/api/v1/auth/dev-login')
      .send({ account: 'player-a' })
      .expect(201);
    const playerB = await request(app.getHttpServer())
      .post('/api/v1/auth/dev-login')
      .send({ account: 'player-b' })
      .expect(201);

    expect(firstPlayerA.body.data).toMatchObject({
      isNewUser: true,
      user: { nickname: '测试玩家 A' },
    });
    expect(secondPlayerA.body.data).toMatchObject({
      isNewUser: false,
      user: { id: firstPlayerA.body.data.user.id },
    });
    expect(playerB.body.data).toMatchObject({
      isNewUser: true,
      user: { nickname: '测试玩家 B' },
    });
    expect(firstPlayerA.body.data.user).not.toHaveProperty('openId');
    expect([...users.values()]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ openId: 'dev:test-player-a' }),
        expect.objectContaining({ openId: 'dev:test-player-b' }),
      ]),
    );
    expect(
      [...users.values()].filter((user) => user.openId === 'dev:test-player-a'),
    ).toHaveLength(1);
    expect(sessions.size).toBe(3);

    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstPlayerA.body.data.accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.id).toBe(firstPlayerA.body.data.user.id);
      });

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: firstPlayerA.body.data.refreshToken })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${refreshResponse.body.data.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${refreshResponse.body.data.accessToken}`)
      .expect(401);
  });

  it.each([
    ['unknown player', { account: 'player-c' }],
    ['arbitrary openId', { account: 'player-a', openId: 'wechat-looking-id' }],
    ['arbitrary userId', { account: 'player-a', userId: randomUUID() }],
    ['arbitrary role', { account: 'player-a', role: 'SUPER_ADMIN' }],
  ])('rejects dev-login payload injection: %s', async (_name, payload) => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/dev-login')
      .send(payload)
      .expect(400);
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
    'returns 404 for APP_ENV=%s and AUTH_MOCK_ENABLED=%s',
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

      const beforeUsers = users.size;
      const beforeSessions = sessions.size;
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/dev-login')
        .set('X-Client-Environment', 'develop')
        .send({ account: 'player-a' })
        .expect(404);

      expect(response.body.message).toBe('DEV_LOGIN_NOT_FOUND');
      expect(users.size).toBe(beforeUsers);
      expect(sessions.size).toBe(beforeSessions);
    },
  );

  it('keeps /auth/me unavailable and makes logout idempotent', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({
        code: 'ignored',
        mockOpenId: 'mock-openid-e2e',
      })
      .expect(201);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.accessToken).toEqual(expect.any(String));
    expect(loginResponse.body.data.refreshToken).toEqual(expect.any(String));

    const accessToken = loginResponse.body.data.accessToken as string;
    const refreshToken = loginResponse.body.data.refreshToken as string;

    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(404);

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken,
      })
      .expect(201);

    expect(refreshResponse.body.success).toBe(true);
    expect(refreshResponse.body.data.accessToken).not.toBe(accessToken);
    expect(refreshResponse.body.data.refreshToken).not.toBe(refreshToken);

    const rotatedAccessToken = refreshResponse.body.data.accessToken as string;
    const rotatedRefreshToken = refreshResponse.body.data
      .refreshToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${rotatedAccessToken}`)
      .expect(200)
      .expect({
        success: true,
        data: {},
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${rotatedAccessToken}`)
      .expect(200)
      .expect({
        success: true,
        data: {},
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: rotatedRefreshToken,
      })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken,
      })
      .expect(401);
  });

  it('rejects WeChat login requests without a code at the DTO boundary', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({})
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('code')]),
    );
  });

  it('rejects refresh tokens and invalid access tokens when calling logout', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({
        code: 'ignored',
        mockOpenId: 'mock-openid-e2e-logout-validation',
      })
      .expect(201);

    const refreshToken = loginResponse.body.data.refreshToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', 'Bearer forged-access-token')
      .expect(401);
  });
});
