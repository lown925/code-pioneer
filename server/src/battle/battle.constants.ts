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
export const MATCHMAKING_TTL_SECONDS = 120;

export const FRIEND_INVITATION_TTL_MINUTES = 10;
export const INVITATION_TOKEN_BYTES = 18;

export const ACTIVE_BATTLE_ROOM_STATUSES: readonly BattleRoomStatus[] = [
  BattleRoomStatus.WAITING,
  BattleRoomStatus.READY,
  BattleRoomStatus.COUNTDOWN,
  BattleRoomStatus.IN_PROGRESS,
  BattleRoomStatus.SETTLING,
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
