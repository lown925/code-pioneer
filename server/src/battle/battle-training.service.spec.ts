import { ConflictException } from '@nestjs/common';
import { BattleMode, BattleRoomStatus } from '../../generated/prisma/enums';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleTrainingService } from './battle-training.service';

const CURRENT_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: 'session-a',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

describe('BattleTrainingService', () => {
  function createService(waitedMs = 61_000) {
    const now = Date.now();
    const tx = {
      battleMatchQueue: {
        findUnique: jest.fn(async () => ({
          status: 'SEARCHING',
          skillCode: 'PYTHON',
          searchStartedAt: new Date(now - waitedMs),
          expiresAt: new Date(now + 60_000),
        })),
        updateMany: jest.fn(async () => ({ count: 1 })),
      },
      battleRoom: {
        create: jest.fn(async () => ({ id: 'training-room' })),
      },
      battleParticipant: {
        create: jest.fn(async () => ({ id: 'training-participant' })),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    };
    const domainService = {
      acquireUserBattleLock: jest.fn(async () => undefined),
      normalizeExpiredFriendRoomsForUser: jest.fn(async () => 0),
      assertUserHasNoActiveBattle: jest.fn(async () => undefined),
    };
    const skillService = {
      assertAvailableSkill: jest.fn(async () => ({
        code: 'PYTHON',
        name: 'Python',
        questionCount: 100,
      })),
    };
    const questionService = {
      createQuestionSnapshotsAndStartCountdown: jest.fn(async () => ({
        startedAt: new Date(now + 3_000),
        expiresAt: new Date(now + 183_000),
      })),
    };
    const service = new BattleTrainingService(
      prisma as never,
      domainService as never,
      skillService as never,
      questionService as never,
    );

    return {
      service,
      tx,
      domainService,
      skillService,
      questionService,
    };
  }

  it('atomically cancels the active Python queue and creates a real training room', async () => {
    const { service, tx, domainService, skillService, questionService } =
      createService();

    const result = await service.startTraining(CURRENT_USER);

    expect(result.data).toMatchObject({
      battleId: 'training-room',
      mode: BattleMode.TRAINING,
      skill: 'PYTHON',
      status: BattleRoomStatus.COUNTDOWN,
    });
    expect(domainService.acquireUserBattleLock).toHaveBeenCalledWith(
      CURRENT_USER.id,
      tx,
    );
    expect(skillService.assertAvailableSkill).toHaveBeenCalledWith(
      'PYTHON',
      tx,
    );
    expect(tx.battleMatchQueue.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: CURRENT_USER.id,
          status: 'SEARCHING',
          skillCode: 'PYTHON',
        }),
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
    expect(tx.battleRoom.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mode: BattleMode.TRAINING,
          skillCode: 'PYTHON',
        }),
      }),
    );
    expect(tx.battleParticipant.create).toHaveBeenCalledTimes(1);
    expect(
      questionService.createQuestionSnapshotsAndStartCountdown,
    ).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        battleId: 'training-room',
        skillCode: 'PYTHON',
      }),
    );
  });

  it('rejects training before the user has waited for sixty seconds', async () => {
    const { service, tx } = createService(59_000);

    await expect(service.startTraining(CURRENT_USER)).rejects.toEqual(
      expect.objectContaining<Partial<ConflictException>>({
        message: BATTLE_ERROR_CODES.BATTLE_TRAINING_NOT_AVAILABLE,
      }),
    );
    expect(tx.battleMatchQueue.updateMany).not.toHaveBeenCalled();
    expect(tx.battleRoom.create).not.toHaveBeenCalled();
    expect(tx.battleParticipant.create).not.toHaveBeenCalled();
  });
});
