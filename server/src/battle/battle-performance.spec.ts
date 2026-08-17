import {
  calculateBattlePerformance,
  calculateBestCombo,
} from './battle-performance';

describe('battle performance', () => {
  it('calculates answered count, accuracy, and completion rate', () => {
    expect(calculateBattlePerformance(7, 3, 20)).toEqual({
      answeredCount: 10,
      accuracy: 70,
      completionRate: 50,
    });
  });

  it('returns zero percentages for an unanswered battle', () => {
    expect(calculateBattlePerformance(0, 0, 20)).toEqual({
      answeredCount: 0,
      accuracy: 0,
      completionRate: 0,
    });
  });

  const questions = ['q1', 'q2', 'q3', 'q4'].map((id, orderIndex) => ({
    id,
    orderIndex,
  }));

  it('calculates a combo when all final answers are correct', () => {
    expect(
      calculateBestCombo(
        questions,
        questions.map((question) => ({
          battleQuestionSnapshotId: question.id,
          isCorrect: true,
        })),
      ),
    ).toBe(4);
  });

  it('resets the combo after a wrong answer', () => {
    expect(
      calculateBestCombo(questions, [
        { battleQuestionSnapshotId: 'q1', isCorrect: true },
        { battleQuestionSnapshotId: 'q2', isCorrect: false },
        { battleQuestionSnapshotId: 'q3', isCorrect: true },
        { battleQuestionSnapshotId: 'q4', isCorrect: true },
      ]),
    ).toBe(2);
  });

  it('resets the combo for an unanswered question', () => {
    expect(
      calculateBestCombo(questions, [
        { battleQuestionSnapshotId: 'q1', isCorrect: true },
        { battleQuestionSnapshotId: 'q3', isCorrect: true },
        { battleQuestionSnapshotId: 'q4', isCorrect: true },
      ]),
    ).toBe(2);
  });

  it('returns zero for all wrong or all unanswered answers', () => {
    expect(
      calculateBestCombo(questions, [
        { battleQuestionSnapshotId: 'q1', isCorrect: false },
        { battleQuestionSnapshotId: 'q2', isCorrect: false },
      ]),
    ).toBe(0);
    expect(calculateBestCombo(questions, [])).toBe(0);
  });
});
