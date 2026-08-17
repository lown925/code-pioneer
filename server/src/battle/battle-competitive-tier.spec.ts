import {
  calculateBattleCompetitiveTier,
  calculateBattleCompetitiveTierChange,
  createBattleCompetitiveTitle,
} from './battle-competitive-tier';

describe('battle competitive tier', () => {
  it.each([
    [0, 1000, null],
    [1, 799, 1],
    [1, 800, 2],
    [1, 899, 2],
    [1, 900, 3],
    [1, 1099, 3],
    [1, 1100, 4],
    [1, 1249, 4],
    [1, 1250, 5],
    [1, 1399, 5],
    [1, 1400, 6],
  ])(
    'maps rankedBattles=%i and rating=%i to star %s',
    (battles, rating, star) => {
      expect(calculateBattleCompetitiveTier(rating, battles).star).toBe(star);
    },
  );

  it('keeps a default 1000 rating unranked before the first battle', () => {
    expect(calculateBattleCompetitiveTier(1000, 0)).toEqual({
      star: null,
      status: 'UNRANKED',
    });
  });

  it.each([
    [1, 'Python 新秀'],
    [2, 'Python 进阶者'],
    [3, 'Python 熟练者'],
    [4, 'Python 高手'],
    [5, 'Python 专家'],
    [6, 'Python 大师'],
  ])('maps star %i to a skill title', (star, title) => {
    expect(
      createBattleCompetitiveTitle('Python', star as 1 | 2 | 3 | 4 | 5 | 6),
    ).toBe(title);
  });

  it('reports placement, promotion, demotion, and unchanged tiers', () => {
    expect(calculateBattleCompetitiveTierChange(1000, 1080, true)).toEqual({
      beforeStar: null,
      afterStar: 3,
      change: 'PLACED',
    });
    expect(calculateBattleCompetitiveTierChange(899, 901, false).change).toBe(
      'PROMOTED',
    );
    expect(calculateBattleCompetitiveTierChange(1100, 1099, false).change).toBe(
      'DEMOTED',
    );
    expect(calculateBattleCompetitiveTierChange(1000, 1020, false).change).toBe(
      'UNCHANGED',
    );
  });
});
