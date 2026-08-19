import { ConflictException } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleQuestionDifficulty,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleAiService } from './battle-ai.service';
import { AI_STRATEGY_VERSION } from './battle.constants';
import { BattleDomainService } from './battle-domain.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const CURRENT_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: 'session-a',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

describe('BattleAiService', () => {
  it('exposes AI as a first-class Prisma BattleMode', () => {
    expect(BattleMode.AI).toBe('AI');
  });

  function createService() {
    const createUser = jest.fn();
    const upsertSkillRating = jest.fn();
    const createRatingLog = jest.fn();
    const tx = {
      user: { create: createUser },
      userBattleSkillRating: { upsert: upsertSkillRating },
      battleRatingLog: { create: createRatingLog },
      battleRoom: {
        create: jest.fn(async () => ({ id: 'ai-room-1' })),
        findUnique: jest.fn(),
      },
      battleParticipant: {
        create: jest.fn(async () => ({ id: 'participant-1' })),
      },
      battleAiOpponent: {
        create: jest.fn(async ({ data }) => ({ id: 'ai-opponent-1', ...data })),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
      battleRoom: tx.battleRoom,
    };
    const domainService = {
      acquireUserBattleLock: jest.fn(async () => undefined),
      normalizeExpiredFriendRoomsForUser: jest.fn(async () => 0),
      normalizeExpiredRankedMatchRoomsForUser: jest.fn(async () => 0),
      assertUserHasNoActiveBattle: jest.fn(async () => undefined),
    };
    const skillService = {
      normalizeSkillCode: jest.fn((skill: string) =>
        skill.trim().toUpperCase(),
      ),
      assertAvailableSkill: jest.fn(async () => ({ code: 'PYTHON' })),
    };
    const snapshots = Array.from({ length: 20 }, (_, index) => ({
      id: `snapshot-${index + 1}`,
      orderIndex: index,
      difficulty:
        index < 14
          ? BattleQuestionDifficulty.MEDIUM
          : BattleQuestionDifficulty.HARD,
    }));
    const questionService = {
      createQuestionSnapshots: jest.fn(async () => snapshots),
    };
    const service = new BattleAiService(
      prisma as never,
      domainService as never,
      skillService as never,
      questionService as never,
    );
    jest
      .spyOn(service as unknown as { createSeed: () => string }, 'createSeed')
      .mockReturnValue('persisted-seed');

    return {
      service,
      tx,
      domainService,
      skillService,
      questionService,
      createUser,
      upsertSkillRating,
      createRatingLog,
    };
  }

  it('creates one real participant and persists the room-level deterministic plan', async () => {
    const context = createService();

    const result = await context.service.createAiBattle(CURRENT_USER, 'python');

    expect(result.data).toMatchObject({
      battleId: 'ai-room-1',
      mode: BattleMode.AI,
      skill: 'PYTHON',
      status: BattleRoomStatus.WAITING,
    });
    expect(context.domainService.acquireUserBattleLock).toHaveBeenCalledWith(
      CURRENT_USER.id,
      context.tx,
    );
    expect(context.skillService.assertAvailableSkill).toHaveBeenCalledWith(
      'PYTHON',
      context.tx,
    );
    expect(context.tx.battleRoom.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mode: BattleMode.AI,
          skillCode: 'PYTHON',
          status: BattleRoomStatus.WAITING,
        }),
      }),
    );
    expect(context.tx.battleParticipant.create).toHaveBeenCalledTimes(1);
    expect(context.tx.battleParticipant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        battleRoomId: 'ai-room-1',
        userId: CURRENT_USER.id,
        seat: 1,
        status: BattleParticipantStatus.JOINED,
      }),
    });
    expect(
      context.questionService.createQuestionSnapshots,
    ).toHaveBeenCalledWith(
      context.tx,
      expect.objectContaining({
        battleId: 'ai-room-1',
        skillCode: 'PYTHON',
        questionCount: 20,
      }),
    );
    expect(context.tx.battleAiOpponent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        battleRoomId: 'ai-room-1',
        strategyVersion: AI_STRATEGY_VERSION,
        seed: 'persisted-seed',
        answerPlan: expect.objectContaining({
          strategyVersion: AI_STRATEGY_VERSION,
          questions: expect.any(Array),
        }),
        plannedSubmittedOffsetMs: expect.any(Number),
      }),
    });
    expect(context.createUser).not.toHaveBeenCalled();
    expect(context.upsertSkillRating).not.toHaveBeenCalled();
    expect(context.createRatingLog).not.toHaveBeenCalled();
  });

  it('projects live AI progress without correctness or score fields', async () => {
    const context = createService();
    const startedAt = new Date('2026-08-19T10:00:00.000Z');
    context.tx.battleRoom.findUnique.mockResolvedValue({
      startedAt,
      aiOpponent: {
        answerPlan: {
          strategyVersion: AI_STRATEGY_VERSION,
          questions: [
            {
              battleQuestionSnapshotId: 'snapshot-1',
              orderIndex: 0,
              plannedCompletedOffsetMs: 5_000,
              plannedCorrect: true,
            },
          ],
        },
        plannedSubmittedOffsetMs: 8_000,
      },
    });

    const progress = await context.service.getProgress(
      'ai-room-1',
      new Date(startedAt.getTime() + 6_000),
    );

    expect(progress).toEqual({
      answeredCount: 1,
      submitted: false,
      elapsedMs: 6_000,
    });
    expect(progress).not.toHaveProperty('correctCount');
    expect(progress).not.toHaveProperty('score');
    expect(progress).not.toHaveProperty('plannedCorrect');
  });

  it('atomically switches an unlocked SEARCHING queue into one AI room', async () => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const skillService = {
      normalizeSkillCode: jest.fn((skill: string) => skill.toUpperCase()),
      assertAvailableSkill: jest.fn(async (skill: string) => ({
        code: skill,
        name: 'Python',
      })),
    };
    const snapshots = Array.from({ length: 20 }, (_, index) => ({
      id: `snapshot-${index + 1}`,
      orderIndex: index,
      difficulty: BattleQuestionDifficulty.MEDIUM,
    }));
    const service = new BattleAiService(
      mock.prisma as never,
      domainService,
      skillService as never,
      { createQuestionSnapshots: jest.fn(async () => snapshots) } as never,
    );
    const now = Date.now();
    mock.users.set(CURRENT_USER.id, {
      id: CURRENT_USER.id,
      battleRating: 1000,
      nickname: 'Player',
    });
    mock.battleQueues.set(CURRENT_USER.id, {
      id: 'queue-a',
      userId: CURRENT_USER.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 120_000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now + 1_000_000),
      updatedAt: new Date(now - 1_000),
    });

    const result = await service.switchFromMatchmaking(CURRENT_USER);

    expect(result.data.resolvedTo).toBe('AI');
    expect(mock.battleQueues.get(CURRENT_USER.id)?.status).toBe('CANCELLED');
    expect(mock.battleRooms.size).toBe(1);
    expect([...mock.battleRooms.values()][0]?.mode).toBe(BattleMode.AI);
    expect(mock.battleParticipants.size).toBe(1);
    expect(mock.battleAiOpponents.size).toBe(1);

    const repeated = await service.switchFromMatchmaking(CURRENT_USER);

    expect(repeated.data).toMatchObject({
      resolvedTo: 'AI',
      battleId: result.data.battleId,
    });
    expect(mock.battleRooms.size).toBe(1);
  });

  it('rejects the AI switch before the two-minute server-side unlock', async () => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const service = new BattleAiService(
      mock.prisma as never,
      domainService,
      {
        normalizeSkillCode: (skill: string) => skill.toUpperCase(),
        assertAvailableSkill: jest.fn(),
      } as never,
      { createQuestionSnapshots: jest.fn() } as never,
    );
    mock.battleQueues.set(CURRENT_USER.id, {
      id: 'queue-a',
      userId: CURRENT_USER.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(Date.now() - 119_000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(Date.now() + 1_000_000),
      updatedAt: new Date(),
    });

    await expect(
      service.switchFromMatchmaking(CURRENT_USER),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(mock.battleRooms.size).toBe(0);
    expect(mock.battleQueues.get(CURRENT_USER.id)?.status).toBe('SEARCHING');
  });

  it('returns an already matched human room instead of creating AI', async () => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const service = new BattleAiService(
      mock.prisma as never,
      domainService,
      { normalizeSkillCode: (skill: string) => skill.toUpperCase() } as never,
      { createQuestionSnapshots: jest.fn() } as never,
    );
    mock.users.set(CURRENT_USER.id, {
      id: CURRENT_USER.id,
      battleRating: 1000,
    });
    mock.users.set('human-opponent', {
      id: 'human-opponent',
      battleRating: 1000,
    });
    mock.battleRooms.set('human-room', {
      id: 'human-room',
      mode: BattleMode.RANKED,
      skillCode: 'PYTHON',
      status: BattleRoomStatus.WAITING,
      questionCount: 20,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: CURRENT_USER.id,
      expiresAt: new Date(Date.now() + 45_000),
      startedAt: null,
      createdAt: new Date(),
    });
    mock.battleParticipants.set('human-a', {
      id: 'human-a',
      battleRoomId: 'human-room',
      userId: CURRENT_USER.id,
      seat: 1,
      status: BattleParticipantStatus.JOINED,
      result: 'NONE',
      joinedAt: new Date(),
    });
    mock.battleParticipants.set('human-b', {
      id: 'human-b',
      battleRoomId: 'human-room',
      userId: 'human-opponent',
      seat: 2,
      status: BattleParticipantStatus.JOINED,
      result: 'NONE',
      joinedAt: new Date(),
    });

    const result = await service.switchFromMatchmaking(CURRENT_USER);

    expect(result.data).toMatchObject({
      resolvedTo: 'HUMAN',
      battleId: 'human-room',
    });
    expect(mock.battleRooms.size).toBe(1);
    expect(mock.battleAiOpponents.size).toBe(0);
  });

  it('allows the most recent unlocked EXPIRED queue but never reuses CANCELLED search', async () => {
    const createContext = (status: 'EXPIRED' | 'CANCELLED') => {
      const mock = createBattlePrismaMock();
      const domainService = new BattleDomainService(mock.prisma as never);
      const snapshots = Array.from({ length: 20 }, (_, index) => ({
        id: `snapshot-${index + 1}`,
        orderIndex: index,
        difficulty: BattleQuestionDifficulty.MEDIUM,
      }));
      const service = new BattleAiService(
        mock.prisma as never,
        domainService,
        {
          normalizeSkillCode: (skill: string) => skill.toUpperCase(),
          assertAvailableSkill: jest.fn(async (skill: string) => ({
            code: skill,
            name: 'Python',
          })),
        } as never,
        { createQuestionSnapshots: jest.fn(async () => snapshots) } as never,
      );
      const now = Date.now();
      mock.users.set(CURRENT_USER.id, {
        id: CURRENT_USER.id,
        battleRating: 1000,
      });
      mock.battleQueues.set(CURRENT_USER.id, {
        id: 'queue-a',
        userId: CURRENT_USER.id,
        skillCode: 'PYTHON',
        status,
        ratingSnapshot: 1000,
        matchedBattleRoomId: null,
        searchStartedAt: new Date(now - 31 * 60 * 1000),
        matchedAt: null,
        cancelledAt: status === 'CANCELLED' ? new Date(now - 1_000) : null,
        expiresAt: new Date(now - 60_000),
        updatedAt: new Date(now - 60_000),
      });

      return { mock, service };
    };

    const expired = createContext('EXPIRED');
    const expiredResult =
      await expired.service.switchFromMatchmaking(CURRENT_USER);

    expect(expiredResult.data.resolvedTo).toBe('AI');
    expect(expired.mock.battleRooms.size).toBe(1);
    expect(expired.mock.battleQueues.get(CURRENT_USER.id)?.status).toBe(
      'CANCELLED',
    );

    const cancelled = createContext('CANCELLED');
    await expect(
      cancelled.service.switchFromMatchmaking(CURRENT_USER),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(cancelled.mock.battleRooms.size).toBe(0);
    expect(cancelled.mock.battleQueues.get(CURRENT_USER.id)?.status).toBe(
      'CANCELLED',
    );
  });

  it('rolls back the queue cancellation when AI room creation fails', async () => {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const service = new BattleAiService(
      mock.prisma as never,
      domainService,
      {
        normalizeSkillCode: (skill: string) => skill.toUpperCase(),
        assertAvailableSkill: jest.fn(async (skill: string) => ({
          code: skill,
          name: 'Python',
        })),
      } as never,
      {
        createQuestionSnapshots: jest.fn(async () => {
          throw new Error('question snapshot creation failed');
        }),
      } as never,
    );
    const now = Date.now();
    mock.users.set(CURRENT_USER.id, {
      id: CURRENT_USER.id,
      battleRating: 1000,
    });
    mock.battleQueues.set(CURRENT_USER.id, {
      id: 'queue-a',
      userId: CURRENT_USER.id,
      skillCode: 'PYTHON',
      status: 'SEARCHING',
      ratingSnapshot: 1000,
      matchedBattleRoomId: null,
      searchStartedAt: new Date(now - 121_000),
      matchedAt: null,
      cancelledAt: null,
      expiresAt: new Date(now + 1_000_000),
      updatedAt: new Date(),
    });

    await expect(service.switchFromMatchmaking(CURRENT_USER)).rejects.toThrow(
      'question snapshot creation failed',
    );

    expect(mock.battleQueues.get(CURRENT_USER.id)?.status).toBe('SEARCHING');
    expect(mock.battleRooms.size).toBe(0);
    expect(mock.battleParticipants.size).toBe(0);
    expect(mock.battleAiOpponents.size).toBe(0);
  });
});
