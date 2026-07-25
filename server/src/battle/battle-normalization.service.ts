import { BadRequestException, Injectable } from '@nestjs/common';
import { MAX_CODE_FILL_ANSWER_LENGTH } from './battle.constants';
import { BATTLE_ERROR_CODES } from './battle.errors';
import type { CodeFillAnswerConfig } from './battle.types';

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ');
}

@Injectable()
export class BattleNormalizationService {
  normalizeCodeFillAnswer(rawValue: string, config: CodeFillAnswerConfig) {
    if (rawValue.length > MAX_CODE_FILL_ANSWER_LENGTH) {
      throw new BadRequestException(BATTLE_ERROR_CODES.BATTLE_INVALID_ANSWER);
    }

    let value = rawValue;

    if (config.normalizeLineEndings) {
      value = normalizeLineEndings(value);
    }

    if (config.trim) {
      value = value.trim();
    }

    if (config.collapseWhitespace) {
      value = collapseWhitespace(value);
    }

    if (!config.caseSensitive) {
      value = value.toLowerCase();
    }

    return value;
  }

  evaluateCodeFillAnswer(input: {
    rawValue: string;
    acceptedAnswers: string[];
    config: CodeFillAnswerConfig;
  }) {
    const normalizedAnswer = this.normalizeCodeFillAnswer(
      input.rawValue,
      input.config,
    );
    const acceptedAnswers = input.acceptedAnswers.map((answer) =>
      this.normalizeCodeFillAnswer(answer, input.config),
    );

    return {
      normalizedAnswer,
      isCorrect: acceptedAnswers.includes(normalizedAnswer),
    };
  }
}
