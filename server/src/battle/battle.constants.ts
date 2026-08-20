import {
  BattleMatchQueueStatus,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import type { BattleResult as BattleResultType } from '../../generated/prisma/enums';

export const DEFAULT_BATTLE_QUESTION_COUNT = 20;
export const MIN_BATTLE_QUESTION_COUNT = 15;
export const MAX_BATTLE_QUESTION_COUNT = 20;
export const BATTLE_DURATION_SECONDS = 180;
export const BATTLE_CORRECT_SCORE = 2;
export const BATTLE_WRONG_SCORE = -1;
export const BATTLE_UNANSWERED_SCORE = 0;
export const BATTLE_COUNTDOWN_SECONDS = 3;
export const MAX_CODE_FILL_ANSWER_LENGTH = 2000;

export const INITIAL_BATTLE_RATING = 1000;
export const MIN_BATTLE_RATING = 0;
export const BATTLE_ELO_K_FACTOR = 32;

export const INITIAL_MATCH_RATING_RANGE = 100;
export const MATCH_RANGE_EXPANSION = 50;
export const MATCH_RANGE_EXPANSION_INTERVAL_SECONDS = 10;
export const MATCHMAKING_TTL_SECONDS = 30 * 60;
export const MATCHMAKING_HEARTBEAT_TTL_SECONDS = 15;
export const AI_UNLOCK_SECONDS = 2 * 60;
export const RANKED_MATCH_READY_TTL_SECONDS = 45;
export const COMPLETED_BATTLE_RECOVERY_TTL_SECONDS = 5 * 60;
export const TRAINING_UNLOCK_SECONDS = 60;
export const TRAINING_SKILL_CODE = 'PYTHON';

export const AI_DISPLAY_NAME = '电脑对手';
export const AI_STRATEGY_VERSION = 'normal-v1';
export const AI_MEDIUM_CORRECT_PROBABILITY = 0.72;
export const AI_HARD_CORRECT_PROBABILITY = 0.55;
export const AI_MEDIUM_ANSWER_TIME_MS = {
  min: 5_000,
  max: 7_500,
} as const;
export const AI_HARD_ANSWER_TIME_MS = {
  min: 7_000,
  max: 10_000,
} as const;
export const AI_SUBMISSION_DELAY_MS = {
  min: 2_000,
  max: 5_000,
} as const;

export const FRIEND_INVITATION_TTL_MINUTES = 10;
export const INVITATION_TOKEN_BYTES = 18;
export const INVITE_CODE_LENGTH = 6;
export const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const BATTLE_SETTLEMENT_STALE_SECONDS = 30;

export const ACTIVE_BATTLE_ROOM_STATUSES: readonly BattleRoomStatus[] = [
  BattleRoomStatus.WAITING,
  BattleRoomStatus.READY,
  BattleRoomStatus.COUNTDOWN,
  BattleRoomStatus.IN_PROGRESS,
  BattleRoomStatus.SETTLING,
];

export const CANCELLABLE_BATTLE_ROOM_STATUSES: readonly BattleRoomStatus[] = [
  BattleRoomStatus.WAITING,
  BattleRoomStatus.READY,
];

export const MATCH_SEARCHING_STATUS = BattleMatchQueueStatus.SEARCHING;

export const BATTLE_RESULT_TO_ACTUAL_SCORE: Record<
  Exclude<BattleResultType, 'NONE'>,
  number
> = {
  [BattleResult.WIN]: 1,
  [BattleResult.LOSS]: 0,
  [BattleResult.DRAW]: 0.5,
};
