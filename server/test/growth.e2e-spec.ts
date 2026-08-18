/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthService } from '../src/auth/auth.service';
import type { CurrentUserContext } from '../src/auth/auth.types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const ACCESS_TOKEN = 'growth-e2e-access-token';
const CURRENT_USER: CurrentUserContext = {
  id: 'growth-user-1',
  sessionId: 'growth-session-1',
  tokenType: 'USER',
  role: 'NORMAL',
};

function createPrismaMock() {
  return {
    user: {
      findFirst: jest.fn().mockResolvedValue({
        major: null,
        grade: null,
        learningDirection: null,
        technicalInterests: [],
        careerDirection: null,
      }),
    },
    courseChapter: { findMany: jest.fn().mockResolvedValue([]) },
    courseLearningRecord: { findMany: jest.fn().mockResolvedValue([]) },
    chapterLearningRecord: { findMany: jest.fn().mockResolvedValue([]) },
    quizAttempt: { findMany: jest.fn().mockResolvedValue([]) },
    practiceAttempt: { findMany: jest.fn().mockResolvedValue([]) },
    battleParticipant: { findMany: jest.fn().mockResolvedValue([]) },
    battleProfile: { findUnique: jest.fn().mockResolvedValue(null) },
    userBattleSkillRating: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    battleSkill: { findMany: jest.fn().mockResolvedValue([]) },
    battleRatingLog: { findMany: jest.fn().mockResolvedValue([]) },
    userLearningGoal: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    },
    course: { findFirst: jest.fn() },
  };
}

describe('Growth overview (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeAll(async () => {
    prismaMock = createPrismaMock();
    const authServiceMock = {
      validateAccessToken: jest.fn(async (token: string) => {
        if (token !== ACCESS_TOKEN) {
          throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
        }

        return CURRENT_USER;
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
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
  });

  it('requires a JWT for the overview', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/growth/overview')
      .expect(401);
  });

  it('uses the authenticated user id and returns a seven-day overview', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/growth/overview')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.meta.range).toBe('7d');
        expect(response.body.data.meta.timezone).toBe('Asia/Shanghai');
        expect(response.body.data.learning.trend).toHaveLength(7);
        expect(response.body.data.dataState).toBe('NO_DATA');
      });

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: CURRENT_USER.id, deletedAt: null },
      }),
    );
  });

  it('supports thirty-day trends', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/growth/overview?range=30d')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.meta.range).toBe('30d');
        expect(response.body.data.learning.trend).toHaveLength(30);
      });
  });

  it('rejects unsupported ranges and arbitrary user ids', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/growth/overview?range=90d')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/v1/growth/overview?userId=other-user')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(400);
  });

  it('exposes current goal operations through the authenticated user only', async () => {
    const courseId = '11111111-1111-4111-8111-111111111111';
    const goal = {
      id: '22222222-2222-4222-8222-222222222222',
      userId: CURRENT_USER.id,
      courseId,
      targetDate: new Date('2026-09-20T00:00:00.000Z'),
      status: 'ACTIVE',
      startedAt: new Date('2026-08-18T00:00:00.000Z'),
      completedAt: null,
      course: { id: courseId, title: 'Python 基础' },
    };

    await request(app.getHttpServer())
      .get('/api/v1/growth/goals/current')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.goal).toBeNull();
      });

    await request(app.getHttpServer())
      .post('/api/v1/growth/goals')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .send({
        courseId,
        targetDate: '2026-09-20',
        userId: 'other-user',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/growth/goals')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .send({ courseId, targetDate: '2026-08-17' })
      .expect(400);

    prismaMock.course.findFirst.mockResolvedValue({
      id: courseId,
      title: 'Python 基础',
    });
    prismaMock.userLearningGoal.findFirst.mockResolvedValueOnce(null);
    prismaMock.userLearningGoal.create.mockResolvedValue(goal);
    prismaMock.courseChapter.findMany.mockResolvedValue([
      { id: '33333333-3333-4333-8333-333333333333' },
    ]);
    prismaMock.chapterLearningRecord.findMany.mockResolvedValue([]);

    await request(app.getHttpServer())
      .post('/api/v1/growth/goals')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .send({ courseId, targetDate: '2026-09-20' })
      .expect(201)
      .expect((response) => {
        expect(response.body.data.goal).toMatchObject({
          courseId,
          courseTitle: 'Python 基础',
          totalChapters: 1,
          completedChapters: 0,
          status: 'ACTIVE',
        });
      });

    expect(prismaMock.userLearningGoal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: CURRENT_USER.id, courseId }),
      }),
    );
  });
});
