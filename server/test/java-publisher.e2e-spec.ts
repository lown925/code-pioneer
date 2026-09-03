import {
  buildJavaPublicationPlan,
  getJavaSourceStats,
  makeJavaObjectOrientedProgrammingId,
  parseJavaPublisherMode,
  runJavaPublisher,
} from '../scripts/publish-java-object-oriented-programming';

describe('Java targeted publisher', () => {
  it('defaults to dry-run and locks source statistics and stable identities', () => {
    expect(parseJavaPublisherMode([])).toBe('DRY_RUN');
    expect(getJavaSourceStats()).toEqual({ chapters: 10, lessons: 60, questions: 180, battleQuestions: 120, mediumBattleQuestions: 60, hardBattleQuestions: 60, codeFillQuestions: 30 });
    const plan = buildJavaPublicationPlan();
    const questions = plan.flatMap((chapter) => chapter.quiz.questions);
    expect(new Set(plan.map((chapter) => chapter.chapterId)).size).toBe(10);
    expect(new Set(questions.map((question) => question.id)).size).toBe(180);
    expect(plan[0]?.chapterId).toBe(makeJavaObjectOrientedProgrammingId('chapter', 'java-object-oriented-programming:java-object-oriented-programming-chapter-01'));
  });

  it('dry-run performs no transaction or writes', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const findMany = jest.fn().mockResolvedValue([]);
    const transaction = jest.fn();
    const result = await runJavaPublisher({ course: { findUnique, findMany }, $transaction: transaction }, 'DRY_RUN');
    expect(result).toMatchObject({ mode: 'DRY_RUN', production: { found: false, needsUpdate: 180 }, transactionCommitted: false });
    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(findMany).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it('counts every unchanged question when production definitions match the source plan', async () => {
    const plan = buildJavaPublicationPlan();
    const courseId = makeJavaObjectOrientedProgrammingId('course', 'java-object-oriented-programming');
    const production = { id: courseId, slug: 'java-object-oriented-programming', title: 'Java 面向对象程序设计', status: 'PUBLISHED', chapters: plan.map((record) => ({ id: record.chapterId, courseId, title: record.chapter.title, summary: record.chapter.summary, estimatedMinutes: record.chapter.estimatedMinutes, sortOrder: record.chapter.sortOrder, status: 'PUBLISHED', contentBlocks: record.contentBlocks.map((block) => ({ ...block, isVisible: true, deletedAt: null })), quiz: { id: record.quiz.id, chapterId: record.quiz.chapterId, title: record.quiz.title, description: record.quiz.description, passScorePercent: record.quiz.passScorePercent, status: 'PUBLISHED', questions: record.quiz.questions.map((question) => ({ ...question, stemBlocks: question.stemBlocks === null ? null : question.stemBlocks, explanationBlocks: question.explanationBlocks === null ? null : question.explanationBlocks, acceptedAnswers: question.acceptedAnswers === null ? null : question.acceptedAnswers, answerNormalization: question.answerNormalization === null ? null : question.answerNormalization })) } })) };
    const result = await runJavaPublisher({ course: { findUnique: jest.fn().mockResolvedValue(production), findMany: jest.fn() }, $transaction: jest.fn() }, 'DRY_RUN');
    expect(result).toMatchObject({ production: { found: true, questions: 180, unchanged: 180, needsUpdate: 0 }, transactionCommitted: false });
  });
});
