export type BattleMode = 'RANKED' | 'FRIEND' | 'TRAINING' | 'AI';

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

export type ActiveBattleRecoveryTarget = 'ROOM' | 'PLAY' | 'RESULT';

export type ProfessionalTrackIdentity = {
  trackKey: string;
  formalName: string;
  shortName: string;
};

export type ActiveBattleResponse = {
  battleId: string;
  mode: BattleMode;
  roomStatus: BattleRoomStatus;
  participantStatus: BattleParticipantStatus;
  skillCode: string | null;
  skillName: string | null;
  professionalTrackKey?: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  myProfessionalTrackKey?: string | null;
  opponentProfessionalTrackKey?: string | null;
  invitationToken: string | null;
  inviteCode: string | null;
  recoveryTarget: ActiveBattleRecoveryTarget;
  readOnly: boolean;
  serverTime: string;
};

export type BattleResult = 'WIN' | 'LOSS' | 'DRAW' | 'NONE';

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
  trainingBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentWinStreak: number;
  bestWinStreak: number;
  rank: number;
  currentRank: number;
  availableSkills: BattleSkillProfile[];
  availableTracks?: BattleTrackProfile[];
  defaultTrackKey?: string | null;
};

export type BattleSkillProfile = {
  code: string;
  name: string;
  rating: number | null;
  highestRating: number | null;
  rankedBattles: number;
  rank: number | null;
  status: 'RANKED' | 'UNRANKED';
  star: number | null;
  title: string;
};

export type BattleTrackProfile = {
  trackKey: string;
  formalName: string;
  shortName: string;
  rating: number | null;
  rankedBattles: number;
  rank: number | null;
  status: 'RANKED' | 'UNRANKED';
};

export type BattleLeaderboardItem = {
  rank: number;
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  rating: number;
  highestRating: number;
  rankedBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  star?: number;
  title?: string;
  professionalTrack: ProfessionalTrackIdentity | null;
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
  skill: string | null;
  professionalTrackKey?: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  myProfessionalTrack?: ProfessionalTrackIdentity | null;
};

export type BattleLeaderboardQuery = {
  page: number;
  pageSize: number;
  skill?: string;
  professionalTrackKey?: string;
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
  skill: string | null;
  professionalTrackKey?: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  waitingCount: number;
  elapsedMs: number;
  remainingSearchMs: number;
  aiAvailable: boolean;
};

export type BattleAiMatchmakingResolutionResponse = {
  resolvedTo: 'AI' | 'HUMAN';
  battleId: string;
  serverTime: string;
};

export type BattleAiLiveOpponentResponse = {
  type: 'AI';
  displayName: string;
  answeredCount: number;
  submitted: boolean;
};

export type BattleHumanOpponentResponse = {
  type: 'HUMAN';
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
};

export type BattleAiCompletedOpponentResponse = {
  type: 'AI';
  displayName: string;
};

export type BattleCompletedOpponentResponse =
  | BattleHumanOpponentResponse
  | BattleAiCompletedOpponentResponse;

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
  skill: string | null;
  professionalTrackKey?: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  myProfessionalTrackKey?: string | null;
  opponentProfessionalTrackKey?: string | null;
  status: BattleRoomStatus;
  questionCount: number;
  durationSeconds: number;
  createdAt: string;
  startedAt: string | null;
  expiresAt: string | null;
  serverTime: string;
  participants: BattleParticipantSummary[];
  opponent: BattleAiLiveOpponentResponse | null;
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
  skill: string | null;
  professionalTrackKey?: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  status: BattleRoomStatus;
  invitationToken: string;
  inviteCode: string | null;
  sharePath: string;
  expiresAt: string;
  serverTime: string;
};

export type FriendRoomPreviewResponse = {
  battleId: string;
  skill: string | null;
  professionalTrackKey: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
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
  mode: BattleMode;
  skill: string | null;
  professionalTrackKey?: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
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

export type BattleTrainingStartResponse = {
  battleId: string;
  mode: 'TRAINING';
  skill: string;
  professionalTrackKey: string;
  status: 'COUNTDOWN';
  startedAt: string;
  expiresAt: string;
  serverTime: string;
};

export type PendingBattleResultResponse = {
  battleId: string;
  mode: BattleMode;
  skill: string | null;
  professionalTrackKey?: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  myProfessionalTrackKey?: string | null;
  opponentProfessionalTrackKey?: string | null;
  status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING';
  completed: false;
  totalQuestions: number;
  myAnsweredCount: number;
  opponentAnsweredCount: number | null;
  mySubmitted: boolean;
  opponentSubmitted: boolean | null;
  opponent: BattleHumanOpponentResponse | BattleAiLiveOpponentResponse | null;
  serverTime: string;
};

export type CompletedBattleResultResponse = {
  battleId: string;
  mode: BattleMode;
  skill: string | null;
  professionalTrackKey?: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  myProfessionalTrackKey?: string | null;
  opponentProfessionalTrackKey?: string | null;
  status: 'COMPLETED';
  completed: true;
  result: BattleResult;
  myScore: number;
  opponentScore: number | null;
  myCorrectCount: number;
  myWrongCount: number;
  myUnansweredCount: number;
  answeredCount: number;
  accuracy: number;
  completionRate: number;
  bestCombo: number;
  opponentCorrectCount: number | null;
  opponentWrongCount: number | null;
  opponentUnansweredCount: number | null;
  opponentAnsweredCount: number | null;
  opponentAccuracy: number | null;
  opponentCompletionRate: number | null;
  scoreDifference: number | null;
  ratingBefore: number;
  ratingDelta: number;
  ratingAfter: number;
  star: number | null;
  title: string | null;
  beforeStar: number | null;
  afterStar: number | null;
  tierChange: 'PLACED' | 'PROMOTED' | 'DEMOTED' | 'UNCHANGED' | null;
  opponent: BattleCompletedOpponentResponse | null;
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
  skill: string | null;
  professionalTrackKey: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  myProfessionalTrackKey?: string | null;
  opponentProfessionalTrackKey?: string | null;
  result: BattleResult;
  opponent: BattleCompletedOpponentResponse | null;
  myScore: number;
  opponentScore: number | null;
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
      acceptedAnswers?: string[];
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
  knowledgeTags: string[];
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
  skill: string | null;
  professionalTrackKey: string | null;
  professionalTrack?: ProfessionalTrackIdentity | null;
  myProfessionalTrackKey?: string | null;
  opponentProfessionalTrackKey?: string | null;
  status: 'COMPLETED';
  result: BattleResult;
  startedAt: string | null;
  durationSeconds: number;
  myScore: number;
  opponentScore: number | null;
  myCorrectCount: number;
  myWrongCount: number;
  myUnansweredCount: number;
  opponentCorrectCount: number | null;
  opponentWrongCount: number | null;
  opponentUnansweredCount: number | null;
  ratingBefore: number;
  ratingDelta: number;
  ratingAfter: number;
  opponent: BattleCompletedOpponentResponse | null;
  mySummary: BattleHistorySummaryResponse;
  opponentSummary:
    | (BattleHistorySummaryResponse & BattleHumanOpponentResponse)
    | (BattleHistorySummaryResponse & BattleAiCompletedOpponentResponse)
    | null;
  endReason: BattleEndReason | null;
  completedAt: string;
  serverTime: string;
  questions: BattleHistoryQuestionResponse[];
};
