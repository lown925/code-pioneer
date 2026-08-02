export type BattleMode = 'RANKED' | 'FRIEND';

export type BattleRoomStatus =
  | 'WAITING'
  | 'READY'
  | 'COUNTDOWN'
  | 'IN_PROGRESS'
  | 'SETTLING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BattleParticipantStatus =
  | 'JOINED'
  | 'READY'
  | 'PLAYING'
  | 'SUBMITTED'
  | 'FORFEITED'
  | 'COMPLETED';

export type BattleResult = 'WIN' | 'LOSS' | 'DRAW';

export type BattleQuestionType = 'SINGLE_CHOICE' | 'CODE_FILL';

export type BattleQuestionPresentation =
  | 'TEXT_CHOICE'
  | 'CODE_READING'
  | 'CODE_PURPOSE'
  | 'OUTPUT_PREDICTION'
  | 'BUG_FIX'
  | 'CODE_COMPLETION_CHOICE'
  | 'CODE_SNIPPET_CHOICE'
  | 'INPUT_CODE_FILL';

export type BattleQuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type BattleInvitationStatus =
  | 'ACTIVE'
  | 'ACCEPTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BattleEndReason =
  | 'NORMAL'
  | 'USER_FORFEIT'
  | 'MATCH_TIMEOUT'
  | 'SYSTEM_CANCELLED'
  | 'EXPIRED';

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
  status: BattleParticipantStatus;
};

export type BattleRoomSummaryResponse = {
  battleId: string;
  mode: BattleMode;
  status: BattleRoomStatus;
  questionCount: number;
  durationSeconds: number;
  createdAt: string;
  startedAt: string | null;
  expiresAt: string | null;
  serverTime: string;
  participants: BattleParticipantSummary[];
};

export type BattleRoomDetailResponse = BattleRoomSummaryResponse & {
  currentParticipantStatus: BattleParticipantStatus | null;
  answeredCount: number;
  totalQuestionCount: number;
  completed: boolean;
  resultAvailable: boolean;
};

export type FriendRoomCreateResponse = {
  battleId: string;
  mode: BattleMode;
  status: BattleRoomStatus;
  invitationToken: string;
  inviteCode: string | null;
  sharePath: string;
  expiresAt: string;
  serverTime: string;
};

export type FriendRoomPreviewResponse = {
  battleId: string;
  roomStatus: BattleRoomStatus;
  invitationStatus: BattleInvitationStatus;
  inviteCode: string | null;
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
  questionType: BattleQuestionType;
  presentation: BattleQuestionPresentation;
  difficulty: BattleQuestionDifficulty | null;
  stem: BattleContentBlock[];
  options: BattleQuestionOptionSnapshotResponse[];
  programmingLanguage: string | null;
  answered: boolean;
  submittedAt: string | null;
  answerVersion: number | null;
  submittedAnswer: BattleSubmittedAnswerResponse | null;
};

export type BattleQuestionsResponse = {
  battleId: string;
  status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING' | 'COMPLETED';
  startedAt: string | null;
  expiresAt: string | null;
  serverTime: string;
  questions?: BattleQuestionItemResponse[];
};

export type BattleAnswerSubmissionResponse = {
  accepted: true;
  battleQuestionId: string;
  submittedAt: string;
  answerVersion: number;
  mySubmittedCount: number;
  totalQuestions: number;
  serverTime: string;
};

export type BattleSubmitActionResponse = {
  battleId: string;
  roomStatus: BattleRoomStatus;
  participantStatus: BattleParticipantStatus | null;
  waitingForOpponent: boolean;
  completed: boolean;
  serverTime: string;
};

export type PendingBattleResultResponse = {
  battleId: string;
  mode: BattleMode;
  status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING';
  completed: false;
  serverTime: string;
};

export type CompletedBattleResultResponse = {
  battleId: string;
  mode: BattleMode;
  status: 'COMPLETED';
  completed: true;
  result: BattleResult;
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
  endReason: BattleEndReason | null;
  completedAt: string;
  serverTime: string;
};

export type BattleResultResponse =
  | PendingBattleResultResponse
  | CompletedBattleResultResponse;

export type BattleHistoryQuery = {
  page: number;
  pageSize: number;
  mode?: BattleMode;
  result?: BattleResult;
};

export type BattleHistoryListItemResponse = {
  battleId: string;
  mode: BattleMode;
  result: BattleResult;
  opponent: {
    userId: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  myScore: number;
  opponentScore: number;
  myCorrectCount: number;
  myWrongCount: number;
  myUnansweredCount: number;
  ratingBefore: number;
  ratingDelta: number;
  ratingAfter: number;
  endReason: BattleEndReason | null;
  completedAt: string;
};

export type BattleHistoryResponse = {
  items: BattleHistoryListItemResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  serverTime: string;
};

export type BattleCorrectAnswerResponse =
  | {
      type: 'SINGLE_CHOICE';
      optionId: string;
    }
  | {
      type: 'CODE_FILL';
    };

export type BattleHistoryMyAnswerResponse = {
  answer: BattleSubmittedAnswerResponse;
  submittedAt: string;
  timeSpentMs: number | null;
};

export type BattleHistoryQuestionResponse = {
  battleQuestionSnapshotId: string;
  questionId: string;
  sourceQuizQuestionId: string | null;
  source: 'BATTLE';
  questionType: BattleQuestionType;
  presentation: BattleQuestionPresentation;
  difficulty: BattleQuestionDifficulty | null;
  stem: BattleContentBlock[];
  options: BattleQuestionOptionSnapshotResponse[];
  myAnswer: BattleHistoryMyAnswerResponse | null;
  correctAnswer: BattleCorrectAnswerResponse;
  correctOptionId: string | null;
  isCorrect: boolean | null;
  scoreDelta: number;
  explanation: BattleContentBlock[] | null;
  courseId: string | null;
  courseTitle: string | null;
  chapterId: string | null;
  chapterTitle: string | null;
  orderIndex: number;
};

export type BattleHistorySummaryResponse = {
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  ratingBefore: number;
  ratingDelta: number;
  ratingAfter: number;
};

export type BattleHistoryDetailResponse = {
  battleId: string;
  mode: BattleMode;
  status: 'COMPLETED';
  result: BattleResult;
  startedAt: string | null;
  durationSeconds: number;
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
  mySummary: BattleHistorySummaryResponse;
  opponentSummary: BattleHistorySummaryResponse & {
    userId: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  endReason: BattleEndReason | null;
  completedAt: string;
  serverTime: string;
  questions: BattleHistoryQuestionResponse[];
};
