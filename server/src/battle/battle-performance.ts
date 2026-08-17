export type BattlePerformance = {
  answeredCount: number;
  accuracy: number;
  completionRate: number;
};

type BattleQuestionOrder = {
  id: string;
  orderIndex: number;
};

type BattleFinalAnswer = {
  battleQuestionSnapshotId: string;
  isCorrect: boolean;
};

function roundPercentage(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateBattlePerformance(
  correctCount: number,
  wrongCount: number,
  totalQuestions: number,
): BattlePerformance {
  const answeredCount = Math.max(0, correctCount) + Math.max(0, wrongCount);

  return {
    answeredCount,
    accuracy:
      answeredCount === 0
        ? 0
        : roundPercentage((Math.max(0, correctCount) / answeredCount) * 100),
    completionRate:
      totalQuestions <= 0
        ? 0
        : roundPercentage((answeredCount / totalQuestions) * 100),
  };
}

export function calculateBestCombo(
  questions: BattleQuestionOrder[],
  answers: BattleFinalAnswer[],
) {
  const answerByQuestionId = new Map(
    answers.map((answer) => [answer.battleQuestionSnapshotId, answer]),
  );
  let currentCombo = 0;
  let bestCombo = 0;

  for (const question of [...questions].sort(
    (left, right) => left.orderIndex - right.orderIndex,
  )) {
    const answer = answerByQuestionId.get(question.id);

    if (answer?.isCorrect) {
      currentCombo += 1;
      bestCombo = Math.max(bestCombo, currentCombo);
    } else {
      currentCombo = 0;
    }
  }

  return bestCombo;
}
