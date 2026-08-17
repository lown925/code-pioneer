import { BattleDomainService } from './battle-domain.service';
import { BattleLeaderboardService } from './battle-leaderboard.service';
import { createBattlePrismaMock } from './battle-test.helpers';

describe('BattleLeaderboardService skill leaderboard', () => {
  it('returns ranked skill users and excludes unranked users', async () => {
    const mock = createBattlePrismaMock();
    const currentUserId = '11111111-1111-4111-8111-111111111111';
    const unrankedUserId = '22222222-2222-4222-8222-222222222222';
    mock.users.set(currentUserId, {
      id: currentUserId,
      battleRating: 1000,
      nickname: 'Ranked',
    });
    mock.users.set(unrankedUserId, {
      id: unrankedUserId,
      battleRating: 1000,
      nickname: 'Unranked',
    });
    mock.userBattleSkillRatings.set(`${currentUserId}:PYTHON`, {
      id: 'rating-1',
      userId: currentUserId,
      skillCode: 'PYTHON',
      rating: 1080,
      highestRating: 1100,
      rankedBattles: 4,
      wins: 3,
      losses: 1,
      draws: 0,
      currentWinStreak: 2,
      bestWinStreak: 2,
    });
    mock.userBattleSkillRatings.set(`${unrankedUserId}:PYTHON`, {
      id: 'rating-2',
      userId: unrankedUserId,
      skillCode: 'PYTHON',
      rating: 1000,
      highestRating: 1000,
      rankedBattles: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
    });
    const service = new BattleLeaderboardService(
      mock.prisma as never,
      new BattleDomainService(mock.prisma as never),
      {
        assertAvailableSkill: jest.fn(async () => ({
          code: 'PYTHON',
          name: 'Python',
        })),
      } as never,
    );

    const result = await service.getLeaderboard(currentUserId, 1, 20, 'PYTHON');

    expect(result.data.skill).toBe('PYTHON');
    expect(result.data.total).toBe(1);
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]?.userId).toBe(currentUserId);
    expect(result.data.myRank).toBe(1);
    expect(result.data.items[0]).toMatchObject({
      rankedBattles: 4,
      star: 3,
      title: 'Python 熟练者',
      winRate: 75,
    });
  });

  it('sums all ranked skill ratings for the total leaderboard', async () => {
    const mock = createBattlePrismaMock();
    const userA = '11111111-1111-4111-8111-111111111111';
    const userB = '22222222-2222-4222-8222-222222222222';
    mock.users.set(userA, {
      id: userA,
      battleRating: 1000,
      nickname: 'Player A',
    });
    mock.users.set(userB, {
      id: userB,
      battleRating: 1000,
      nickname: 'Player B',
    });
    mock.userBattleSkillRatings.set(`${userA}:PYTHON`, {
      id: 'rating-a-python',
      userId: userA,
      skillCode: 'PYTHON',
      rating: 1016,
      highestRating: 1020,
      rankedBattles: 3,
      wins: 2,
      losses: 1,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 2,
    });
    mock.userBattleSkillRatings.set(`${userA}:JAVASCRIPT`, {
      id: 'rating-a-javascript',
      userId: userA,
      skillCode: 'JAVASCRIPT',
      rating: 980,
      highestRating: 1000,
      rankedBattles: 2,
      wins: 1,
      losses: 1,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 1,
    });
    mock.userBattleSkillRatings.set(`${userB}:PYTHON`, {
      id: 'rating-b-python',
      userId: userB,
      skillCode: 'PYTHON',
      rating: 1000,
      highestRating: 1000,
      rankedBattles: 2,
      wins: 1,
      losses: 1,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 1,
    });
    const service = new BattleLeaderboardService(
      mock.prisma as never,
      new BattleDomainService(mock.prisma as never),
      { assertAvailableSkill: jest.fn() } as never,
    );

    const result = await service.getLeaderboard(userA, 1, 20);

    expect(result.data.skill).toBeNull();
    expect(result.data.items[0]).toEqual(
      expect.objectContaining({
        userId: userA,
        rating: 1996,
        highestRating: 2020,
        rankedBattles: 5,
        wins: 3,
        losses: 2,
      }),
    );
    expect(result.data.items[0]).not.toHaveProperty('star');
    expect(result.data.items[0]).not.toHaveProperty('title');
    expect(result.data.myRating).toBe(1996);
    expect(result.data.myRank).toBe(1);
  });
});
