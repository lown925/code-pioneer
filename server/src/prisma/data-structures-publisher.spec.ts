import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DATA_STRUCTURES_ALGORITHMS_COURSE } from '../../prisma/seed-data/v1/data-structures-algorithms';
import {
  DATA_STRUCTURES_ALGORITHMS_SLUG,
  buildDataStructuresPublicationPlan,
  getDataStructuresSourceStats,
  makeDataStructuresId,
  formatDataStructuresPublisherResult,
  parseDataStructuresPublisherMode,
  runDataStructuresPublisher,
  validateDataStructuresSource,
  type DataStructuresPublisherDatabase,
} from '../../scripts/publish-data-structures-algorithms';
import type { SeedCourse } from '../../prisma/seed-data/types';

type Write = { delegate: string; args: any };

function createDatabase(options: { failAt?: number } = {}) {
  let writes: Write[] = [];
  let writeCount = 0;
  const findUnique = jest.fn(async ({ where }: any) => {
    if (where.slug !== DATA_STRUCTURES_ALGORITHMS_SLUG) {
      throw new Error(`unexpected course lookup: ${where.slug}`);
    }
    return null;
  });
  const findMany = jest.fn(async ({ where }: any) => {
    expect(where).toEqual({
      slug: {
        in: [
          'python-basic',
          'javascript-starter',
          DATA_STRUCTURES_ALGORITHMS_SLUG,
        ],
      },
    });
    return [
      {
        id: 'course-python',
        slug: 'python-basic',
        title: 'Python basic',
        status: 'PUBLISHED',
        chapters: [
          {
            id: 'chapter-python',
            status: 'PUBLISHED',
            quiz: {
              questions: [
                {
                  knowledgeTags: ['lesson:python-introduction'],
                  isBattleEnabled: true,
                },
              ],
            },
          },
        ],
      },
    ];
  });

  const write = (delegate: string) =>
    jest.fn(async (args: any) => {
      writeCount += 1;
      if (options.failAt === writeCount) {
        throw new Error('simulated publisher failure');
      }
      writes.push({ delegate, args: structuredClone(args) });
      return {
        id: args.create?.id ?? args.where?.id ?? 'course-data-structures',
      };
    });

  const delegates = {
    course: { findUnique, findMany, upsert: write('course') },
    courseChapter: { upsert: write('courseChapter') },
    chapterContentBlock: { upsert: write('chapterContentBlock') },
    quiz: { upsert: write('quiz') },
    quizQuestion: { upsert: write('quizQuestion') },
    quizOption: { upsert: write('quizOption') },
  };
  const transaction = jest.fn(
    async (callback: (tx: typeof delegates) => Promise<unknown>) => {
      const before = structuredClone(writes);
      try {
        return await callback(delegates);
      } catch (error) {
        writes = before;
        throw error;
      }
    },
  );
  const database = {
    course: { findUnique, findMany },
    $transaction: transaction,
  } as unknown as DataStructuresPublisherDatabase;

  return {
    database,
    findUnique,
    findMany,
    transaction,
    delegates,
    getWrites: () => structuredClone(writes),
  };
}

describe('data structures targeted publisher', () => {
  it('defaults to dry-run and rejects arbitrary course input', () => {
    expect(DATA_STRUCTURES_ALGORITHMS_SLUG).toBe('data-structures-algorithms');
    expect(parseDataStructuresPublisherMode([])).toBe('DRY_RUN');
    expect(parseDataStructuresPublisherMode(['--dry-run'])).toBe('DRY_RUN');
    expect(parseDataStructuresPublisherMode(['--apply'])).toBe('APPLY');
    expect(() =>
      parseDataStructuresPublisherMode(['--course=python-basic']),
    ).toThrow();
    expect(() =>
      parseDataStructuresPublisherMode(['--dry-run', '--apply']),
    ).toThrow();
  });

  it('locks source statistics and all deterministic identities', () => {
    const stats = getDataStructuresSourceStats();
    const plan = buildDataStructuresPublicationPlan();
    const questions = plan.flatMap((chapter) => chapter.quiz.questions);
    const options = questions.flatMap((question) => question.options);
    const blocks = plan.flatMap((chapter) => chapter.contentBlocks);

    expect(stats).toEqual({
      chapters: 12,
      lessons: 72,
      questions: 216,
      battleQuestions: 144,
      mediumBattleQuestions: 72,
      hardBattleQuestions: 72,
      codeFillQuestions: 36,
    });
    expect(new Set(plan.map((chapter) => chapter.chapterId)).size).toBe(12);
    expect(new Set(questions.map((question) => question.id)).size).toBe(216);
    expect(new Set(options.map((option) => option.id)).size).toBe(
      options.length,
    );
    expect(new Set(blocks.map((block) => block.id)).size).toBe(blocks.length);
    expect(plan[0]?.chapterId).toBe(
      makeDataStructuresId(
        'chapter',
        'data-structures-algorithms:data-structures-algorithms-introduction',
      ),
    );
  });

  it('dry-run reads only the fixed course baseline and performs no writes', async () => {
    const fake = createDatabase();
    const result = await runDataStructuresPublisher(fake.database, 'DRY_RUN');

    expect(result).toMatchObject({
      mode: 'DRY_RUN',
      production: {
        found: false,
        chapters: 0,
        lessons: 0,
        questions: 0,
        needsUpdate: 216,
      },
      courseBaseline: [
        {
          found: true,
          courseId: 'course-python',
          slug: 'python-basic',
          status: 'PUBLISHED',
          chapters: 1,
          publishedChapters: 1,
          lessons: 1,
          questions: 1,
          battleQuestions: 1,
        },
        {
          found: false,
          slug: 'javascript-starter',
        },
        {
          found: false,
          slug: DATA_STRUCTURES_ALGORITHMS_SLUG,
        },
      ],
      transactionCommitted: false,
    });
    expect(fake.findMany).toHaveBeenCalledTimes(1);
    expect(fake.findUnique).toHaveBeenCalledTimes(1);
    expect(fake.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: DATA_STRUCTURES_ALGORITHMS_SLUG },
      }),
    );
    expect(fake.transaction).not.toHaveBeenCalled();
    expect(fake.getWrites()).toEqual([]);

    const report = formatDataStructuresPublisherResult(result);
    expect(report).toContain(
      'Baseline python-basic: course-python / Python basic / PUBLISHED / 1 chapters (1 published) / 1 lessons / 1 questions / 1 Battle',
    );
    expect(report).toContain(
      'Baseline javascript-starter: NOT_FOUND / NOT_FOUND / NOT_FOUND / 0 chapters (0 published)',
    );
  });

  it('apply writes only course definition delegates in one transaction', async () => {
    const fake = createDatabase();
    const result = await runDataStructuresPublisher(fake.database, 'APPLY');
    const writes = fake.getWrites();

    expect(result.transactionCommitted).toBe(true);
    expect(fake.transaction).toHaveBeenCalledTimes(1);
    expect(new Set(writes.map((item) => item.delegate))).toEqual(
      new Set([
        'course',
        'courseChapter',
        'chapterContentBlock',
        'quiz',
        'quizQuestion',
        'quizOption',
      ]),
    );
    expect(
      writes.filter((item) => item.delegate === 'courseChapter'),
    ).toHaveLength(12);
    expect(writes.filter((item) => item.delegate === 'quiz')).toHaveLength(12);
    expect(
      writes.filter((item) => item.delegate === 'quizQuestion'),
    ).toHaveLength(216);
    expect(
      writes
        .filter((item) => item.delegate === 'course')
        .every(
          (item) => item.args.where.slug === DATA_STRUCTURES_ALGORITHMS_SLUG,
        ),
    ).toBe(true);
  });

  it('uses the same upsert identities on repeated apply', async () => {
    const fake = createDatabase();
    await runDataStructuresPublisher(fake.database, 'APPLY');
    const first = fake.getWrites();
    await runDataStructuresPublisher(fake.database, 'APPLY');
    const second = fake.getWrites().slice(first.length);
    const identity = (write: Write) =>
      `${write.delegate}:${write.args.where.id ?? write.args.where.chapterId ?? write.args.where.slug}`;

    expect(second.map(identity)).toEqual(first.map(identity));
  });

  it('rolls back every definition write on transaction failure', async () => {
    const fake = createDatabase({ failAt: 40 });
    await expect(
      runDataStructuresPublisher(fake.database, 'APPLY'),
    ).rejects.toThrow('simulated publisher failure');
    expect(fake.getWrites()).toEqual([]);
  });

  it('fails fast on source identity or count drift', () => {
    const wrongSlug = structuredClone(
      DATA_STRUCTURES_ALGORITHMS_COURSE,
    ) as SeedCourse;
    wrongSlug.slug = 'python-basic';
    expect(() => validateDataStructuresSource(wrongSlug)).toThrow(
      'source slug drifted',
    );

    const wrongChapter = structuredClone(
      DATA_STRUCTURES_ALGORITHMS_COURSE,
    ) as SeedCourse;
    wrongChapter.chapters[0]!.key = 'changed-chapter-key';
    expect(() => validateDataStructuresSource(wrongChapter)).toThrow(
      'chapter identity drifted',
    );

    const missingQuestion = structuredClone(
      DATA_STRUCTURES_ALGORITHMS_COURSE,
    ) as SeedCourse;
    missingQuestion.chapters[0]!.lessons[0]!.questions.pop();
    expect(() => validateDataStructuresSource(missingQuestion)).toThrow(
      /question identity drifted|source statistics drifted/,
    );
  });

  it('contains no user, Python, delete, Battle history, or Rating write path', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'scripts/publish-data-structures-algorithms.ts'),
      'utf8',
    );
    expect(source).not.toMatch(
      /\.(?:delete|deleteMany|create|createMany|updateMany)\s*\(/,
    );
    expect(source).not.toMatch(
      /(?:user|courseLearningRecord|chapterLearningRecord|quizAttempt|quizAnswer|practiceAttempt|practiceAnswer|battleRoom|battleParticipant|battleAnswer|battleQuestionSnapshot|battleRatingLog|battleProfile|userBattleSkillRating)\.(?:upsert|update|create|delete)/,
    );
    expect(source).not.toMatch(/where:\s*\{\s*slug:\s*['"]python-basic['"]/);
  });
});
