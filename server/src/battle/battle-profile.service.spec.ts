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
});
