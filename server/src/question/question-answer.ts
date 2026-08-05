import { BadRequestException } from '@nestjs/common';
import { QuestionType } from '../../generated/prisma/enums';

export type TextAnswerNormalizationConfig = {
  trim: boolean;
  normalizeLineEndings: boolean;
  caseSensitive: boolean;
  collapseWhitespace: boolean;
};

export const FILL_BLANK_MAX_LENGTH = 500;
export const CODE_FILL_MAX_LENGTH = 4000;

export function isTextQuestionType(type: QuestionType) {
  return type === QuestionType.FILL_BLANK || type === QuestionType.CODE_FILL;
}

export function getTextAnswerMaxLength(type: QuestionType) {
  return type === QuestionType.CODE_FILL
    ? CODE_FILL_MAX_LENGTH
    : FILL_BLANK_MAX_LENGTH;
}

export function resolveTextAnswerNormalization(
  type: QuestionType,
  rawConfig: unknown,
): TextAnswerNormalizationConfig {
  const config = isRecord(rawConfig) ? rawConfig : {};
  const isCodeFill = type === QuestionType.CODE_FILL;

  return {
    trim: readBoolean(config.trim, true),
    normalizeLineEndings: readBoolean(config.normalizeLineEndings, true),
    caseSensitive: readBoolean(config.caseSensitive, isCodeFill),
    collapseWhitespace: readBoolean(config.collapseWhitespace, !isCodeFill),
  };
}

export function normalizeTextAnswer(
  value: string,
  config: TextAnswerNormalizationConfig,
  maxLength: number,
) {
  if (value.length > maxLength) {
    throw new BadRequestException('QUESTION_ANSWER_TOO_LONG');
  }

  let normalized = value;
  if (config.normalizeLineEndings) {
    normalized = normalized.replace(/\r\n?/g, '\n');
  }
  if (config.trim) {
    normalized = normalized.trim();
  }
  if (config.collapseWhitespace) {
    normalized = normalized.replace(/\s+/g, ' ');
  }
  if (!config.caseSensitive) {
    normalized = normalized.toLocaleLowerCase('en-US');
  }

  return normalized;
}

export function evaluateTextAnswer(input: {
  type: QuestionType;
  value: string;
  acceptedAnswers: unknown;
  answerNormalization: unknown;
}) {
  if (!isTextQuestionType(input.type)) {
    throw new BadRequestException('QUESTION_TYPE_INVALID');
  }

  const maxLength = getTextAnswerMaxLength(input.type);
  const config = resolveTextAnswerNormalization(
    input.type,
    input.answerNormalization,
  );
  const normalizedAnswer = normalizeTextAnswer(input.value, config, maxLength);

  if (!normalizedAnswer) {
    throw new BadRequestException('QUESTION_ANSWER_REQUIRED');
  }

  const acceptedAnswers = parseAcceptedAnswers(input.acceptedAnswers);
  const normalizedAcceptedAnswers = acceptedAnswers.map((answer) =>
    normalizeTextAnswer(answer, config, maxLength),
  );

  if (
    normalizedAcceptedAnswers.length === 0 ||
    normalizedAcceptedAnswers.some((answer) => !answer)
  ) {
    throw new BadRequestException('QUIZ_NOT_READY');
  }

  return {
    answerText: input.value,
    normalizedAnswer,
    acceptedAnswers,
    isCorrect: normalizedAcceptedAnswers.includes(normalizedAnswer),
  };
}

export function parseAcceptedAnswers(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (answer): answer is string => typeof answer === 'string' && answer.length > 0,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}
