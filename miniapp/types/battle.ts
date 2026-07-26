export type BattleProfileResponse = {
  userId: string;
  rating: number;
  highestRating: number;
  totalBattles: number;
  rankedBattles: number;
  friendBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentWinStreak: number;
  bestWinStreak: number;
  rank: number;
  currentRank: number;
};

export type BattleLeaderboardItem = {
  rank: number;
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  rating: number;
  highestRating: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
};

export type BattleLeaderboardResponse = {
  items: BattleLeaderboardItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  myRank: number | null;
  myRating: number | null;
  serverTime: string;
};

export type BattleLeaderboardQuery = {
  page: number;
  pageSize: number;
};

export type MatchmakingViewStatus =
  | 'IDLE'
  | 'SEARCHING'
  | 'MATCHED'
  | 'CANCELLED'
  | 'EXPIRED';

export type MatchmakingStatusResponse = {
  status: MatchmakingViewStatus;
  battleId: string | null;
  searchStartedAt: string | null;
  expiresAt: string | null;
  serverTime: string;
};
