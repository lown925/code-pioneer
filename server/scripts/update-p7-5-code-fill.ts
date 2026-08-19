import 'dotenv/config';

import { createHash } from 'crypto';
import { PYTHON_BASIC_CHAPTER_15 } from '../prisma/seed-data/v1/python-basic-chapter-15';
import type { SeedCodeFillQuestion } from '../prisma/seed-data/types';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

const COURSE_SLUG = 'python-basic';
const COURSE_ID = 'a5cf7007-ca72-408a-abaf-ebabc3163015';
const CHAPTER_KEY = 'python-basics-capstone-project';
const CHAPTER_ID = '23b7ad30-a68f-5c4f-a9dc-95b04978930d';
const QUIZ_ID = '0bf5e478-49ed-5b26-b9cb-9e229de37f12';
const BATTLE_SKILL_CODE = 'PYTHON';
const SEED_NAMESPACE = 'code-pioneer.seed-content';
const TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 120_000,
} as const;

export const P7_5_CODE_FILL_TARGETS = [
  {
    id: '3c2b917e-0dd1-5f5e-920b-dc0f3683c21a',
    lessonKey: 'analyze-requirements-and-data',
    questionKey: 'add-battle-records-field',
    sortOrder: 3,
  },
  {
    id: '36590c45-5638-5a02-81c8-9eee753633af',
    lessonKey: 'design-project-classes',
    questionKey: 'append-battle-record',
    sortOrder: 6,
  },
  {
    id: 'a83f7d5e-3155-56c6-b0f0-dfae3320781f',
    lessonKey: 'implement-learning-records',
    questionKey: 'calculate-average-progress',
    sortOrder: 9,
  },
  {
    id: '1092288c-46f7-53f9-8d72-c8c364a70fb7',
    lessonKey: 'implement-battle-records-and-statistics',
    questionKey: 'calculate-win-rate',
    sortOrder: 12,
  },
  {
    id: 'e565650d-7c65-5342-b7da-5283facc888c',
    lessonKey: 'persist-json-data',
    questionKey: 'dump-user-dictionary',
    sortOrder: 15,
  },
  {
    id: 'f6a9f041-0d03-5e5f-8706-be94b793d1a4',
    lessonKey: 'build-menu-and-finish-project',
    questionKey: 'break-menu-loop',
    sortOrder: 18,
  },
] as const;

export type P75UpdateMode = 'DRY_RUN' | 'APPLY';

type PersistedQuestion = {
  id: string;
  quizId: string;
  type: string;
  content: string;
  explanation: string | null;
  score: number;
  sortOrder: number;
  battlePresentation: string | null;
  battleDifficulty: string | null;
  isBattleEnabled: boolean;
  stemBlocks: unknown;
  explanationBlocks: unknown;
  acceptedAnswers: unknown;
  answerNormalization: unknown;
  caseSensitive: boolean;
  knowledgeTags: unknown;
  programmingLanguage: string | null;
  battleSkillCode: string | null;
  quiz: {
    chapterId: string;
    chapter: {
      courseId: string;
      course: {
        slug: string;
      };
    };
  };
};

type TargetSource = {
  id: string;
  stableIdentity: string;
  content: string;
  stemBlocks: NonNullable<SeedCodeFillQuestion['stemBlocks']>;
  expected: Omit<
    PersistedQuestion,
    'id' | 'content' | 'stemBlocks' | 'quiz'
  > & {
    quizId: string;
    chapterId: string;
    courseId: string;
    courseSlug: string;
  };
};

type QuestionReader = {
  quizQuestion: {
    findMany(args: unknown): Promise<PersistedQuestion[]>;
  };
};

type TransactionClient = QuestionReader & {
  $queryRaw<T>(query: unknown): Promise<T>;
  quizQuestion: QuestionReader['quizQuestion'] & {
    update(args: {
      where: { id: string };
      data: { content: string; stemBlocks: Prisma.InputJsonValue };
      select: { id: true; content: true; stemBlocks: true };
    }): Promise<{ id: string; content: string; stemBlocks: unknown }>;
  };
};

export type P75UpdaterDatabase = QuestionReader & {
  $transaction<T>(
    callback: (tx: TransactionClient) => Promise<T>,
    options?: typeof TRANSACTION_OPTIONS,
  ): Promise<T>;
};

export type P75QuestionChange = {
  id: string;
  stableIdentity: string;
  contentChanged: boolean;
  stemBlocksChanged: boolean;
};

export type P75UpdateResult = {
  mode: P75UpdateMode;
  matched: number;
  needsUpdate: number;
  unchanged: number;
  updated: number;
  changes: P75QuestionChange[];
};

const QUESTION_SELECT = {
  id: true,
  quizId: true,
  type: true,
  content: true,
  explanation: true,
  score: true,
  sortOrder: true,
  battlePresentation: true,
  battleDifficulty: true,
  isBattleEnabled: true,
  stemBlocks: true,
  explanationBlocks: true,
  acceptedAnswers: true,
  answerNormalization: true,
  caseSensitive: true,
  knowledgeTags: true,
  programmingLanguage: true,
  battleSkillCode: true,
  quiz: {
    select: {
      chapterId: true,
      chapter: {
        select: {
          courseId: true,
          course: { select: { slug: true } },
        },
      },
    },
  },
} as const;

function stableUuid(input: string) {
  const hash = createHash('sha1').update(input).digest();
  const bytes = Uint8Array.from(hash.subarray(0, 16));

  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Buffer.from(bytes).toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

function makeId(kind: string, key: string) {
  return stableUuid(`${SEED_NAMESPACE}:${kind}:${key}`);
}

function normalizedJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizedJson);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizedJson(item)]),
    );
  }

  return value;
}

function valuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(normalizedJson(left)) === JSON.stringify(normalizedJson(right));
}

function assertEqual(
  questionId: string,
  field: string,
  actual: unknown,
  expected: unknown,
) {
  if (!valuesEqual(actual, expected)) {
    throw new Error(`Question ${questionId} identity drift: ${field}`);
  }
}

export function parseP75UpdateMode(args: string[]): P75UpdateMode {
  const knownArguments = new Set(['--dry-run', '--apply']);
  const unknownArguments = args.filter((argument) => !knownArguments.has(argument));

  if (unknownArguments.length > 0) {
    throw new Error(`Unknown updater argument: ${unknownArguments.join(', ')}`);
  }

  if (args.includes('--dry-run') && args.includes('--apply')) {
    throw new Error('--dry-run and --apply cannot be used together.');
  }

  return args.includes('--apply') ? 'APPLY' : 'DRY_RUN';
}

export function buildP75TargetSources(): TargetSource[] {
  const expectedChapterId = makeId('chapter', `${COURSE_SLUG}:${CHAPTER_KEY}`);
  const expectedQuizId = makeId('quiz', `${COURSE_SLUG}:${CHAPTER_KEY}`);
  if (expectedChapterId !== CHAPTER_ID || expectedQuizId !== QUIZ_ID) {
    throw new Error('P7-5 audited chapter identity constants are invalid.');
  }

  const questionByIdentity = new Map<
    string,
    { question: SeedCodeFillQuestion; sortOrder: number }
  >();
  let sortOrder = 0;

  for (const lesson of PYTHON_BASIC_CHAPTER_15.lessons) {
    for (const question of lesson.questions) {
      sortOrder += 1;
      if (question.type === 'CODE_FILL') {
        questionByIdentity.set(`${lesson.key}:${question.key}`, {
          question,
          sortOrder,
        });
      }
    }
  }

  return P7_5_CODE_FILL_TARGETS.map((target) => {
    const stableIdentity = `${COURSE_SLUG}:${CHAPTER_KEY}:${target.lessonKey}:${target.questionKey}`;
    const source = questionByIdentity.get(
      `${target.lessonKey}:${target.questionKey}`,
    );

    if (!source) {
      throw new Error(`Missing P7-5 source question: ${stableIdentity}`);
    }
    if (source.sortOrder !== target.sortOrder) {
      throw new Error(`P7-5 source sort order drift: ${target.id}`);
    }
    if (makeId('question', stableIdentity) !== target.id) {
      throw new Error(`P7-5 deterministic question ID drift: ${target.id}`);
    }
    if (!source.question.stemBlocks?.length) {
      throw new Error(`P7-5 source question has no stem blocks: ${target.id}`);
    }

    const normalization = source.question.answerNormalization;

    return {
      id: target.id,
      stableIdentity,
      content: source.question.title,
      stemBlocks: source.question.stemBlocks,
      expected: {
        quizId: QUIZ_ID,
        chapterId: CHAPTER_ID,
        courseId: COURSE_ID,
        courseSlug: COURSE_SLUG,
        type: 'CODE_FILL',
        explanation: source.question.explanation,
        score: source.question.score,
        sortOrder: target.sortOrder,
        battlePresentation: source.question.battlePresentation,
        battleDifficulty: source.question.difficulty,
        isBattleEnabled: source.question.isBattleEnabled,
        explanationBlocks: source.question.explanationBlocks ?? null,
        acceptedAnswers: source.question.acceptedAnswers,
        answerNormalization: {
          trim: normalization?.trim ?? true,
          normalizeLineEndings: normalization?.normalizeLineEndings ?? true,
          caseSensitive: normalization?.caseSensitive ?? true,
          collapseWhitespace: normalization?.collapseWhitespace ?? false,
        },
        caseSensitive: normalization?.caseSensitive ?? true,
        knowledgeTags: [
          `course:${COURSE_SLUG}`,
          `chapter:${CHAPTER_KEY}`,
          `lesson:${target.lessonKey}`,
          ...(source.question.tags ?? []),
          `difficulty:${source.question.difficulty.toLowerCase()}`,
        ],
        programmingLanguage: source.question.programmingLanguage,
        battleSkillCode: BATTLE_SKILL_CODE,
      },
    };
  });
}

function assertQuestionIdentity(record: PersistedQuestion, source: TargetSource) {
  const expected = source.expected;
  const fields: Array<[string, unknown, unknown]> = [
    ['id', record.id, source.id],
    ['quizId', record.quizId, expected.quizId],
    ['chapterId', record.quiz.chapterId, expected.chapterId],
    ['courseId', record.quiz.chapter.courseId, expected.courseId],
    ['courseSlug', record.quiz.chapter.course.slug, expected.courseSlug],
    ['type', record.type, expected.type],
    ['difficulty', record.battleDifficulty, expected.battleDifficulty],
    ['isBattleEnabled', record.isBattleEnabled, expected.isBattleEnabled],
    ['battlePresentation', record.battlePresentation, expected.battlePresentation],
    ['programmingLanguage', record.programmingLanguage, expected.programmingLanguage],
    ['score', record.score, expected.score],
    ['sortOrder', record.sortOrder, expected.sortOrder],
    ['acceptedAnswers', record.acceptedAnswers, expected.acceptedAnswers],
    ['answerNormalization', record.answerNormalization, expected.answerNormalization],
    ['caseSensitive', record.caseSensitive, expected.caseSensitive],
    ['explanation', record.explanation, expected.explanation],
    ['explanationBlocks', record.explanationBlocks, expected.explanationBlocks],
    ['knowledgeTags', record.knowledgeTags, expected.knowledgeTags],
    ['battleSkillCode', record.battleSkillCode, expected.battleSkillCode],
  ];

  for (const [field, actual, expectedValue] of fields) {
    assertEqual(source.id, field, actual, expectedValue);
  }
}

async function inspectQuestions(
  database: QuestionReader,
  sources: TargetSource[],
): Promise<{ records: PersistedQuestion[]; changes: P75QuestionChange[] }> {
  const ids = sources.map((source) => source.id);
  const records = await database.quizQuestion.findMany({
    where: { id: { in: ids } },
    orderBy: { sortOrder: 'asc' },
    select: QUESTION_SELECT,
  });

  if (records.length !== sources.length) {
    throw new Error(
      `P7-5 question count mismatch: expected ${sources.length}, matched ${records.length}`,
    );
  }

  const recordsById = new Map(records.map((record) => [record.id, record]));
  const changes = sources.map((source) => {
    const record = recordsById.get(source.id);

    if (!record) {
      throw new Error(`Missing P7-5 production question: ${source.id}`);
    }

    assertQuestionIdentity(record, source);

    return {
      id: source.id,
      stableIdentity: source.stableIdentity,
      contentChanged: record.content !== source.content,
      stemBlocksChanged: !valuesEqual(record.stemBlocks, source.stemBlocks),
    };
  });

  return { records, changes };
}

function assertLockedTargets(lockedRows: Array<{ id: string }>, sources: TargetSource[]) {
  const lockedIds = new Set(lockedRows.map((row) => row.id));

  if (
    lockedRows.length !== sources.length ||
    sources.some((source) => !lockedIds.has(source.id))
  ) {
    throw new Error(
      `P7-5 locked question count mismatch: expected ${sources.length}, matched ${lockedRows.length}`,
    );
  }
}

function resultFor(
  mode: P75UpdateMode,
  changes: P75QuestionChange[],
  updated: number,
): P75UpdateResult {
  const needsUpdate = changes.filter(
    (change) => change.contentChanged || change.stemBlocksChanged,
  ).length;

  return {
    mode,
    matched: changes.length,
    needsUpdate,
    unchanged: changes.length - needsUpdate,
    updated,
    changes,
  };
}

export async function runP75CodeFillUpdate(
  database: P75UpdaterDatabase,
  mode: P75UpdateMode,
): Promise<P75UpdateResult> {
  const sources = buildP75TargetSources();

  if (mode === 'DRY_RUN') {
    const { changes } = await inspectQuestions(database, sources);
    return resultFor(mode, changes, 0);
  }

  return database.$transaction(async (tx) => {
    const lockedRows = await tx.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT "id"::text AS "id"
        FROM "quiz_questions"
        WHERE "id" IN (${Prisma.join(
          sources.map((source) => Prisma.sql`${source.id}::uuid`),
        )})
        FOR UPDATE
      `,
    );
    assertLockedTargets(lockedRows, sources);

    const { changes } = await inspectQuestions(tx, sources);
    const sourcesById = new Map(sources.map((source) => [source.id, source]));
    let updated = 0;

    for (const change of changes) {
      if (!change.contentChanged && !change.stemBlocksChanged) {
        continue;
      }

      const source = sourcesById.get(change.id)!;
      const record = await tx.quizQuestion.update({
        where: { id: source.id },
        data: {
          content: source.content,
          stemBlocks: source.stemBlocks as Prisma.InputJsonValue,
        },
        select: { id: true, content: true, stemBlocks: true },
      });

      assertEqual(source.id, 'updated.id', record.id, source.id);
      assertEqual(source.id, 'updated.content', record.content, source.content);
      assertEqual(
        source.id,
        'updated.stemBlocks',
        record.stemBlocks,
        source.stemBlocks,
      );
      updated += 1;
    }

    return resultFor(mode, changes, updated);
  }, TRANSACTION_OPTIONS);
}

export function formatP75UpdateResult(result: P75UpdateResult) {
  const lines = [
    'P7-5 CODE_FILL update',
    `Mode: ${result.mode}`,
    `Matched: ${result.matched}`,
    `Needs update: ${result.needsUpdate}`,
    `Unchanged: ${result.unchanged}`,
    '',
  ];

  for (const change of result.changes) {
    lines.push(
      `[${change.id}]`,
      `identity: ${change.stableIdentity}`,
      `content: ${change.contentChanged ? 'CHANGE' : 'NO_CHANGE'}`,
      `stemBlocks: ${change.stemBlocksChanged ? 'CHANGE' : 'NO_CHANGE'}`,
      '',
    );
  }

  if (result.mode === 'DRY_RUN') {
    lines.push('No database writes performed.');
  } else {
    lines.push(`Validated: ${result.matched}`);
    lines.push(`Updated: ${result.updated}`);
    lines.push('Transaction committed.');
  }

  return lines.join('\n');
}

async function main() {
  const mode = parseP75UpdateMode(process.argv.slice(2));
  const prisma = new PrismaService();

  try {
    await prisma.$connect();
    const result = await runP75CodeFillUpdate(
      prisma as unknown as P75UpdaterDatabase,
      mode,
    );
    console.log(formatP75UpdateResult(result));
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`P7-5 CODE_FILL update failed: ${message}`);
    process.exitCode = 1;
  });
}
