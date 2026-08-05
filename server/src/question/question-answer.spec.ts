import { BadRequestException } from '@nestjs/common';
import { QuestionType } from '../../generated/prisma/enums';
import {
  evaluateTextAnswer,
  normalizeTextAnswer,
  resolveTextAnswerNormalization,
} from './question-answer';

describe('question answer normalization', () => {
  it('ignores case and repeated whitespace for a normal fill answer', () => {
    const result = evaluateTextAnswer({
      type: QuestionType.FILL_BLANK,
      value: '  JavaScript   Runtime  ',
      acceptedAnswers: ['javascript runtime'],
      answerNormalization: null,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.normalizedAnswer).toBe('javascript runtime');
  });

  it('accepts any configured standard answer', () => {
    const result = evaluateTextAnswer({
      type: QuestionType.FILL_BLANK,
      value: 'JS',
      acceptedAnswers: ['JavaScript', 'JS'],
      answerNormalization: null,
    });

    expect(result.isCorrect).toBe(true);
  });

  it('keeps code answers case-sensitive by default', () => {
    const result = evaluateTextAnswer({
      type: QuestionType.CODE_FILL,
      value: 'Console.log(value)',
      acceptedAnswers: ['console.log(value)'],
      answerNormalization: null,
    });

    expect(result.isCorrect).toBe(false);
  });

  it('normalizes CRLF line endings for code answers', () => {
    const config = resolveTextAnswerNormalization(QuestionType.CODE_FILL, null);

    expect(normalizeTextAnswer('const a = 1;\r\nreturn a;', config, 4000)).toBe(
      'const a = 1;\nreturn a;',
    );
  });

  it('rejects a blank answer after normalization', () => {
    expect(() =>
      evaluateTextAnswer({
        type: QuestionType.FILL_BLANK,
        value: '   ',
        acceptedAnswers: ['value'],
        answerNormalization: null,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects an answer over the type limit', () => {
    expect(() =>
      evaluateTextAnswer({
        type: QuestionType.FILL_BLANK,
        value: 'a'.repeat(501),
        acceptedAnswers: ['a'],
        answerNormalization: null,
      }),
    ).toThrow('QUESTION_ANSWER_TOO_LONG');
  });
});
