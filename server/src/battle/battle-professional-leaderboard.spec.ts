import { BattleDomainService } from './battle-domain.service';
import { BattleLeaderboardService } from './battle-leaderboard.service';

describe('professional leaderboard', () => {
  it('isolates records by track and excludes lazy-default ratings', async () => {
    const records = [
      {
        userId: 'user-big-data',
        trackKey: 'big-data',
        rating: 1120,
        highestRating: 1140,
        rankedBattles: 4,
        wins: 3,
        losses: 1,
        draws: 0,
        user: { nickname: 'Big Data User', avatarUrl: null },
      },
      {
        userId: 'user-computer',
        trackKey: 'computer-science',
        rating: 1800,
        highestRating: 1800,
        rankedBattles: 12,
        wins: 12,
        losses: 0,
        draws: 0,
        user: { nickname: 'Computer User', avatarUrl: null },
      },
      {
        userId: 'unranked-big-data',
        trackKey: 'big-data',
        rating: 1000,
        highestRating: 1000,
        rankedBattles: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        user: { nickname: 'Unranked', avatarUrl: null },
      },
    ];
    const findMany = jest.fn(({ where }: { where: { trackKey: string; rankedBattles: { gt: number } } }) =>
      Promise.resolve(
        records.filter(
          (record) =>
            record.trackKey === where.trackKey &&
            record.rankedBattles > where.rankedBattles.gt,
        ),
      ),
    );
    const prisma = {
      userBattleTrackRating: { findMany },
    };
    const trackService = {
      normalize: jest.fn((trackKey?: string) => trackKey ?? 'big-data'),
      list: jest.fn(() => [
        {
          trackKey: 'big-data',
          formalName: '数据科学与大数据技术',
          shortName: '大数据',
          majorKeys: [],
        },
      ]),
    };
    const skillService = { assertAvailableSkill: jest.fn() };
    const service = new BattleLeaderboardService(
      prisma as never,
      new BattleDomainService(prisma as never),
      skillService as never,
      trackService as never,
    );

    const result = await service.getLeaderboard(
      'user-big-data',
      1,
      20,
      undefined,
      'big-data',
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { trackKey: 'big-data', rankedBattles: { gt: 0 } },
      }),
    );
    expect(result.data.professionalTrackKey).toBe('big-data');
    expect(result.data.total).toBe(1);
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]?.userId).toBe('user-big-data');
    expect(result.data.myRank).toBe(1);
    expect(result.data.myRating).toBe(1120);
  });
});
