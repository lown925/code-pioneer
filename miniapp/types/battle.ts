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

export type BattleParticipantSummary = {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  seat: number;
  status: string;
};

export type BattleRoomSummaryResponse = {
  battleId: string;
  mode: string;
  status: string;
  questionCount: number;
  durationSeconds: number;
  createdAt: string;
  startedAt: string | null;
  expiresAt: string | null;
  serverTime: string;
  participants: BattleParticipantSummary[];
};

export type BattleRoomDetailResponse = BattleRoomSummaryResponse & {
  currentParticipantStatus: string | null;
  answeredCount: number;
  totalQuestionCount: number;
  completed: boolean;
  resultAvailable: boolean;
};

export type FriendRoomCreateResponse = {
  battleId: string;
  mode: string;
  status: string;
  invitationToken: string;
  sharePath: string;
  expiresAt: string;
  serverTime: string;
};

export type FriendRoomPreviewResponse = {
  battleId: string;
  roomStatus: string;
  invitationStatus: string;
  inviter: {
    userId: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  participantCount: number;
  expiresAt: string;
  canJoin: boolean;
  cannotJoinReason: string | null;
  serverTime: string;
};

export type BattleContentBlock =
  | {
      type: 'TEXT';
      text: string;
    }
  | {
      type: 'CODE';
      code: string;
      language?: string;
    }
  | {
      type: 'IMAGE';
      url: string;
      alt?: string;
    };

export type BattleQuestionOptionSnapshotResponse = {
  id: string;
  sourceOptionId: string;
  orderIndex: number;
  blocks: BattleContentBlock[];
};

export type BattleSubmittedAnswerResponse =
  | {
      type: 'SINGLE_CHOICE';
      optionId: string;
    }
  | {
      type: 'CODE_FILL';
      value: string;
    };

export type BattleQuestionItemResponse = {
  battleQuestionId: string;
  orderIndex: number;
  questionType: string;
  presentation: string;
  difficulty: string | null;
  stem: BattleContentBlock[];
  options: BattleQuestionOptionSnapshotResponse[];
  programmingLanguage: string | null;
  answered: boolean;
  submittedAt: string | null;
  submittedAnswer: BattleSubmittedAnswerResponse | null;
};

export type BattleQuestionsResponse = {
  battleId: string;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
  serverTime: string;
  questions?: BattleQuestionItemResponse[];
};

export type BattleAnswerSubmissionResponse = {
  accepted: true;
  battleQuestionId: string;
  submittedAt: string;
  mySubmittedCount: number;
  totalQuestions: number;
  serverTime: string;
};

export type BattleSubmitActionResponse = {
  battleId: string;
  roomStatus: string;
  participantStatus: string | null;
  waitingForOpponent: boolean;
  completed: boolean;
  serverTime: string;
};

export type PendingBattleResultResponse = {
  battleId: string;
  mode: string;
  status: string;
  completed: false;
  serverTime: string;
};

export type CompletedBattleResultResponse = {
  battleId: string;
  mode: string;
  status: 'COMPLETED';
  completed: true;
  result: 'WIN' | 'LOSS' | 'DRAW';
  myScore: number;
  opponentScore: number;
  myCorrectCount: number;
  myWrongCount: number;
  myUnansweredCount: number;
  opponentCorrectCount: number;
  opponentWrongCount: number;
  opponentUnansweredCount: number;
  ratingBefore: number;
  ratingDelta: number;
  ratingAfter: number;
  opponent: {
    userId: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  endReason: string | null;
  completedAt: string;
  serverTime: string;
};

export type BattleResultResponse =
  | PendingBattleResultResponse
  | CompletedBattleResultResponse;
