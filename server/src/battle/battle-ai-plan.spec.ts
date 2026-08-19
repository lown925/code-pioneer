import { BattleQuestionDifficulty } from '../../generated/prisma/enums';
import {
  AI_HARD_ANSWER_TIME_MS,
  AI_HARD_CORRECT_PROBABILITY,
  AI_MEDIUM_ANSWER_TIME_MS,
  AI_MEDIUM_CORRECT_PROBABILITY,
  AI_STRATEGY_VERSION,
} from './battle.constants';
import {
  generateBattleAiPlan,
  isBattleAiPlanValid,
  projectBattleAiProgress,
} from './battle-ai-plan';

const SNAPSHOTS = Array.from({ length: 20 }, (_, index) => ({
  id: `snapshot-${index + 1}`,
  orderIndex: index,
  difficulty:
    index < 14
      ? BattleQuestionDifficulty.MEDIUM
      : BattleQuestionDifficulty.HARD,
}));

describe('battle AI deterministic plan', () => {
  it('generates the same immutable behavior plan for the same inputs', () => {
    const input = {
      seed: 'fixed-seed',
      strategyVersion: AI_STRATEGY_VERSION,
      durationSeconds: 180,
      snapshots: SNAPSHOTS,
    };

    expect(generateBattleAiPlan(input)).toEqual(generateBattleAiPlan(input));
  });

  it('changes the plan when the persisted seed changes', () => {
    const first = generateBattleAiPlan({
      seed: 'seed-a',
      durationSeconds: 180,
      snapshots: SNAPSHOTS,
    });
    const second = generateBattleAiPlan({
      seed: 'seed-b',
      durationSeconds: 180,
      snapshots: SNAPSHOTS,
    });

    expect(second).not.toEqual(first);
  });

  it('does not depend on Math.random for AI behavior', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random must not be used');
    });

    expect(() =>
      generateBattleAiPlan({
        seed: 'seed-without-math-random',
        durationSeconds: 180,
        snapshots: SNAPSHOTS,
      }),
    ).not.toThrow();

    randomSpy.mockRestore();
  });

  it('keeps completion offsets positive, ordered, and inside the deadline', () => {
    const result = generateBattleAiPlan({
      seed: 'timing-seed',
      durationSeconds: 180,
      snapshots: SNAPSHOTS,
    });
    const offsets = result.answerPlan.questions.map(
      (question) => question.plannedCompletedOffsetMs,
    );

    expect(offsets.every((offset) => offset > 0)).toBe(true);
    expect(
      offsets.every(
        (offset, index) => index === 0 || offset > offsets[index - 1]!,
      ),
    ).toBe(true);
    expect(offsets.at(-1)).toBeLessThanOrEqual(180_000);
    expect(result.plannedSubmittedOffsetMs).toBeGreaterThanOrEqual(
      offsets.at(-1)!,
    );
    expect(result.plannedSubmittedOffsetMs).toBeLessThanOrEqual(180_000);
  });

  it('uses a lower correctness probability for HARD than MEDIUM', () => {
    expect(AI_MEDIUM_CORRECT_PROBABILITY).toBeGreaterThan(
      AI_HARD_CORRECT_PROBABILITY,
    );
    expect(AI_HARD_ANSWER_TIME_MS.min).toBeGreaterThan(
      AI_MEDIUM_ANSWER_TIME_MS.min,
    );
    expect(AI_HARD_ANSWER_TIME_MS.max).toBeGreaterThan(
      AI_MEDIUM_ANSWER_TIME_MS.max,
    );
  });

  it('never plans a perfect normal-AI result', () => {
    const result = generateBattleAiPlan({
      seed: 'normal-ai-not-perfect',
      durationSeconds: 180,
      snapshots: SNAPSHOTS,
    });

    expect(
      result.answerPlan.questions.some((question) => !question.plannedCorrect),
    ).toBe(true);
  });

  it('projects progress only from server time and the persisted plan', () => {
    const result = generateBattleAiPlan({
      seed: 'progress-seed',
      durationSeconds: 180,
      snapshots: SNAPSHOTS,
    });
    const startedAt = new Date('2026-08-19T10:00:00.000Z');
    const firstOffset =
      result.answerPlan.questions[0]!.plannedCompletedOffsetMs;
    const beforeStart = projectBattleAiProgress({
      startedAt: null,
      serverTime: startedAt,
      answerPlan: result.answerPlan,
      plannedSubmittedOffsetMs: result.plannedSubmittedOffsetMs,
    });
    const afterFirstAnswer = projectBattleAiProgress({
      startedAt,
      serverTime: new Date(startedAt.getTime() + firstOffset),
      answerPlan: result.answerPlan,
      plannedSubmittedOffsetMs: result.plannedSubmittedOffsetMs,
    });
    const afterSubmission = projectBattleAiProgress({
      startedAt,
      serverTime: new Date(
        startedAt.getTime() + result.plannedSubmittedOffsetMs,
      ),
      answerPlan: result.answerPlan,
      plannedSubmittedOffsetMs: result.plannedSubmittedOffsetMs,
    });

    expect(beforeStart).toEqual({
      answeredCount: 0,
      submitted: false,
      elapsedMs: 0,
    });
    expect(afterFirstAnswer.answeredCount).toBeGreaterThanOrEqual(1);
    expect(afterSubmission).toMatchObject({
      answeredCount: SNAPSHOTS.length,
      submitted: true,
    });
    expect(Object.keys(afterFirstAnswer).sort()).toEqual([
      'answeredCount',
      'elapsedMs',
      'submitted',
    ]);
  });

  it('validates snapshot identity, strategy, ordering, and deadline before ready', () => {
    const result = generateBattleAiPlan({
      seed: 'ready-validation-seed',
      durationSeconds: 180,
      snapshots: SNAPSHOTS,
    });
    const input = {
      value: result.answerPlan,
      strategyVersion: AI_STRATEGY_VERSION,
      plannedSubmittedOffsetMs: result.plannedSubmittedOffsetMs,
      durationSeconds: 180,
      snapshots: SNAPSHOTS,
    };

    expect(isBattleAiPlanValid(input)).toBe(true);
    expect(
      isBattleAiPlanValid({
        ...input,
        strategyVersion: 'different-version',
      }),
    ).toBe(false);
    expect(
      isBattleAiPlanValid({
        ...input,
        snapshots: [
          { ...SNAPSHOTS[0]!, id: 'wrong-snapshot' },
          ...SNAPSHOTS.slice(1),
        ],
      }),
    ).toBe(false);
    expect(
      isBattleAiPlanValid({
        ...input,
        plannedSubmittedOffsetMs: 180_001,
      }),
    ).toBe(false);
  });
});
