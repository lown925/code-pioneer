import { BattleDomainService } from './battle-domain.service';
import { BattleLeaderboardService } from './battle-leaderboard.service';
import { createBattlePrismaMock } from './battle-test.helpers';

describe('profile-major global leaderboard projection', () => {
  it('does not fall back to another professional rating for an unranked profile track', async () => {
    const mock = createBattlePrismaMock();
    const userId = '11111111-1111-4111-8111-111111111111';
    mock.users.set(userId, {
      id: userId,
      battleRating: 1000,
      nickname: 'Profile Major User',
      major: 'major.data_science_big_data',
    });
    mock.userBattleTrackRatings.set(`${userId}:big-data`, {
      id: 'rating-big-data',
      userId,
      trackKey: 'big-data',
      rating: 1000,
      highestRating: 1000,
      rankedBattles: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
    });
    mock.userBattleTrackRatings.set(`${userId}:software-engineering`, {
      id: 'rating-software',
      userId,
      trackKey: 'software-engineering',
      rating: 1600,
      highestRating: 1600,
      rankedBattles: 12,
      wins: 12,
      losses: 0,
      draws: 0,
      currentWinStreak: 4,
      bestWinStreak: 4,
    });

    const service = new BattleLeaderboardService(
      mock.prisma as never,
      new BattleDomainService(mock.prisma as never),
      { assertAvailableSkill: jest.fn() } as never,
    );
    const result = await service.getLeaderboard(userId);

    expect(result.data.items).toHaveLength(0);
    expect(result.data.myRank).toBeNull();
    expect(result.data.myRating).toBeNull();
    expect(result.data.myProfessionalTrack).toMatchObject({
      trackKey: 'big-data',
      shortName: '大数据',
    });
  });

  it('does not guess a professional label for an unmapped major', async () => {
    const mock = createBattlePrismaMock();
    const userId = '22222222-2222-4222-8222-222222222222';
    mock.users.set(userId, {
      id: userId,
      battleRating: 1000,
      nickname: 'Custom Major User',
      major: 'custom:未映射专业',
    });
    mock.userBattleTrackRatings.set(`${userId}:computer-science`, {
      id: 'rating-computer',
      userId,
      trackKey: 'computer-science',
      rating: 1800,
      highestRating: 1800,
      rankedBattles: 20,
      wins: 20,
      losses: 0,
      draws: 0,
      currentWinStreak: 5,
      bestWinStreak: 5,
    });

    const service = new BattleLeaderboardService(
      mock.prisma as never,
      new BattleDomainService(mock.prisma as never),
      { assertAvailableSkill: jest.fn() } as never,
    );
    const result = await service.getLeaderboard(userId);

    expect(result.data.items).toHaveLength(0);
    expect(result.data.myRank).toBeNull();
    expect(result.data.myRating).toBeNull();
    expect(result.data.myProfessionalTrack).toBeNull();
  });
});
