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
  major: string | null;
  grade: string | null;
  learningDirection: string | null;
  technicalInterests: string[];
  careerDirection: string | null;
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
  const courses = [{ id: 'course-1' }, { id: 'course-2' }];
  const chapters = [{ id: 'chapter-1' }, { id: 'chapter-2' }];

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
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const user: UserRecord = {
          id: data.id ?? randomUUID(),
          openId: data.openId,
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
    },
    userSession: {
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const session: SessionRecord = {
          id: data.id ?? randomUUID(),
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
          if (where.id) {
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

            sessions.set(existing.id, {
              ...existing,
              ...data,
              updatedAt: new Date(),
              user: users.get(existing.userId) ?? null,
            });

            return { count: 1 };
          }

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
                user: users.get(session.userId) ?? null,
              });
              count += 1;
            }
          }

          return { count };
        },
      ),
    },
    $transaction: jest.fn(async (callback: (client: any) => Promise<any>) =>
      callback(prisma),
    ),
  };

  return { prisma, users, sessions, courses, chapters };
}

describe('User flow (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: ReturnType<typeof createMockPrisma>['prisma'];
  let mockState: ReturnType<typeof createMockPrisma>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_MOCK_ENABLED = 'true';
    process.env.JWT_ACCESS_SECRET = 'user-e2e-access-secret';
    process.env.JWT_REFRESH_SECRET = 'user-e2e-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES = '15m';
    process.env.JWT_REFRESH_EXPIRES = '30d';

    mockState = createMockPrisma();
    prismaMock = mockState.prisma;

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

  afterAll(async () => {
    await app.close();
    restoreEnv('NODE_ENV');
    restoreEnv('AUTH_MOCK_ENABLED');
    restoreEnv('JWT_ACCESS_SECRET');
    restoreEnv('JWT_REFRESH_SECRET');
    restoreEnv('JWT_ACCESS_EXPIRES');
    restoreEnv('JWT_REFRESH_EXPIRES');
  });

  it('persists isolated Growth profiles with validation and clearing semantics', async () => {
    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);

    const firstLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({
        code: 'growth-user-one',
        mockOpenId: 'mock-openid-growth-e2e-one',
      })
      .expect(201);
    const secondLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({
        code: 'growth-user-two',
        mockOpenId: 'mock-openid-growth-e2e-two',
      })
      .expect(201);
    const firstToken = firstLogin.body.data.accessToken as string;
    const secondToken = secondLogin.body.data.accessToken as string;

    expect(firstLogin.body.data.user.major).toBeUndefined();

    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toMatchObject({
          major: null,
          grade: null,
          learningDirection: null,
          technicalInterests: [],
          careerDirection: null,
        });
      });

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstToken}`)
      .send({
        major: '  custom:金融工程  ',
        grade: ' grade.freshman ',
        learningDirection: ' direction.backend ',
        technicalInterests: [' interest.python ', ' custom:Power BI '],
        careerDirection: ' career.backend_engineer ',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toMatchObject({
          major: 'custom:金融工程',
          grade: 'grade.freshman',
          learningDirection: 'direction.backend',
          technicalInterests: ['interest.python', 'custom:Power BI'],
          careerDirection: 'career.backend_engineer',
        });
      });

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstToken}`)
      .send({
        major: 'major.computer_science',
        technicalInterests: ['interest.sql'],
      })
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toMatchObject({
          major: 'major.computer_science',
          grade: 'grade.freshman',
          technicalInterests: ['interest.sql'],
        });
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${secondToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toMatchObject({
          major: null,
          grade: null,
          learningDirection: null,
          technicalInterests: [],
          careerDirection: null,
        });
      });

    const invalidPayloads = [
      { major: '   ' },
      { major: 'custom:' },
      { major: 'direction.backend' },
      { major: `custom:${'a'.repeat(94)}` },
      { technicalInterests: 'interest.python' },
      { technicalInterests: [1] },
      { technicalInterests: ['interest.python', ' interest.python '] },
      {
        technicalInterests: Array.from(
          { length: 13 },
          (_, index) => `interest.topic_${index}`,
        ),
      },
    ];

    for (const payload of invalidPayloads) {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${firstToken}`)
        .send(payload)
        .expect(400);
    }

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstToken}`)
      .send({
        major: null,
        grade: null,
        learningDirection: null,
        technicalInterests: [],
        careerDirection: null,
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toMatchObject({
          major: null,
          grade: null,
          learningDirection: null,
          technicalInterests: [],
          careerDirection: null,
        });
      });
  });

  it('updates profile, soft deletes the account, and blocks re-login for the same openId', async () => {
    const courseCountBefore = mockState.courses.length;
    const chapterCountBefore = mockState.chapters.length;

    const firstLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({
        code: 'ignored',
        mockOpenId: 'mock-openid-user-e2e',
      })
      .expect(201);

    const firstAccessToken = firstLoginResponse.body.data.accessToken as string;
    const firstRefreshToken = firstLoginResponse.body.data
      .refreshToken as string;
    const userId = firstLoginResponse.body.data.user.id as string;

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstAccessToken}`)
      .send({
        nickname: '  码站学员  ',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.nickname).toBe('码站学员');
        expect(response.body.data.openId).toBeUndefined();
        expect(response.body.data.unionId).toBeUndefined();
        expect(response.body.data.deletedAt).toBeUndefined();
      });

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstAccessToken}`)
      .send({
        avatarUrl: '  https://cdn.example.com/avatar.png  ',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.avatarUrl).toBe(
          'https://cdn.example.com/avatar.png',
        );
      });

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstAccessToken}`)
      .send({
        status: 'DELETED',
      })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstAccessToken}`)
      .send({
        avatarUrl: 'http://cdn.example.com/avatar.png',
      })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstAccessToken}`)
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/overview')
      .expect(404);

    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(404);
    await request(app.getHttpServer()).post('/api/v1/users').expect(404);
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .expect(404);

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({
        code: 'ignored-again',
        mockOpenId: 'mock-openid-user-e2e',
      })
      .expect(201);

    const secondAccessToken = secondLoginResponse.body.data
      .accessToken as string;
    const secondRefreshToken = secondLoginResponse.body.data
      .refreshToken as string;

    expect(
      [...mockState.sessions.values()].filter(
        (session) => session.userId === userId,
      ),
    ).toHaveLength(2);

    await request(app.getHttpServer())
      .post('/api/v1/users/me/delete-account')
      .set('Authorization', `Bearer ${firstAccessToken}`)
      .send({
        confirmation: 'DELETE',
      })
      .expect(200)
      .expect({
        success: true,
        data: {},
      });

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${firstAccessToken}`)
      .send({
        nickname: '再次修改',
      })
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        nickname: '再次修改',
      })
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: firstRefreshToken,
      })
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: secondRefreshToken,
      })
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({
        code: 'ignored-third',
        mockOpenId: 'mock-openid-user-e2e',
      })
      .expect(403)
      .expect((response) => {
        expect(response.body.message).toBe('USER_DELETED');
      });

    const deletedUser = mockState.users.get(userId);
    expect(deletedUser).toBeDefined();
    expect(deletedUser?.status).toBe(UserStatus.DELETED);
    expect(deletedUser?.deletedAt).toEqual(expect.any(Date));

    const userSessions = [...mockState.sessions.values()].filter(
      (session) => session.userId === userId,
    );
    expect(userSessions).toHaveLength(2);
    userSessions.forEach((session) => {
      expect(session.revokedAt).toEqual(expect.any(Date));
    });

    expect(mockState.courses.length).toBe(courseCountBefore);
    expect(mockState.chapters.length).toBe(chapterCountBefore);
  });
});
