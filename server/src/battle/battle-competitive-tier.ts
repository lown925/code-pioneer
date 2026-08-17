export type BattleCompetitiveStar = 1 | 2 | 3 | 4 | 5 | 6;

export type BattleCompetitiveStatus = 'RANKED' | 'UNRANKED';

export type BattleCompetitiveTier = {
  star: BattleCompetitiveStar | null;
  status: BattleCompetitiveStatus;
};

export type BattleCompetitiveTierChange =
  'PLACED' | 'PROMOTED' | 'DEMOTED' | 'UNCHANGED';

export function calculateBattleCompetitiveTier(
  rating: number,
  rankedBattles: number,
): BattleCompetitiveTier {
  if (rankedBattles <= 0) {
    return {
      star: null,
      status: 'UNRANKED',
    };
  }

  if (rating < 800) {
    return { star: 1, status: 'RANKED' };
  }

  if (rating < 900) {
    return { star: 2, status: 'RANKED' };
  }

  if (rating < 1100) {
    return { star: 3, status: 'RANKED' };
  }

  if (rating < 1250) {
    return { star: 4, status: 'RANKED' };
  }

  if (rating < 1400) {
    return { star: 5, status: 'RANKED' };
  }

  return { star: 6, status: 'RANKED' };
}

export function createBattleCompetitiveTitle(
  skillName: string,
  star: BattleCompetitiveStar | null,
) {
  if (star === null) {
    return '未定级';
  }

  const suffixByStar: Record<BattleCompetitiveStar, string> = {
    1: '新秀',
    2: '进阶者',
    3: '熟练者',
    4: '高手',
    5: '专家',
    6: '大师',
  };

  return `${skillName} ${suffixByStar[star]}`;
}

export function calculateBattleCompetitiveTierChange(
  ratingBefore: number,
  ratingAfter: number,
  isFirstRankedBattle: boolean,
) {
  const afterStar = calculateBattleCompetitiveTier(ratingAfter, 1).star!;

  if (isFirstRankedBattle) {
    return {
      beforeStar: null,
      afterStar,
      change: 'PLACED' as const,
    };
  }

  const beforeStar = calculateBattleCompetitiveTier(ratingBefore, 1).star!;
  let change: BattleCompetitiveTierChange = 'UNCHANGED';

  if (afterStar > beforeStar) {
    change = 'PROMOTED';
  } else if (afterStar < beforeStar) {
    change = 'DEMOTED';
  }

  return {
    beforeStar,
    afterStar,
    change,
  };
}
