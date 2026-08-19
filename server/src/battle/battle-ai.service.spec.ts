import {
  BattleMode,
  BattleParticipantStatus,
  BattleQuestionDifficulty,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleAiService } from './battle-ai.service';
import { AI_STRATEGY_VERSION } from './battle.constants';

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
});
