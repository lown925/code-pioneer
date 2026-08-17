import { BattleProfileService } from './battle-profile.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('BattleProfileService', () => {
  it('counts training in total battles without diluting competitive win rate', async () => {
    const profile = {
      userId: USER_ID,
      rating: 1200,
      highestRating: 1250,
      totalBattles: 5,
      rankedBattles: 2,
      friendBattles: 1,
      trainingBattles: 2,
      wins: 2,
      losses: 1,
      draws: 0,
      currentWinStreak: 1,
      bestWinStreak: 2,
    };
    const prisma = {
      battleProfile: {
        findMany: jest.fn(async () => [profile]),
      },
      userBattleSkillRating: {
        findMany: jest.fn(async () => []),
      },
    };
    const battleDomainService = {
      ensureBattleProfile: jest.fn(async () => profile),
    };
    const battleSkillService = {
      getAvailableSkills: jest.fn(async () => []),
    };
    const service = new BattleProfileService(
      prisma as never,
      battleDomainService as never,
      battleSkillService as never,
    );

    const result = await service.getBattleProfile(USER_ID);

    expect(result.data).toMatchObject({
      totalBattles: 5,
      rankedBattles: 2,
      friendBattles: 1,
      trainingBattles: 2,
      wins: 2,
      losses: 1,
      draws: 0,
      winRate: 66.7,
    });
  });

  it('reports an existing default skill rating as unranked until a ranked battle completes', async () => {
    const prisma = {
      battleProfile: {
        findMany: jest.fn(async () => []),
      },
      userBattleSkillRating: {
        findMany: jest.fn(async () => [
          {
            userId: USER_ID,
            skillCode: 'PYTHON',
            rating: 1000,
            highestRating: 1000,
            rankedBattles: 0,
          },
        ]),
      },
    };
    const battleDomainService = {
      ensureBattleProfile: jest.fn(async () => ({
        userId: USER_ID,
        rating: 1000,
        highestRating: 1000,
        totalBattles: 0,
        rankedBattles: 0,
        friendBattles: 0,
        trainingBattles: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        currentWinStreak: 0,
        bestWinStreak: 0,
      })),
    };
    const battleSkillService = {
      getAvailableSkills: jest.fn(async () => [
        { code: 'PYTHON', name: 'Python', questionCount: 190 },
      ]),
    };
    const service = new BattleProfileService(
      prisma as never,
      battleDomainService as never,
      battleSkillService as never,
    );

    const result = await service.getBattleProfile(USER_ID);

    expect(result.data.availableSkills[0]).toMatchObject({
      status: 'UNRANKED',
      star: null,
      title: '未定级',
    });
  });

  it('returns the skill star and title after ranked battles exist', async () => {
    const profile = {
      userId: USER_ID,
      rating: 1000,
      highestRating: 1000,
      totalBattles: 1,
      rankedBattles: 1,
      friendBattles: 0,
      trainingBattles: 0,
      wins: 1,
      losses: 0,
      draws: 0,
      currentWinStreak: 1,
      bestWinStreak: 1,
    };
    const prisma = {
      battleProfile: {
        findMany: jest.fn(async () => [profile]),
      },
      userBattleSkillRating: {
        findMany: jest.fn(async () => [
          {
            userId: USER_ID,
            skillCode: 'PYTHON',
            rating: 1080,
            highestRating: 1080,
            rankedBattles: 1,
          },
        ]),
      },
    };
    const service = new BattleProfileService(
      prisma as never,
      { ensureBattleProfile: jest.fn(async () => profile) } as never,
      {
        getAvailableSkills: jest.fn(async () => [
          { code: 'PYTHON', name: 'Python', questionCount: 190 },
        ]),
      } as never,
    );

    const result = await service.getBattleProfile(USER_ID);

    expect(result.data.availableSkills[0]).toMatchObject({
      status: 'RANKED',
      star: 3,
      title: 'Python 熟练者',
    });
  });
});
