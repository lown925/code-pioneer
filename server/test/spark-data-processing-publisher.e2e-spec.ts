import {
  buildSparkDataProcessingPublicationPlan,
  getSparkDataProcessingSourceStats,
  makeSparkDataProcessingId,
  parseSparkDataProcessingPublisherMode,
  runSparkDataProcessingPublisher,
} from '../scripts/publish-spark-data-processing';

describe('Spark data processing targeted publisher', () => {
  it('locks source statistics and stable identities', () => {
    expect(parseSparkDataProcessingPublisherMode([])).toBe('DRY_RUN');
    expect(getSparkDataProcessingSourceStats()).toEqual({ chapters: 10, lessons: 60, questions: 180, battleQuestions: 120, mediumBattleQuestions: 60, hardBattleQuestions: 60, codeFillQuestions: 30 });
    const plan = buildSparkDataProcessingPublicationPlan();
    const questions = plan.flatMap((chapter) => chapter.quiz.questions);
    expect(new Set(plan.map((chapter) => chapter.chapterId)).size).toBe(10);
    expect(new Set(questions.map((question) => question.id)).size).toBe(180);
    expect(plan[0]?.chapterId).toBe(makeSparkDataProcessingId('chapter', 'spark-data-processing:spark-data-processing-chapter-01'));
  });

  it('dry-run performs no transaction or writes', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const transaction = jest.fn();
    const result = await runSparkDataProcessingPublisher({ course: { findUnique, findMany: jest.fn() }, $transaction: transaction }, 'DRY_RUN');
    expect(result).toMatchObject({ mode: 'DRY_RUN', production: { found: false, needsUpdate: 180 }, transactionCommitted: false });
    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('enters the transaction path for APPLY mode', async () => {
    const transaction = jest.fn().mockResolvedValue({ courseId: makeSparkDataProcessingId('course', 'spark-data-processing') });
    const result = await runSparkDataProcessingPublisher({ course: { findUnique: jest.fn().mockResolvedValue(null), findMany: jest.fn() }, $transaction: transaction }, parseSparkDataProcessingPublisherMode(['--apply']));
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0]?.[0]).toEqual(expect.any(Function));
    expect(result).toMatchObject({ mode: 'APPLY', transactionCommitted: true });
  });
});

