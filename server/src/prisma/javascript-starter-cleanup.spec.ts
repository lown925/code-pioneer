import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  JAVASCRIPT_STARTER_SLUG,
  formatJavascriptStarterCleanupResult,
  parseJavascriptStarterCleanupMode,
  runJavascriptStarterCleanup,
  type JavascriptStarterCleanupDatabase,
} from '../../scripts/cleanup-javascript-starter';

function createDatabase(found = true) {
  const course = found
    ? {
        id: 'course-js',
        title: 'JavaScript 入门示例课',
        status: 'PUBLISHED',
        _count: {
          chapters: 2,
          learningRecords: 3,
          practiceAttempts: 4,
          learningGoals: 1,
        },
      }
    : null;
  const chapters = found
    ? [
        {
          id: 'chapter-1',
          status: 'PUBLISHED',
          _count: { contentBlocks: 5, learningRecords: 2 },
        },
        {
          id: 'chapter-2',
          status: 'PUBLISHED',
          _count: { contentBlocks: 6, learningRecords: 1 },
        },
      ]
    : [];
  const quizzes = found
    ? [
        {
          id: 'quiz-1',
          status: 'PUBLISHED',
          _count: { questions: 2, attempts: 2 },
        },
        {
          id: 'quiz-2',
          status: 'PUBLISHED',
          _count: { questions: 1, attempts: 1 },
        },
      ]
    : [];
  const questions = found
    ? [
        {
          isBattleEnabled: true,
          knowledgeTags: ['lesson:variables'],
          _count: {
            options: 4,
            answers: 2,
            practiceAnswers: 1,
            battleQuestionSources: 2,
          },
        },
        {
          isBattleEnabled: true,
          knowledgeTags: ['lesson:functions'],
          _count: {
            options: 4,
            answers: 1,
            practiceAnswers: 2,
            battleQuestionSources: 1,
          },
        },
        {
          isBattleEnabled: false,
          knowledgeTags: ['lesson:functions'],
          _count: {
            options: 0,
            answers: 0,
            practiceAnswers: 0,
            battleQuestionSources: 0,
          },
        },
      ]
    : [];
  const writes = {
    courseUpdate: jest.fn(async () => ({})),
    chapterUpdateMany: jest.fn(async () => ({})),
    quizUpdateMany: jest.fn(async () => ({})),
    questionUpdateMany: jest.fn(async () => ({})),
  };
  const reader = {
    course: { findUnique: jest.fn(async () => structuredClone(course)) },
    courseChapter: { findMany: jest.fn(async () => structuredClone(chapters)) },
    quiz: { findMany: jest.fn(async () => structuredClone(quizzes)) },
    quizQuestion: { findMany: jest.fn(async () => structuredClone(questions)) },
  };
  const tx = {
    course: { ...reader.course, update: writes.courseUpdate },
    courseChapter: {
      ...reader.courseChapter,
      updateMany: writes.chapterUpdateMany,
    },
    quiz: { ...reader.quiz, updateMany: writes.quizUpdateMany },
    quizQuestion: {
      ...reader.quizQuestion,
      updateMany: writes.questionUpdateMany,
    },
  };
  const transaction = jest.fn(
    async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
  );
  const database = {
    ...reader,
    $transaction: transaction,
  } as unknown as JavascriptStarterCleanupDatabase;

  return { database, reader, writes, transaction };
}

describe('javascript-starter targeted archive', () => {
  it('uses a fixed slug and defaults to dry-run', () => {
    expect(JAVASCRIPT_STARTER_SLUG).toBe('javascript-starter');
    expect(parseJavascriptStarterCleanupMode([])).toBe('DRY_RUN');
    expect(parseJavascriptStarterCleanupMode(['--dry-run'])).toBe('DRY_RUN');
    expect(parseJavascriptStarterCleanupMode(['--apply'])).toBe('APPLY');
    expect(() => parseJavascriptStarterCleanupMode(['--slug=other'])).toThrow();
    expect(() =>
      parseJavascriptStarterCleanupMode(['--dry-run', '--apply']),
    ).toThrow();
  });

  it('dry-run reads reference counts without a transaction or writes', async () => {
    const fake = createDatabase();
    const result = await runJavascriptStarterCleanup(fake.database, 'DRY_RUN');

    expect(result).toMatchObject({
      mode: 'DRY_RUN',
      found: true,
      chapters: 2,
      lessons: 2,
      contentBlocks: 11,
      quizzes: 2,
      questions: 3,
      options: 8,
      courseLearningRecords: 3,
      chapterLearningRecords: 3,
      learningGoals: 1,
      quizAttempts: 3,
      quizAnswers: 3,
      practiceAttempts: 4,
      practiceAnswers: 3,
      battleSnapshots: 3,
      battleEnabledQuestions: 2,
      archived: false,
    });
    expect(fake.transaction).not.toHaveBeenCalled();
    Object.values(fake.writes).forEach((write) =>
      expect(write).not.toHaveBeenCalled(),
    );
  });

  it('reports a missing course without writes', async () => {
    const fake = createDatabase(false);
    const result = await runJavascriptStarterCleanup(fake.database, 'DRY_RUN');
    expect(result).toMatchObject({ found: false, chapters: 0, questions: 0 });
    expect(fake.reader.courseChapter.findMany).not.toHaveBeenCalled();
  });

  it('apply archives definitions in one transaction without deleting history', async () => {
    const fake = createDatabase();
    const result = await runJavascriptStarterCleanup(fake.database, 'APPLY');

    expect(result.archived).toBe(true);
    expect(fake.transaction).toHaveBeenCalledTimes(1);
    expect(fake.writes.questionUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isBattleEnabled: false } }),
    );
    expect(fake.writes.quizUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'DISABLED' } }),
    );
    expect(fake.writes.chapterUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'OFFLINE' } }),
    );
    expect(fake.writes.courseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'OFFLINE' } }),
    );
  });

  it('contains no physical delete, create, or upsert operation', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'scripts/cleanup-javascript-starter.ts'),
      'utf8',
    );
    expect(source).not.toMatch(
      /\.(?:delete|deleteMany|create|createMany|upsert)\s*\(/,
    );
    expect(source).not.toMatch(
      /(?:quizAnswer|practiceAnswer|battleQuestionSnapshot)\.(?:update|delete|create)/,
    );
  });

  it('formats a bounded dry-run report without environment secrets', async () => {
    const fake = createDatabase();
    const report = formatJavascriptStarterCleanupResult(
      await runJavascriptStarterCleanup(fake.database, 'DRY_RUN'),
    );
    expect(report).toContain('Mode: DRY_RUN');
    expect(report).toContain('Course slug: javascript-starter');
    expect(report).toContain('No database writes performed.');
    expect(report).not.toMatch(/DATABASE_URL|JWT|WECHAT|postgres(?:ql)?:\/\//i);
  });
});
