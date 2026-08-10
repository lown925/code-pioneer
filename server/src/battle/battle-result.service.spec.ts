import { ConflictException, ForbiddenException } from '@nestjs/common';
import {
  BattleMode,
  BattleParticipantStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleResultService } from './battle-result.service';
import { BattleRoomService } from './battle-room.service';
import { BattleDomainService } from './battle-domain.service';
import { BattleRatingService } from './battle-rating.service';
import { BattleScoreService } from './battle-score.service';
import { BattleSettlementService } from './battle-settlement.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_A_ID = '11111111-1111-4111-8111-111111111111';
const USER_B_ID = '22222222-2222-4222-8222-222222222222';
const USER_C_ID = '33333333-3333-4333-8333-333333333333';

describe('BattleResultService', () => {
  function createService(status: BattleRoomStatus) {
    const mock = createBattlePrismaMock();
    const scoreService = new BattleScoreService();
    const ratingService = new BattleRatingService();
    const domainService = new BattleDomainService(mock.prisma as never);
    const settlementService = new BattleSettlementService(
      mock.prisma as never,
      scoreService,
      ratingService,
      domainService,
    );
    const roomService = new BattleRoomService(
      mock.prisma as never,
      domainService,
      settlementService,
    );
    const service = new BattleResultService(
      mock.prisma as never,
      roomService,
      settlementService,
    );
    const now = Date.now();
    const startedAt =
      status === BattleRoomStatus.IN_PROGRESS
        ? new Date(now - 60000)
        : new Date(now + 60000);
    const expiresAt =
      status === BattleRoomStatus.IN_PROGRESS
        ? new Date(now + 120000)
        : new Date(now + 240000);
    const completedAt =
      status === BattleRoomStatus.COMPLETED
        ? new Date(now - 1000)
        : null;

    mock.users.set(USER_A_ID, {
      id: USER_A_ID,
      battleRating: 1000,
      nickname: 'Alpha',
      avatarUrl: 'https://cdn.example.com/a.png',
    });
    mock.users.set(USER_B_ID, {
      id: USER_B_ID,
      battleRating: 980,
      nickname: 'Beta',
      avatarUrl: 'https://cdn.example.com/b.png',
    });

    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: BattleMode.RANKED,
      status,
      questionCount: 2,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A_ID,
      startedAt,
      expiresAt,
      settledAt: completedAt,
      completedAt,
      cancelledAt: null,
      endReason: status === BattleRoomStatus.COMPLETED ? 'NORMAL' : null,
      winnerUserId: status === BattleRoomStatus.COMPLETED ? USER_A_ID : null,
      createdAt: new Date(now - 120000),
      updatedAt: completedAt ?? new Date(now - 1000),
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A_ID,
      seat: 1,
      status:
        status === BattleRoomStatus.COMPLETED
          ? BattleParticipantStatus.COMPLETED
          : BattleParticipantStatus.PLAYING,
      result:
        status === BattleRoomStatus.COMPLETED
          ? BattleResult.WIN
          : BattleResult.NONE,
      joinedAt: new Date(now - 90000),
      score: 4,
      correctCount: 2,
      wrongCount: 0,
      unansweredCount: 0,
      ratingBefore: 1000,
      ratingDelta: 16,
      ratingAfter: 1016,
      completedAt:
        status === BattleRoomStatus.COMPLETED
          ? completedAt
          : null,
    });
    mock.battleParticipants.set('participant-b', {
      id: 'participant-b',
      battleRoomId: 'room-1',
      userId: USER_B_ID,
      seat: 2,
      status:
        status === BattleRoomStatus.COMPLETED
          ? BattleParticipantStatus.COMPLETED
          : BattleParticipantStatus.PLAYING,
      result:
        status === BattleRoomStatus.COMPLETED
          ? BattleResult.LOSS
          : BattleResult.NONE,
      joinedAt: new Date(now - 89000),
      score: 1,
      correctCount: 1,
      wrongCount: 1,
      unansweredCount: 0,
      ratingBefore: 980,
      ratingDelta: -16,
      ratingAfter: 964,
      completedAt:
        status === BattleRoomStatus.COMPLETED
          ? completedAt
          : null,
    });

    return {
      mock,
      service,
    };
  }

  it('returns a pending payload before settlement without leaking scores', async () => {
    const { service } = createService(BattleRoomStatus.IN_PROGRESS);

    const result = await service.getBattleResult(USER_A_ID, 'room-1');

    expect(result.data).toMatchObject({
      battleId: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.IN_PROGRESS,
      completed: false,
    });
    expect(result.data).not.toHaveProperty('myScore');
    expect(result.data).not.toHaveProperty('opponentScore');
  });

  it('returns the completed result summary after settlement', async () => {
    const { service } = createService(BattleRoomStatus.COMPLETED);

    const result = await service.getBattleResult(USER_A_ID, 'room-1');

    expect(result.data).toMatchObject({
      battleId: 'room-1',
      mode: BattleMode.RANKED,
      status: BattleRoomStatus.COMPLETED,
      completed: true,
      result: BattleResult.WIN,
      myScore: 4,
      opponentScore: 1,
      ratingBefore: 1000,
      ratingDelta: 16,
      ratingAfter: 1016,
      opponent: {
        userId: USER_B_ID,
        nickname: 'Beta',
      },
    });
  });

  it('rejects non-participants and not-started rooms', async () => {
    const { mock, service } = createService(BattleRoomStatus.READY);

    await expect(service.getBattleResult(USER_A_ID, 'room-1')).rejects.toBeInstanceOf(
      ConflictException,
    );

    mock.battleRooms.get('room-1')!.status = BattleRoomStatus.COMPLETED;

    await expect(service.getBattleResult(USER_C_ID, 'room-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
