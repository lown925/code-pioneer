/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import {
  ForbiddenException,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  BattleInvitationStatus,
  BattleQuestionDifficulty,
  BattleQuestionPresentation,
  QuestionType,
} from '../generated/prisma/enums';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { createBattlePrismaMock } from './../src/battle/battle-test.helpers';
import { PrismaService } from './../src/prisma/prisma.service';

const USER_A = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: 'session-a',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const USER_B = {
  id: '22222222-2222-4222-8222-222222222222',
  sessionId: 'session-b',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const USER_A_TOKEN = 'user-a-token';
const USER_B_TOKEN = 'user-b-token';
const DELETED_USER_TOKEN = 'deleted-user-token';
const REVOKED_SESSION_TOKEN = 'revoked-session-token';

describe('Battle routes (e2e)', () => {
  let app: INestApplication<App>;
  let mockState: ReturnType<typeof createBattlePrismaMock>;

  beforeEach(async () => {
    mockState = createBattlePrismaMock();
    mockState.users.set(USER_A.id, {
      id: USER_A.id,
      battleRating: 1000,
      nickname: 'Host',
      avatarUrl: 'https://cdn.example.com/host.png',
    });
    mockState.users.set(USER_B.id, {
      id: USER_B.id,
      battleRating: 1020,
      nickname: 'Guest',
      avatarUrl: 'https://cdn.example.com/guest.png',
    });
    seedBattleQuestions(mockState);

    const authServiceMock = {
      validateAccessToken: jest.fn(async (token: string) => {
        if (token === USER_A_TOKEN) {
          return USER_A;
        }

        if (token === USER_B_TOKEN) {
          return USER_B;
        }

        if (token === DELETED_USER_TOKEN) {
          throw new ForbiddenException('USER_DELETED');
        }

        if (token === REVOKED_SESSION_TOKEN) {
          throw new UnauthorizedException('SESSION_REVOKED');
        }

        throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
      }),
      validateLogoutAccessToken: jest.fn(async (token: string) => {
        if (token === USER_A_TOKEN) {
          return USER_A;
        }

        if (token === USER_B_TOKEN) {
          return USER_B;
        }

        if (token === DELETED_USER_TOKEN) {
          throw new ForbiddenException('USER_DELETED');
        }

        if (token === REVOKED_SESSION_TOKEN) {
          throw new UnauthorizedException('SESSION_REVOKED');
        }

        throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockState.prisma)
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

  afterEach(async () => {
    await app.close();
  });

  it('covers matchmaking, friend-room, and room-query routes end to end', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/battles/matchmaking/join')
      .expect(401);

    const queueJoin = await request(app.getHttpServer())
      .post('/api/v1/battles/matchmaking/join')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(201);

    expect(queueJoin.body.success).toBe(true);
    expect(queueJoin.body.data.status).toBe('SEARCHING');

    await request(app.getHttpServer())
      .get('/api/v1/battles/matchmaking/status')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.status).toBe('SEARCHING');
      });

    await request(app.getHttpServer())
      .delete('/api/v1/battles/matchmaking')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.status).toBe('CANCELLED');
      });

    const createdRoom = await request(app.getHttpServer())
      .post('/api/v1/battles/friend-rooms')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(201);

    const invitationToken = createdRoom.body.data.invitationToken as string;
    expect(/^[A-Za-z0-9_-]+$/.test(invitationToken)).toBe(true);
    expect(createdRoom.body.data.sharePath).toContain(invitationToken);

    await request(app.getHttpServer())
      .get('/api/v1/battles/friend-rooms/invalid token')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(400);

    await request(app.getHttpServer())
      .get(`/api/v1/battles/friend-rooms/${invitationToken}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.canJoin).toBe(true);
      });

    const joinedRoom = await request(app.getHttpServer())
      .post(`/api/v1/battles/friend-rooms/${invitationToken}/join`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(201);

    expect(joinedRoom.body.data.participants).toHaveLength(2);
    expect([...mockState.battleInvitations.values()][0].status).toBe(
      BattleInvitationStatus.ACCEPTED,
    );

    await request(app.getHttpServer())
      .get(`/api/v1/battles/${joinedRoom.body.data.battleId}`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.participants).toHaveLength(2);
        expect(response.body.data).not.toHaveProperty('questionSnapshots');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/battles/${joinedRoom.body.data.battleId}/ready`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(201)
      .expect((response) => {
        expect(response.body.data.status).toBe('READY');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/battles/${joinedRoom.body.data.battleId}/ready`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(201)
      .expect((response) => {
        expect(response.body.data.status).toBe('COUNTDOWN');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/battles/${joinedRoom.body.data.battleId}/questions`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.status).toBe('COUNTDOWN');
        expect(response.body.data.questions).toBeUndefined();
      });

    const readyRoom = mockState.battleRooms.get(
      joinedRoom.body.data.battleId as string,
    );
    if (readyRoom) {
      readyRoom.startedAt = new Date(Date.now() - 1000);
      readyRoom.expiresAt = new Date(Date.now() + 60000);
      mockState.battleRooms.set(readyRoom.id, readyRoom);
    }

    const questionsResponse = await request(app.getHttpServer())
      .get(`/api/v1/battles/${joinedRoom.body.data.battleId}/questions`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200);

    expect(questionsResponse.body.data.status).toBe('IN_PROGRESS');
    expect(questionsResponse.body.data.questions).toHaveLength(20);
    expect(questionsResponse.body.data.questions[0]).not.toHaveProperty(
      'correctAnswerSnapshot',
    );
    const questions = questionsResponse.body.data
      .questions as unknown as Array<{
      battleQuestionId: string;
      options: Array<{
        id: string;
      }>;
    }>;
    const firstQuestion = questions[0];

    await request(app.getHttpServer())
      .post(`/api/v1/battles/${joinedRoom.body.data.battleId}/answers`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        battleQuestionId: firstQuestion.battleQuestionId,
        clientRequestId: 'request-e2e-1',
        answer: {
          optionId: firstQuestion.options[0].id,
        },
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.data.accepted).toBe(true);
        expect(response.body.data).not.toHaveProperty('isCorrect');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/battles/${joinedRoom.body.data.battleId}`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.answeredCount).toBe(1);
        expect(response.body.data.currentParticipantStatus).toBe('PLAYING');
      });

    await request(app.getHttpServer())
      .get(`/api/v1/battles/${joinedRoom.body.data.battleId}`)
      .set('Authorization', `Bearer ${DELETED_USER_TOKEN}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/battles/${joinedRoom.body.data.battleId}`)
      .set('Authorization', `Bearer ${REVOKED_SESSION_TOKEN}`)
      .expect(401);

    await request(app.getHttpServer())
      .get('/api/v1/battles/not-a-uuid')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(400);
  });
});

function seedBattleQuestions(
  mockState: ReturnType<typeof createBattlePrismaMock>,
) {
  for (let index = 0; index < 20; index += 1) {
    const id = `question-${index + 1}`;
    mockState.quizQuestions.set(id, {
      id,
      type: QuestionType.SINGLE_CHOICE,
      content: `Question ${index + 1}`,
      explanation: `Explanation ${index + 1}`,
      battlePresentation: BattleQuestionPresentation.TEXT_CHOICE,
      battleDifficulty:
        index % 3 === 0
          ? BattleQuestionDifficulty.EASY
          : index % 3 === 1
            ? BattleQuestionDifficulty.MEDIUM
            : BattleQuestionDifficulty.HARD,
      isBattleEnabled: true,
      stemBlocks: null,
      explanationBlocks: null,
      acceptedAnswers: null,
      answerNormalization: null,
      caseSensitive: true,
      knowledgeTags: ['battle'],
      programmingLanguage: null,
      createdAt: new Date(Date.UTC(2026, 6, 25, 10, 0, index)),
      options: [
        {
          id: `${id}-option-a`,
          content: `Option A ${index + 1}`,
          contentBlocks: null,
          isCorrect: true,
          sortOrder: 0,
        },
        {
          id: `${id}-option-b`,
          content: `Option B ${index + 1}`,
          contentBlocks: null,
          isCorrect: false,
          sortOrder: 1,
        },
      ],
      quiz: {
        status: 'PUBLISHED',
        chapterId: `chapter-${index + 1}`,
        chapter: {
          status: 'PUBLISHED',
          courseId: `course-${index + 1}`,
          course: {
            status: 'PUBLISHED',
          },
        },
      },
    });
  }
}
