import { BadRequestException, Injectable } from '@nestjs/common';
import { BATTLE_CORRECT_SCORE, BATTLE_WRONG_SCORE } from './battle.constants';
import { BATTLE_ERROR_CODES } from './battle.errors';
import type {
  BattleScoreSummary,
  CalculateBattleScoreInput,
} from './battle.types';

function assertNonNegativeInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new BadRequestException(
      `${BATTLE_ERROR_CODES.BATTLE_INVALID_SCORE_INPUT}:${field}`,
    );
  }
}

export function calculateBattleScore(
  input: CalculateBattleScoreInput,
): BattleScoreSummary {
  const { correctCount, wrongCount, unansweredCount, questionCount } = input;

  assertNonNegativeInteger(correctCount, 'correctCount');
  assertNonNegativeInteger(wrongCount, 'wrongCount');
  assertNonNegativeInteger(unansweredCount, 'unansweredCount');

  const answeredCount = correctCount + wrongCount + unansweredCount;

  if (questionCount !== undefined) {
    assertNonNegativeInteger(questionCount, 'questionCount');

    if (answeredCount > questionCount) {
      throw new BadRequestException(
        `${BATTLE_ERROR_CODES.BATTLE_INVALID_SCORE_INPUT}:questionCount`,
      );
    }
  }

  return {
    score:
      correctCount * BATTLE_CORRECT_SCORE + wrongCount * BATTLE_WRONG_SCORE,
    correctCount,
    wrongCount,
    unansweredCount,
  };
}

@Injectable()
export class BattleScoreService {
  calculateBattleScore(input: CalculateBattleScoreInput) {
    return calculateBattleScore(input);
  }
}
