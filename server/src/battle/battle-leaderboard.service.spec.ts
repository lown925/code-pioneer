import { BattleDomainService } from './battle-domain.service';
import { BattleLeaderboardService } from './battle-leaderboard.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_BIG_DATA = '11111111-1111-4111-8111-111111111111';
const USER_SOFTWARE = '22222222-2222-4222-8222-222222222222';
const USER_COMPUTER = '33333333-3333-4333-8333-333333333333';

function createService(mock: ReturnType<typeof createBattlePrismaMock>) {
  return new BattleLeaderboardService(
    mock.prisma as never,
    new BattleDomainService(mock.prisma as never),
    { assertAvailableSkill: jest.fn() } as never,
  );
}

function addUser(
  mock: ReturnType<typeof createBattlePrismaMock>,
  userId: string,
  major: string | null,
  nickname = userId,
) {
  mock.users.set(userId, { id: userId, battleRating: 1000, nickname, major });
}

function addTrackRating(
  mock: ReturnType<typeof createBattlePrismaMock>,
  userId: string,
  trackKey: string,
  rating: number,
  rankedBattles: number,
  wins = rankedBattles,
) {
  mock.userBattleTrackRatings.set(`${userId}:${trackKey}`, {
    id: `${userId}-${trackKey}`,
    userId,
    trackKey,
    rating,
    highestRating: rating,
    rankedBattles,
    wins,
    losses: rankedBattles - wins,
    draws: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
  });
}

describe('BattleLeaderboardService global leaderboard', () => {
  it('returns one globally sorted row per profile-major user', async () => {
    const mock = createBattlePrismaMock();
    addUser(mock, USER_BIG_DATA, 'major.data_science_big_data', 'Big Data');
    addUser(mock, USER_SOFTWARE, 'major.software_engineering', 'Software');
    addUser(mock, USER_COMPUTER, 'major.computer_science', 'Computer');
    addTrackRating(mock, USER_BIG_DATA, 'big-data', 1300, 2);
    addTrackRating(mock, USER_SOFTWARE, 'software-engineering', 1250, 3);
    addTrackRating(mock, USER_COMPUTER, 'computer-science', 1200, 4);

    const service = createService(mock);
    const result = await service.getLeaderboard(
      USER_COMPUTER,
      1,
      2,
      'PYTHON',
      'software-engineering',
    );

    expect(result.data.items.map((item) => item.userId)).toEqual([
      USER_BIG_DATA,
      USER_SOFTWARE,
    ]);
    expect(result.data.items.map((item) => item.professionalTrack?.shortName)).toEqual([
      '大数据',
      '软件工程',
    ]);
    expect(result.data.total).toBe(3);
    expect(result.data.myRank).toBe(3);
    expect(result.data.myRating).toBe(1200);
    expect(result.data.myProfessionalTrack?.shortName).toBe('计算机');
    expect(result.data.items[0]?.rank).toBe(1);
    expect(result.data.items[1]?.rank).toBe(2);
  });

  it('uses only the profile-major rating and excludes unranked or unmapped users', async () => {
    const mock = createBattlePrismaMock();
    const otherTrackUser = '44444444-4444-4444-8444-444444444444';
    const unmappedUser = '55555555-5555-4555-8555-555555555555';
    addUser(mock, USER_BIG_DATA, 'major.data_science_big_data', 'Big Data');
    addUser(mock, otherTrackUser, 'major.data_science_big_data', 'No Major Rating');
    addUser(mock, unmappedUser, 'custom:自定义专业', 'Unmapped');
    addTrackRating(mock, USER_BIG_DATA, 'big-data', 1100, 1);
    addTrackRating(mock, USER_BIG_DATA, 'software-engineering', 1500, 8);
    addTrackRating(mock, otherTrackUser, 'software-engineering', 1600, 8);
    addTrackRating(mock, unmappedUser, 'computer-science', 1800, 8);

    const result = await createService(mock).getLeaderboard(USER_BIG_DATA);

    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]).toMatchObject({
      userId: USER_BIG_DATA,
      rating: 1100,
      professionalTrack: {
        trackKey: 'big-data',
        shortName: '大数据',
      },
      star: 4,
    });
    expect(result.data.items[0]).not.toMatchObject({ rating: 1500 });
    expect(result.data.myRating).toBe(1100);
  });

  it('applies rating, ranked battles, and user id tie-breaking before pagination', async () => {
    const mock = createBattlePrismaMock();
    const userA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const userB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const userC = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    addUser(mock, userA, 'major.computer_science', 'A');
    addUser(mock, userB, 'major.computer_science', 'B');
    addUser(mock, userC, 'major.computer_science', 'C');
    addTrackRating(mock, userA, 'computer-science', 1200, 2);
    addTrackRating(mock, userB, 'computer-science', 1200, 5);
    addTrackRating(mock, userC, 'computer-science', 1200, 5);

    const service = createService(mock);
    const firstPage = await service.getLeaderboard(userC, 1, 2);
    const secondPage = await service.getLeaderboard(userC, 2, 2);

    expect(firstPage.data.items.map((item) => item.userId)).toEqual([userB, userC]);
    expect(secondPage.data.items.map((item) => item.userId)).toEqual([userA]);
    expect(secondPage.data.items[0]?.rank).toBe(3);
    expect(secondPage.data.myRank).toBe(2);
  });

  it('ignores legacy skill and professional track query values', async () => {
    const mock = createBattlePrismaMock();
    addUser(mock, USER_BIG_DATA, 'major.data_science_big_data', 'Big Data');
    addUser(mock, USER_SOFTWARE, 'major.software_engineering', 'Software');
    addTrackRating(mock, USER_BIG_DATA, 'big-data', 1300, 2);
    addTrackRating(mock, USER_SOFTWARE, 'software-engineering', 1250, 2);

    const service = createService(mock);
    const withLegacyValues = await service.getLeaderboard(USER_BIG_DATA, 1, 20, 'PYTHON', 'big-data');
    const withoutLegacyValues = await service.getLeaderboard(USER_BIG_DATA, 1, 20);

    expect(withLegacyValues.data.items.map((item) => item.userId)).toEqual(
      withoutLegacyValues.data.items.map((item) => item.userId),
    );
    expect(withLegacyValues.data.total).toBe(2);
    expect(withLegacyValues.data.professionalTrackKey).toBeNull();
  });
});
