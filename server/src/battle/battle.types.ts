import type { Prisma } from '../../generated/prisma/client';
import type { BattleResult } from '../../generated/prisma/enums';

export type TextContentBlock = {
  type: 'TEXT';
  text: string;
};

export type CodeContentBlock = {
  type: 'CODE';
  code: string;
  language?: string;
};

export type ImageContentBlock = {
  type: 'IMAGE';
  url: string;
  alt?: string;
};

export type ContentBlock =
  TextContentBlock | CodeContentBlock | ImageContentBlock;

export type BattleOptionSnapshot = {
  id: string;
  orderIndex: number;
  blocks: ContentBlock[];
};

export type SingleChoiceAnswerPayload = {
  type: 'SINGLE_CHOICE';
  optionId: string;
};

export type CodeFillAnswerPayload = {
  type: 'CODE_FILL';
  value: string;
};

export type BattleAnswerPayload =
  SingleChoiceAnswerPayload | CodeFillAnswerPayload;

export type CodeFillAnswerConfig = {
  acceptedAnswers: string[];
  trim: boolean;
  normalizeLineEndings: boolean;
  caseSensitive: boolean;
  collapseWhitespace?: boolean;
};

export type CalculateBattleScoreInput = {
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  questionCount?: number;
};

export type BattleScoreSummary = {
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
};

export type EloCalculationInput = {
  playerRating: number;
  opponentRating: number;
  result: Exclude<BattleResult, 'NONE'>;
  kFactor: number;
};

export type EloCalculationResult = {
  ratingBefore: number;
  ratingDelta: number;
  ratingAfter: number;
  expectedScore: number;
};

export type BattleActiveRoomSummary = {
  battleRoomId: string;
  participantStatus: string;
  roomStatus: string;
  mode: string;
  seat: number;
  startedAt: Date | null;
  expiresAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  endReason: string | null;
};

export type BattleTransactionClient = Prisma.TransactionClient;

export type BattleQuestionOptionSnapshot = {
  id: string;
  sourceOptionId: string;
  orderIndex: number;
  blocks: ContentBlock[];
};

export type BattleSingleChoiceCorrectAnswerSnapshot = {
  type: 'SINGLE_CHOICE';
  optionId: string;
};

export type BattleCodeFillCorrectAnswerSnapshot = {
  type: 'CODE_FILL';
};

export type BattleCorrectAnswerSnapshot =
  BattleSingleChoiceCorrectAnswerSnapshot | BattleCodeFillCorrectAnswerSnapshot;

export type MatchmakingViewStatus =
  'IDLE' | 'SEARCHING' | 'MATCHED' | 'CANCELLED' | 'EXPIRED';

export type MatchmakingStatusPayload = {
  status: MatchmakingViewStatus;
  battleId: string | null;
  searchStartedAt: Date | null;
  expiresAt: Date | null;
  serverTime: Date;
};

export type BattleParticipantSummary = {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  seat: number;
  status: string;
};

export type BattleRoomSummaryPayload = {
  battleId: string;
  mode: string;
  status: string;
  questionCount: number;
  durationSeconds: number;
  createdAt: Date;
  startedAt: Date | null;
  expiresAt: Date | null;
  serverTime: Date;
  participants: BattleParticipantSummary[];
};

export type BattleRoomDetailPayload = BattleRoomSummaryPayload & {
  currentParticipantStatus: string | null;
  answeredCount: number;
  totalQuestionCount: number;
};

export type BattleQuestionView = {
  battleQuestionId: string;
  orderIndex: number;
  questionType: string;
  presentation: string;
  difficulty: string | null;
  stem: ContentBlock[];
  options: BattleQuestionOptionSnapshot[];
  programmingLanguage: string | null;
  answered: boolean;
  submittedAt: Date | null;
  submittedAnswer: BattleAnswerPayload | null;
};

export type BattleQuestionsPayload = {
  battleId: string;
  status: string;
  startedAt: Date | null;
  expiresAt: Date | null;
  serverTime: Date;
  questions?: BattleQuestionView[];
};

export type BattleAnswerSubmissionPayload = {
  accepted: true;
  battleQuestionId: string;
  submittedAt: Date;
  mySubmittedCount: number;
  totalQuestions: number;
  serverTime: Date;
};

export type FriendRoomPreviewPayload = {
  battleId: string;
  roomStatus: string;
  invitationStatus: string;
  inviter: {
    userId: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  participantCount: number;
  expiresAt: Date;
  canJoin: boolean;
  cannotJoinReason: string | null;
  serverTime: Date;
};
