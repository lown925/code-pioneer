import { BadRequestException, Injectable } from '@nestjs/common';
import { BattleResult } from '../../generated/prisma/enums';
import {
  BATTLE_ELO_K_FACTOR,
  BATTLE_RESULT_TO_ACTUAL_SCORE,
  MIN_BATTLE_RATING,
} from './battle.constants';
import { BATTLE_ERROR_CODES } from './battle.errors';
import type { EloCalculationInput, EloCalculationResult } from './battle.types';

function assertNonNegativeInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new BadRequestException(
      `${BATTLE_ERROR_CODES.BATTLE_INVALID_RATING_INPUT}:${field}`,
    );
  }
}

function assertPositiveInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new BadRequestException(
      `${BATTLE_ERROR_CODES.BATTLE_INVALID_RATING_INPUT}:${field}`,
    );
  }
}

export function calculateEloChange(
  input: EloCalculationInput,
): EloCalculationResult {
  const { playerRating, opponentRating, result, kFactor } = input;

  assertNonNegativeInteger(playerRating, 'playerRating');
  assertNonNegativeInteger(opponentRating, 'opponentRating');
  assertPositiveInteger(kFactor, 'kFactor');

  if (
    result !== BattleResult.WIN &&
    result !== BattleResult.LOSS &&
    result !== BattleResult.DRAW
  ) {
    throw new BadRequestException(
      `${BATTLE_ERROR_CODES.BATTLE_INVALID_RATING_INPUT}:result`,
    );
  }

  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const actualScore = BATTLE_RESULT_TO_ACTUAL_SCORE[result];
  const rawDelta = Math.round(kFactor * (actualScore - expectedScore));
  const ratingAfter = Math.max(MIN_BATTLE_RATING, playerRating + rawDelta);
  const ratingDelta = ratingAfter - playerRating;

  return {
    ratingBefore: playerRating,
    ratingDelta,
    ratingAfter,
    expectedScore,
  };
}

export function createNoRatingChange(rating: number): EloCalculationResult {
  assertNonNegativeInteger(rating, 'rating');

  return {
    ratingBefore: rating,
    ratingDelta: 0,
    ratingAfter: rating,
    expectedScore: 0,
  };
}

@Injectable()
export class BattleRatingService {
  private readonly defaultKFactor = BATTLE_ELO_K_FACTOR;

  calculateEloChange(input: EloCalculationInput) {
    return calculateEloChange(input);
  }

  calculateWithDefaultKFactor(input: Omit<EloCalculationInput, 'kFactor'>) {
    return calculateEloChange({
      ...input,
      kFactor: this.defaultKFactor,
    });
  }

  createNoRatingChange(rating: number) {
    return createNoRatingChange(rating);
  }
}
