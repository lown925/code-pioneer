import { BadRequestException } from '@nestjs/common';
import { BattleScoreService } from './battle-score.service';

describe('BattleScoreService', () => {
  const service = new BattleScoreService();

  it('returns 17 for 10 correct, 3 wrong, 7 unanswered', () => {
    expect(
      service.calculateBattleScore({
        correctCount: 10,
        wrongCount: 3,
        unansweredCount: 7,
        questionCount: 20,
      }),
    ).toEqual({
      score: 17,
      correctCount: 10,
      wrongCount: 3,
      unansweredCount: 7,
    });
  });

  it('allows negative total score', () => {
    expect(
      service.calculateBattleScore({
        correctCount: 0,
        wrongCount: 5,
        unansweredCount: 0,
        questionCount: 5,
      }),
    ).toEqual({
      score: -5,
      correctCount: 0,
      wrongCount: 5,
      unansweredCount: 0,
    });
  });

  it('returns 0 when all questions are unanswered', () => {
    expect(
      service.calculateBattleScore({
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 20,
        questionCount: 20,
      }),
    ).toEqual({
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 20,
    });
  });

  it('does not deduct score for unanswered questions', () => {
    expect(
      service.calculateBattleScore({
        correctCount: 2,
        wrongCount: 1,
        unansweredCount: 17,
        questionCount: 20,
      }).score,
    ).toBe(3);
  });

  it('rejects negative counters', () => {
    expect(() =>
      service.calculateBattleScore({
        correctCount: -1,
        wrongCount: 0,
        unansweredCount: 0,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects non-integer counters', () => {
    expect(() =>
      service.calculateBattleScore({
        correctCount: 1.5,
        wrongCount: 0,
        unansweredCount: 0,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects totals larger than questionCount', () => {
    expect(() =>
      service.calculateBattleScore({
        correctCount: 10,
        wrongCount: 3,
        unansweredCount: 8,
        questionCount: 20,
      }),
    ).toThrow(BadRequestException);
  });
});
