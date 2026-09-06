/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
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

const USERS = {
  A: '11111111-1111-4111-8111-111111111111',
  B: '22222222-2222-4222-8222-222222222222',
  MINIMAL: '33333333-3333-4333-8333-333333333333',
} as const;

const TOKENS = {
  A: 'growth-ai-prompt-token-a',
  B: 'growth-ai-prompt-token-b',
  MINIMAL: 'growth-ai-prompt-token-minimal',
} as const;

const USER_FIXTURES = {
  [USERS.A]: {
    id: USERS.A,
    nickname: 'SECRET_NICKNAME_ABC',
    email: 'secret-ai-prompt@example.test',
    avatarUrl: 'https://example.test/SECRET_AVATAR',
    openId: 'secret-openid-a',
    unionId: 'secret-unionid-a',
    grade: 'grade.junior',
    major: 'major.data_science_big_data',
    careerDirection: 'career.data_analyst',
    technicalInterests: ['interest.sql', 'interest.data_visualization'],
  },
  [USERS.B]: {
    id: USERS.B,
    nickname: 'SECRET_NICKNAME_B',
    email: 'secret-b@example.test',
    avatarUrl: 'https://example.test/SECRET_AVATAR_B',
    openId: 'secret-openid-b',
    unionId: 'secret-unionid-b',
    grade: 'grade.senior',
    major: 'major.software_engineering',
    careerDirection: 'career.backend_engineer',
    technicalInterests: ['interest.java'],
  },
  [USERS.MINIMAL]: {
    grade: null,
    major: null,
    careerDirection: null,
    technicalInterests: [],
  },
} as const;

function createPrismaMock() {
  const courseRecords = {
    [USERS.A]: [
      {
        id: 'course-internal-id-a-completed',
        courseId: 'course-internal-id-a-completed',
        status: 'COMPLETED',
        progressPercent: 100,
        course: { title: 'Python 基础' },
      },
      {
        id: 'course-internal-id-a-learning',
        courseId: 'course-internal-id-a-learning',
        status: 'LEARNING',
        progressPercent: 42.5,
        course: { title: '数据库 SQL 基础' },
      },
    ],
    [USERS.B]: [
      {
        id: 'course-internal-id-b-completed',
        courseId: 'course-internal-id-b-completed',
        status: 'COMPLETED',
        progressPercent: 100,
        course: { title: 'Java 面向对象编程' },
      },
    ],
    [USERS.MINIMAL]: [],
  } as const;

  const quizAttempts = {
    [USERS.A]: [
      {
        id: 'attempt-internal-id-a-quiz',
        quizId: 'quiz-internal-id-a',
        answers: [{ isCorrect: false }, { isCorrect: true }],
        quiz: {
          chapter: {
            id: 'chapter-internal-id-a-quiz',
            title: '多表查询',
            course: {
              id: 'course-internal-id-a-learning',
              title: '数据库 SQL 基础',
            },
          },
        },
      },
    ],
    [USERS.B]: [
      {
        id: 'attempt-internal-id-b-quiz',
        quizId: 'quiz-internal-id-b',
        answers: [{ isCorrect: true }],
        quiz: {
          chapter: {
            id: 'chapter-internal-id-b-quiz',
            title: '继承与多态',
            course: {
              id: 'course-internal-id-b-completed',
              title: 'Java 面向对象编程',
            },
          },
        },
      },
    ],
    [USERS.MINIMAL]: [],
  } as const;

  const practiceAttempts = {
    [USERS.A]: [
      {
        id: 'attempt-internal-id-a-practice',
        status: 'COMPLETED',
        answers: [
          {
            id: 'answer-internal-id-a-practice',
            questionId: 'question-internal-id-a-practice',
            isCorrect: false,
            question: {
              quiz: {
                chapter: {
                  id: 'chapter-internal-id-a-practice',
                  title: '聚合查询',
                  course: {
                    id: 'course-internal-id-a-learning',
                    title: '数据库 SQL 基础',
                  },
                },
              },
            },
          },
        ],
      },
    ],
    [USERS.B]: [],
    [USERS.MINIMAL]: [],
  } as const;

  return {
    user: {
      findFirst: jest.fn(async ({ where }: { where: { id: string } }) => {
        const fixture = USER_FIXTURES[where.id as keyof typeof USER_FIXTURES];
        return fixture ?? null;
      }),
    },
    courseLearningRecord: {
      findMany: jest.fn(
        async ({ where }: { where: { userId: string } }) =>
          courseRecords[where.userId as keyof typeof courseRecords] ?? [],
      ),
    },
    quizAttempt: {
      findMany: jest.fn(
        async ({ where }: { where: { userId: string } }) =>
          quizAttempts[where.userId as keyof typeof quizAttempts] ?? [],
      ),
    },
    practiceAttempt: {
      findMany: jest.fn(
        async ({ where }: { where: { userId: string } }) =>
          practiceAttempts[where.userId as keyof typeof practiceAttempts] ?? [],
      ),
    },
  };
}

describe('Growth AI prompt endpoint (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const prismaMock = createPrismaMock();
    const authServiceMock = {
      validateAccessToken: jest.fn(async (token: string) => {
        const userId = Object.entries(TOKENS).find(
          ([, expectedToken]) => expectedToken === token,
        )?.[0];
        if (!userId) {
          throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
        }

        return {
          id: USERS[userId as keyof typeof USERS],
          sessionId: `session-${userId}`,
          tokenType: 'USER',
          role: 'NORMAL',
        } satisfies CurrentUserContext;
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

  const endpoint = () =>
    request(app.getHttpServer()).get('/api/v1/growth/ai-prompt');

  it('requires authentication', async () => {
    await endpoint().expect(401);
  });

  it('returns only the authenticated user prompt and ignores a userId query override', async () => {
    const response = await endpoint()
      .query({ userId: USERS.B })
      .set('Authorization', `Bearer ${TOKENS.A}`)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({ mode: 'GENERAL' }),
    });
    expect(response.body.data.prompt).toContain('数据分析师');
    expect(response.body.data.prompt).toContain('Python 基础');
    expect(response.body.data.prompt).toContain('技术兴趣：SQL、数据可视化');
    expect(response.body.data.prompt).toContain('数据库 SQL 基础 / 多表查询');
    expect(response.body.data.prompt).not.toContain('后端工程师');
    expect(response.body.data.prompt).not.toContain('Java 面向对象编程');
    expect(response.body.data.prompt).not.toContain('继承与多态');
  });

  it('isolates user B data', async () => {
    const response = await endpoint()
      .set('Authorization', `Bearer ${TOKENS.B}`)
      .expect(200);

    expect(response.body.data.prompt).toContain('后端工程师');
    expect(response.body.data.prompt).toContain('Java 面向对象编程');
    expect(response.body.data.prompt).toContain('技术兴趣：Java');
    expect(response.body.data.prompt).not.toContain('数据分析师');
    expect(response.body.data.prompt).not.toContain('Python 基础');
    expect(response.body.data.prompt).not.toContain('多表查询');
  });

  it('does not leak PII or internal identifiers', async () => {
    const response = await endpoint()
      .set('Authorization', `Bearer ${TOKENS.A}`)
      .expect(200);
    const serialized = JSON.stringify(response.body).toLowerCase();

    for (const sensitiveValue of [
      'SECRET_NICKNAME_ABC',
      'secret-ai-prompt@example.test',
      'SECRET_AVATAR',
      USERS.A,
      'openid',
      'unionid',
      'token',
    ]) {
      expect(serialized).not.toContain(sensitiveValue.toLowerCase());
    }

    for (const internalId of [
      'course-internal-id',
      'chapter-internal-id',
      'question-internal-id',
      'attempt-internal-id',
    ]) {
      expect(serialized).not.toContain(internalId);
    }
  });

  it('generates a valid prompt for an incomplete profile with no learning data', async () => {
    const response = await endpoint()
      .set('Authorization', `Bearer ${TOKENS.MINIMAL}`)
      .expect(200);
    const prompt = response.body.data.prompt as string;

    expect(prompt).toContain('学习与职业成长顾问');
    expect(prompt).not.toMatch(/undefined|null|NaN|N\/A|暂无/iu);
    expect(prompt).not.toContain('专业：');
    expect(prompt).not.toContain('职业目标：');
    expect(prompt).not.toContain('当前较薄弱的学习领域：');
  });

  it('includes reliable Quiz, Practice and weak-area summaries at title level', async () => {
    const response = await endpoint()
      .set('Authorization', `Bearer ${TOKENS.A}`)
      .expect(200);
    const prompt = response.body.data.prompt as string;

    expect(prompt).toContain(
      'Quiz 概况：完成 1 次，共回答 2 道题，正确 1 道，正确率 50%',
    );
    expect(prompt).toContain(
      'Practice 概况：完成 1 次，共回答 1 道题，正确 0 道，正确率 0%',
    );
    expect(prompt).toContain('数据库 SQL 基础 / 多表查询');
    expect(prompt).toContain('数据库 SQL 基础 / 聚合查询');
    expect(prompt).not.toContain('questionId');
  });

  it('is deterministic across repeated requests', async () => {
    const first = await endpoint()
      .set('Authorization', `Bearer ${TOKENS.A}`)
      .expect(200);
    const second = await endpoint()
      .set('Authorization', `Bearer ${TOKENS.A}`)
      .expect(200);

    expect(second.body.data).toEqual(first.body.data);
  });
});
