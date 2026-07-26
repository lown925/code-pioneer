type BattleRankingLike = {
  userId: string;
  rating: number;
  highestRating: number;
  wins: number;
};

export function calculateBattleWinRate(totalBattles: number, wins: number) {
  if (totalBattles <= 0) {
    return 0;
  }

  return Number(((wins / totalBattles) * 100).toFixed(1));
}

export function compareBattleRanking(
  left: BattleRankingLike,
  right: BattleRankingLike,
) {
  if (left.rating !== right.rating) {
    return right.rating - left.rating;
  }

  if (left.highestRating !== right.highestRating) {
    return right.highestRating - left.highestRating;
  }

  if (left.wins !== right.wins) {
    return right.wins - left.wins;
  }

  return left.userId.localeCompare(right.userId);
}

export function calculateBattleRank(
  sortedProfiles: BattleRankingLike[],
  userId: string,
) {
  const index = sortedProfiles.findIndex((profile) => profile.userId === userId);

  return index === -1 ? null : index + 1;
}
