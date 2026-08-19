import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  buildP75TargetSources,
  formatP75UpdateResult,
  P7_5_CODE_FILL_TARGETS,
  parseP75UpdateMode,
  runP75CodeFillUpdate,
  type P75UpdaterDatabase,
} from '../../scripts/update-p7-5-code-fill';

type MutableQuestion = ReturnType<typeof buildRecord>;

function buildRecord(index: number) {
  const source = buildP75TargetSources()[index]!;
  const expected = source.expected;

  return {
    id: source.id,
    quizId: expected.quizId,
    type: expected.type,
    content: `old content ${index}`,
    explanation: expected.explanation,
    score: expected.score,
    sortOrder: expected.sortOrder,
    battlePresentation: expected.battlePresentation,
    battleDifficulty: expected.battleDifficulty,
    isBattleEnabled: expected.isBattleEnabled,
    stemBlocks: null,
    explanationBlocks: expected.explanationBlocks,
    acceptedAnswers: structuredClone(expected.acceptedAnswers),
    answerNormalization: structuredClone(expected.answerNormalization),
    caseSensitive: expected.caseSensitive,
    knowledgeTags: structuredClone(expected.knowledgeTags),
    programmingLanguage: expected.programmingLanguage,
    battleSkillCode: expected.battleSkillCode,
    quiz: {
      chapterId: expected.chapterId,
      chapter: {
        courseId: expected.courseId,
        course: { slug: expected.courseSlug },
      },
    },
  };
}

function createDatabase(initialRecords = P7_5_CODE_FILL_TARGETS.map((_, index) => buildRecord(index))) {
  let records: MutableQuestion[] = structuredClone(initialRecords);
  const forbidden = {
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
  };
  const snapshotAccess = jest.fn();
  const quizAnswerAccess = jest.fn();
  const practiceAnswerAccess = jest.fn();
  let failUpdateAt: number | null = null;

  const findMany = jest.fn(async () => structuredClone(records));
  const update = jest.fn(async ({ where, data }: any) => {
    if (failUpdateAt !== null && update.mock.calls.length === failUpdateAt) {
      throw new Error('simulated update failure');
    }

    const record = records.find((candidate) => candidate.id === where.id);
    if (!record) {
      throw new Error('missing record');
    }
    record.content = data.content;
    record.stemBlocks = structuredClone(data.stemBlocks);
    return {
      id: record.id,
      content: record.content,
      stemBlocks: structuredClone(record.stemBlocks),
    };
  });
  const queryRaw = jest.fn(async () => records.map(({ id }) => ({ id })));
  const tx = {
    $queryRaw: queryRaw,
    quizQuestion: { findMany, update, ...forbidden },
    battleQuestionSnapshot: { findMany: snapshotAccess, update: snapshotAccess },
    quizAnswer: { update: quizAnswerAccess, updateMany: quizAnswerAccess },
    practiceAnswer: { update: practiceAnswerAccess, updateMany: practiceAnswerAccess },
  };
  const transaction = jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => {
    const before = structuredClone(records);
    try {
      return await callback(tx);
    } catch (error) {
      records = before;
      throw error;
    }
  });
  const database = {
    quizQuestion: { findMany },
    $transaction: transaction,
  } as unknown as P75UpdaterDatabase;

  return {
    database,
    findMany,
    update,
    queryRaw,
    transaction,
    forbidden,
    snapshotAccess,
    quizAnswerAccess,
    practiceAnswerAccess,
    getRecords: () => structuredClone(records),
    failOnUpdate: (callNumber: number) => {
      failUpdateAt = callNumber;
    },
  };
}

describe('P7-5 targeted CODE_FILL updater', () => {
  it('defaults to dry-run and requires an explicit apply flag', () => {
    expect(parseP75UpdateMode([])).toBe('DRY_RUN');
    expect(parseP75UpdateMode(['--dry-run'])).toBe('DRY_RUN');
    expect(parseP75UpdateMode(['--apply'])).toBe('APPLY');
    expect(() => parseP75UpdateMode(['--apply', '--dry-run'])).toThrow();
    expect(() => parseP75UpdateMode(['--question-id=other'])).toThrow();
  });

  it('uses the fixed six audited IDs and parsed chapter source', () => {
    const sources = buildP75TargetSources();

    expect(P7_5_CODE_FILL_TARGETS.map(({ id }) => id)).toEqual([
      '3c2b917e-0dd1-5f5e-920b-dc0f3683c21a',
      '36590c45-5638-5a02-81c8-9eee753633af',
      'a83f7d5e-3155-56c6-b0f0-dfae3320781f',
      '1092288c-46f7-53f9-8d72-c8c364a70fb7',
      'e565650d-7c65-5342-b7da-5283facc888c',
      'f6a9f041-0d03-5e5f-8706-be94b793d1a4',
    ]);
    expect(sources).toHaveLength(6);
    expect(
      sources.every(
        (source) =>
          source.expected.type === 'CODE_FILL' &&
          source.stemBlocks.some(
            (block) => block.type === 'CODE' && block.code.includes('____'),
          ),
      ),
    ).toBe(true);
  });

  it('dry-runs six records without a transaction or writes', async () => {
    const fake = createDatabase();
    const result = await runP75CodeFillUpdate(fake.database, 'DRY_RUN');

    expect(result).toMatchObject({
      mode: 'DRY_RUN',
      matched: 6,
      needsUpdate: 6,
      unchanged: 0,
      updated: 0,
    });
    expect(fake.transaction).not.toHaveBeenCalled();
    expect(fake.update).not.toHaveBeenCalled();
  });

  it('fails when fewer than six records are matched', async () => {
    const fake = createDatabase(
      P7_5_CODE_FILL_TARGETS.slice(0, 5).map((_, index) => buildRecord(index)),
    );

    await expect(runP75CodeFillUpdate(fake.database, 'DRY_RUN')).rejects.toThrow(
      'expected 6, matched 5',
    );
  });

  it.each([
    ['acceptedAnswers', (record: MutableQuestion) => (record.acceptedAnswers = ['drift'])],
    ['difficulty', (record: MutableQuestion) => (record.battleDifficulty = 'HARD')],
    ['isBattleEnabled', (record: MutableQuestion) => (record.isBattleEnabled = false)],
    ['type', (record: MutableQuestion) => (record.type = 'SINGLE_CHOICE')],
    ['quizId', (record: MutableQuestion) => (record.quizId = '00000000-0000-4000-8000-000000000000')],
    ['explanation', (record: MutableQuestion) => (record.explanation = 'drift')],
    ['knowledgeTags', (record: MutableQuestion) => (record.knowledgeTags = ['drift'])],
  ])('blocks apply when %s drifts', async (field, mutate) => {
    const records = P7_5_CODE_FILL_TARGETS.map((_, index) => buildRecord(index));
    mutate(records[0]!);
    const fake = createDatabase(records);

    await expect(runP75CodeFillUpdate(fake.database, 'APPLY')).rejects.toThrow(
      `identity drift: ${field}`,
    );
    expect(fake.update).not.toHaveBeenCalled();
  });

  it('allows only content and stemBlocks differences', async () => {
    const fake = createDatabase();

    const result = await runP75CodeFillUpdate(fake.database, 'APPLY');

    expect(result.updated).toBe(6);
    expect(fake.update).toHaveBeenCalledTimes(6);
    for (const call of fake.update.mock.calls) {
      expect(Object.keys(call[0].data).sort()).toEqual(['content', 'stemBlocks']);
    }
  });

  it('locks and validates all records in one transaction', async () => {
    const fake = createDatabase();

    await runP75CodeFillUpdate(fake.database, 'APPLY');

    expect(fake.transaction).toHaveBeenCalledTimes(1);
    expect(fake.queryRaw).toHaveBeenCalledTimes(1);
    expect(fake.findMany).toHaveBeenCalledTimes(1);
  });

  it('rolls back every update when an update fails midway', async () => {
    const fake = createDatabase();
    const before = fake.getRecords();
    fake.failOnUpdate(3);

    await expect(runP75CodeFillUpdate(fake.database, 'APPLY')).rejects.toThrow(
      'simulated update failure',
    );
    expect(fake.getRecords()).toEqual(before);
  });

  it('is idempotent after the first successful apply', async () => {
    const fake = createDatabase();

    const first = await runP75CodeFillUpdate(fake.database, 'APPLY');
    const second = await runP75CodeFillUpdate(fake.database, 'APPLY');

    expect(first.updated).toBe(6);
    expect(second).toMatchObject({ needsUpdate: 0, unchanged: 6, updated: 0 });
    expect(fake.update).toHaveBeenCalledTimes(6);
  });

  it('never accesses snapshots, user answers, or forbidden mutations', async () => {
    const fake = createDatabase();

    await runP75CodeFillUpdate(fake.database, 'APPLY');

    expect(fake.snapshotAccess).not.toHaveBeenCalled();
    expect(fake.quizAnswerAccess).not.toHaveBeenCalled();
    expect(fake.practiceAnswerAccess).not.toHaveBeenCalled();
    Object.values(fake.forbidden).forEach((operation) => {
      expect(operation).not.toHaveBeenCalled();
    });
  });

  it('contains no create, delete, upsert, or answer delegates in the updater', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'scripts/update-p7-5-code-fill.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/quizQuestion\.(?:create|delete|deleteMany|updateMany|upsert)\s*\(/);
    expect(source).not.toMatch(/(?:battleQuestionSnapshot|quizAnswer|practiceAnswer)\s*\./);
  });

  it('formats a bounded report without environment secrets', async () => {
    const fake = createDatabase();
    const result = await runP75CodeFillUpdate(fake.database, 'DRY_RUN');
    const report = formatP75UpdateResult(result);

    expect(report).toContain('Mode: DRY_RUN');
    expect(report).toContain('Matched: 6');
    expect(report).toContain('Needs update: 6');
    expect(report).toContain('No database writes performed.');
    expect(report).not.toMatch(/DATABASE_URL|JWT|WECHAT|postgres(?:ql)?:\/\//i);
  });
});
