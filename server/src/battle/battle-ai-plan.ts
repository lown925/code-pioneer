import { createHash } from 'crypto';
import { BattleQuestionDifficulty } from '../../generated/prisma/enums';
import {
  AI_HARD_ANSWER_TIME_MS,
  AI_HARD_CORRECT_PROBABILITY,
  AI_MEDIUM_ANSWER_TIME_MS,
  AI_MEDIUM_CORRECT_PROBABILITY,
  AI_STRATEGY_VERSION,
  AI_SUBMISSION_DELAY_MS,
} from './battle.constants';
import { BattleResult } from '../../generated/prisma/enums';
import type {
  BattleAiAnswerPlan,
  BattleAiFinalStats,
  BattleAiProgress,
  BattleAiResultReason,
} from './battle.types';

type AiPlanSnapshot = {
  id: string;
  orderIndex: number;
  difficulty: BattleQuestionDifficulty | null;
};

type GenerateBattleAiPlanInput = {
  seed: string;
  strategyVersion?: string;
  durationSeconds: number;
  snapshots: AiPlanSnapshot[];
};

export function generateBattleAiPlan(input: GenerateBattleAiPlanInput) {
  const strategyVersion = input.strategyVersion ?? AI_STRATEGY_VERSION;
  const snapshots = [...input.snapshots].sort(
    (left, right) => left.orderIndex - right.orderIndex,
  );
  const random = createDeterministicRandom(
    JSON.stringify({
      seed: input.seed,
      strategyVersion,
      snapshots: snapshots.map((snapshot) => [
        snapshot.id,
        snapshot.orderIndex,
        snapshot.difficulty,
      ]),
    }),
  );
  const durationMs = input.durationSeconds * 1000;
  const submissionDelayMs = randomInteger(
    random,
    AI_SUBMISSION_DELAY_MS.min,
    AI_SUBMISSION_DELAY_MS.max,
  );
  const completionBudgetMs = Math.max(
    snapshots.length,
    durationMs - submissionDelayMs,
  );
  const desiredDurations = snapshots.map((snapshot) => {
    const range =
      snapshot.difficulty === BattleQuestionDifficulty.HARD
        ? AI_HARD_ANSWER_TIME_MS
        : AI_MEDIUM_ANSWER_TIME_MS;

    return randomInteger(random, range.min, range.max);
  });
  const desiredTotalMs = desiredDurations.reduce(
    (total, duration) => total + duration,
    0,
  );
  const scale =
    desiredTotalMs > completionBudgetMs
      ? completionBudgetMs / desiredTotalMs
      : 1;
  let completedOffsetMs = 0;

  const questions = snapshots.map((snapshot, index) => {
    const remainingQuestions = snapshots.length - index - 1;
    const latestOffsetMs = completionBudgetMs - remainingQuestions;
    const scaledDurationMs = Math.max(
      1,
      Math.round(desiredDurations[index]! * scale),
    );
    completedOffsetMs = Math.min(
      latestOffsetMs,
      completedOffsetMs + scaledDurationMs,
    );
    const correctProbability =
      snapshot.difficulty === BattleQuestionDifficulty.HARD
        ? AI_HARD_CORRECT_PROBABILITY
        : AI_MEDIUM_CORRECT_PROBABILITY;

    return {
      battleQuestionSnapshotId: snapshot.id,
      orderIndex: snapshot.orderIndex,
      plannedCompletedOffsetMs: completedOffsetMs,
      plannedCorrect: random() < correctProbability,
    };
  });

  if (
    questions.length > 0 &&
    questions.every((question) => question.plannedCorrect)
  ) {
    questions[questions.length - 1]!.plannedCorrect = false;
  }
  const plannedSubmittedOffsetMs = Math.min(
    durationMs,
    completedOffsetMs + submissionDelayMs,
  );

  return {
    answerPlan: {
      strategyVersion,
      questions,
    } satisfies BattleAiAnswerPlan,
    plannedSubmittedOffsetMs,
  };
}

export function projectBattleAiProgress(input: {
  startedAt: Date | null;
  serverTime: Date;
  answerPlan: BattleAiAnswerPlan;
  plannedSubmittedOffsetMs: number;
}): BattleAiProgress {
  const elapsedMs = input.startedAt
    ? Math.max(0, input.serverTime.getTime() - input.startedAt.getTime())
    : 0;

  return {
    answeredCount: input.answerPlan.questions.filter(
      (question) => question.plannedCompletedOffsetMs <= elapsedMs,
    ).length,
    submitted:
      Boolean(input.startedAt) && elapsedMs >= input.plannedSubmittedOffsetMs,
    elapsedMs,
  };
}

export function calculateBattleAiFinalStats(input: {
  answerPlan: BattleAiAnswerPlan;
  plannedSubmittedOffsetMs: number;
  durationSeconds: number;
}): BattleAiFinalStats {
  const deadlineMs = input.durationSeconds * 1000;
  const completionTimeMs = Math.min(
    Math.max(0, input.plannedSubmittedOffsetMs),
    deadlineMs,
  );
  const completedQuestions = input.answerPlan.questions.filter(
    (question) => question.plannedCompletedOffsetMs <= completionTimeMs,
  );
  const correctCount = completedQuestions.filter(
    (question) => question.plannedCorrect,
  ).length;
  const wrongCount = completedQuestions.length - correctCount;

  return {
    answeredCount: completedQuestions.length,
    correctCount,
    wrongCount,
    unansweredCount:
      input.answerPlan.questions.length - completedQuestions.length,
    completionTimeMs,
  };
}

export function resolveBattleAiOutcome(input: {
  userCorrectCount: number;
  userCompletionTimeMs: number;
  aiCorrectCount: number;
  aiCompletionTimeMs: number;
  userForfeited?: boolean;
}): {
  userResult: Exclude<BattleResult, 'NONE'>;
  reason: BattleAiResultReason;
} {
  if (input.userForfeited) {
    return {
      userResult: BattleResult.LOSS,
      reason: 'FORFEIT',
    };
  }

  if (input.userCorrectCount !== input.aiCorrectCount) {
    return {
      userResult:
        input.userCorrectCount > input.aiCorrectCount
          ? BattleResult.WIN
          : BattleResult.LOSS,
      reason: 'MORE_CORRECT',
    };
  }

  if (input.userCompletionTimeMs !== input.aiCompletionTimeMs) {
    return {
      userResult:
        input.userCompletionTimeMs < input.aiCompletionTimeMs
          ? BattleResult.WIN
          : BattleResult.LOSS,
      reason: 'FASTER',
    };
  }

  return {
    userResult: BattleResult.DRAW,
    reason: 'DRAW',
  };
}

export function parseBattleAiAnswerPlan(
  value: unknown,
): BattleAiAnswerPlan | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as {
    strategyVersion?: unknown;
    questions?: unknown;
  };

  if (
    typeof candidate.strategyVersion !== 'string' ||
    !Array.isArray(candidate.questions) ||
    !candidate.questions.every(isBattleAiPlanQuestion)
  ) {
    return null;
  }

  return candidate as BattleAiAnswerPlan;
}

export function isBattleAiPlanValid(input: {
  value: unknown;
  strategyVersion: string;
  plannedSubmittedOffsetMs: number;
  durationSeconds: number;
  snapshots: Array<{ id: string; orderIndex: number }>;
}) {
  const answerPlan = parseBattleAiAnswerPlan(input.value);

  if (
    !answerPlan ||
    answerPlan.strategyVersion !== input.strategyVersion ||
    answerPlan.questions.length !== input.snapshots.length ||
    !Number.isInteger(input.plannedSubmittedOffsetMs) ||
    input.plannedSubmittedOffsetMs < 0 ||
    input.plannedSubmittedOffsetMs > input.durationSeconds * 1000
  ) {
    return false;
  }

  const expectedSnapshots = [...input.snapshots].sort(
    (left, right) => left.orderIndex - right.orderIndex,
  );
  let previousOffsetMs = 0;

  for (let index = 0; index < answerPlan.questions.length; index += 1) {
    const question = answerPlan.questions[index]!;
    const snapshot = expectedSnapshots[index]!;

    if (
      question.battleQuestionSnapshotId !== snapshot.id ||
      question.orderIndex !== snapshot.orderIndex ||
      question.plannedCompletedOffsetMs <= previousOffsetMs
    ) {
      return false;
    }

    previousOffsetMs = question.plannedCompletedOffsetMs;
  }

  return input.plannedSubmittedOffsetMs >= previousOffsetMs;
}

function createDeterministicRandom(material: string) {
  const digest = createHash('sha256').update(material).digest();
  let state = digest.readUInt32LE(0) || 0x6d2b79f5;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInteger(random: () => number, minimum: number, maximum: number) {
  return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

function isBattleAiPlanQuestion(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const question = value as Record<string, unknown>;

  return (
    typeof question.battleQuestionSnapshotId === 'string' &&
    Number.isInteger(question.orderIndex) &&
    Number.isInteger(question.plannedCompletedOffsetMs) &&
    (question.plannedCompletedOffsetMs as number) > 0 &&
    typeof question.plannedCorrect === 'boolean'
  );
}
