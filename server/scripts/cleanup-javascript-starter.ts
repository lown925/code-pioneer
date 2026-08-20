import 'dotenv/config';

import { PrismaService } from '../src/prisma/prisma.service';

export const JAVASCRIPT_STARTER_SLUG = 'javascript-starter';
const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 120_000 } as const;

export type JavascriptStarterCleanupMode = 'DRY_RUN' | 'APPLY';

type CourseRecord = {
  id: string;
  title: string;
  status: string;
  _count: {
    chapters: number;
    learningRecords: number;
    practiceAttempts: number;
    learningGoals: number;
  };
};

type ChapterRecord = {
  id: string;
  status: string;
  _count: { contentBlocks: number; learningRecords: number };
};

type QuizRecord = {
  id: string;
  status: string;
  _count: { questions: number; attempts: number };
};

type QuestionRecord = {
  isBattleEnabled: boolean;
  knowledgeTags: unknown;
  _count: {
    options: number;
    answers: number;
    practiceAnswers: number;
    battleQuestionSources: number;
  };
};

type CleanupReader = {
  course: { findUnique(args: unknown): Promise<CourseRecord | null> };
  courseChapter: { findMany(args: unknown): Promise<ChapterRecord[]> };
  quiz: { findMany(args: unknown): Promise<QuizRecord[]> };
  quizQuestion: { findMany(args: unknown): Promise<QuestionRecord[]> };
};

type CleanupTransaction = CleanupReader & {
  course: CleanupReader['course'] & { update(args: unknown): Promise<unknown> };
  courseChapter: CleanupReader['courseChapter'] & {
    updateMany(args: unknown): Promise<unknown>;
  };
  quiz: CleanupReader['quiz'] & { updateMany(args: unknown): Promise<unknown> };
  quizQuestion: CleanupReader['quizQuestion'] & {
    updateMany(args: unknown): Promise<unknown>;
  };
};

export type JavascriptStarterCleanupDatabase = CleanupReader & {
  $transaction<T>(
    callback: (tx: CleanupTransaction) => Promise<T>,
    options?: typeof TRANSACTION_OPTIONS,
  ): Promise<T>;
};

export type JavascriptStarterCleanupResult = {
  mode: JavascriptStarterCleanupMode;
  found: boolean;
  courseId: string | null;
  courseTitle: string | null;
  courseStatus: string | null;
  chapters: number;
  lessons: number;
  contentBlocks: number;
  quizzes: number;
  questions: number;
  options: number;
  courseLearningRecords: number;
  chapterLearningRecords: number;
  learningGoals: number;
  quizAttempts: number;
  quizAnswers: number;
  practiceAttempts: number;
  practiceAnswers: number;
  battleSnapshots: number;
  battleEnabledQuestions: number;
  archived: boolean;
};

export function parseJavascriptStarterCleanupMode(
  args: string[],
): JavascriptStarterCleanupMode {
  const known = new Set(['--dry-run', '--apply']);
  const unknown = args.filter((argument) => !known.has(argument));
  if (unknown.length > 0) {
    throw new Error(`Unknown cleanup argument: ${unknown.join(', ')}`);
  }
  if (args.includes('--dry-run') && args.includes('--apply')) {
    throw new Error('--dry-run and --apply cannot be used together.');
  }
  return args.includes('--apply') ? 'APPLY' : 'DRY_RUN';
}

async function inspectJavascriptStarter(
  database: CleanupReader,
  mode: JavascriptStarterCleanupMode,
): Promise<JavascriptStarterCleanupResult> {
  const course = await database.course.findUnique({
    where: { slug: JAVASCRIPT_STARTER_SLUG },
    select: {
      id: true,
      title: true,
      status: true,
      _count: {
        select: {
          chapters: true,
          learningRecords: true,
          practiceAttempts: true,
          learningGoals: true,
        },
      },
    },
  });
  if (!course) {
    return {
      mode,
      found: false,
      courseId: null,
      courseTitle: null,
      courseStatus: null,
      chapters: 0,
      lessons: 0,
      contentBlocks: 0,
      quizzes: 0,
      questions: 0,
      options: 0,
      courseLearningRecords: 0,
      chapterLearningRecords: 0,
      learningGoals: 0,
      quizAttempts: 0,
      quizAnswers: 0,
      practiceAttempts: 0,
      practiceAnswers: 0,
      battleSnapshots: 0,
      battleEnabledQuestions: 0,
      archived: false,
    };
  }

  const chapterRecords = await database.courseChapter.findMany({
    where: { courseId: course.id },
    select: {
      id: true,
      status: true,
      _count: { select: { contentBlocks: true, learningRecords: true } },
    },
  });
  const chapterIds = chapterRecords.map(({ id }) => id);
  const quizRecords = await database.quiz.findMany({
    where: { chapterId: { in: chapterIds } },
    select: {
      id: true,
      status: true,
      _count: { select: { questions: true, attempts: true } },
    },
  });
  const quizIds = quizRecords.map(({ id }) => id);
  const questionRecords = await database.quizQuestion.findMany({
    where: { quizId: { in: quizIds } },
    select: {
      isBattleEnabled: true,
      knowledgeTags: true,
      _count: {
        select: {
          options: true,
          answers: true,
          practiceAnswers: true,
          battleQuestionSources: true,
        },
      },
    },
  });
  const sum = <T>(items: T[], value: (item: T) => number) =>
    items.reduce((total, item) => total + value(item), 0);
  const lessonKeys = new Set(
    questionRecords.flatMap((record) => {
      const tags = Array.isArray(record.knowledgeTags)
        ? record.knowledgeTags
        : [];
      const lessonTag = tags.find(
        (tag): tag is string =>
          typeof tag === 'string' && tag.startsWith('lesson:'),
      );
      return lessonTag ? [lessonTag.slice('lesson:'.length)] : [];
    }),
  );

  return {
    mode,
    found: true,
    courseId: course.id,
    courseTitle: course.title,
    courseStatus: course.status,
    chapters: chapterRecords.length,
    lessons: lessonKeys.size,
    contentBlocks: sum(chapterRecords, (record) => record._count.contentBlocks),
    quizzes: quizRecords.length,
    questions: questionRecords.length,
    options: sum(questionRecords, (record) => record._count.options),
    courseLearningRecords: course._count.learningRecords,
    chapterLearningRecords: sum(
      chapterRecords,
      (record) => record._count.learningRecords,
    ),
    learningGoals: course._count.learningGoals,
    quizAttempts: sum(quizRecords, (record) => record._count.attempts),
    quizAnswers: sum(questionRecords, (record) => record._count.answers),
    practiceAttempts: course._count.practiceAttempts,
    practiceAnswers: sum(
      questionRecords,
      (record) => record._count.practiceAnswers,
    ),
    battleSnapshots: sum(
      questionRecords,
      (record) => record._count.battleQuestionSources,
    ),
    battleEnabledQuestions: questionRecords.filter(
      (record) => record.isBattleEnabled,
    ).length,
    archived: false,
  };
}

export async function runJavascriptStarterCleanup(
  database: JavascriptStarterCleanupDatabase,
  mode: JavascriptStarterCleanupMode,
) {
  if (mode === 'DRY_RUN') {
    return inspectJavascriptStarter(database, mode);
  }

  return database.$transaction(async (tx) => {
    const before = await inspectJavascriptStarter(tx, mode);
    if (!before.found) return before;
    const course = await tx.course.findUnique({
      where: { slug: JAVASCRIPT_STARTER_SLUG },
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            chapters: true,
            learningRecords: true,
            practiceAttempts: true,
            learningGoals: true,
          },
        },
      },
    });
    if (!course)
      throw new Error('javascript-starter disappeared during cleanup.');
    const chapterRecords = await tx.courseChapter.findMany({
      where: { courseId: course.id },
      select: {
        id: true,
        status: true,
        _count: { select: { contentBlocks: true, learningRecords: true } },
      },
    });
    const chapterIds = chapterRecords.map(({ id }) => id);
    const quizRecords = await tx.quiz.findMany({
      where: { chapterId: { in: chapterIds } },
      select: {
        id: true,
        status: true,
        _count: { select: { questions: true, attempts: true } },
      },
    });
    const quizIds = quizRecords.map(({ id }) => id);

    await tx.quizQuestion.updateMany({
      where: { quizId: { in: quizIds }, isBattleEnabled: true },
      data: { isBattleEnabled: false },
    });
    await tx.quiz.updateMany({
      where: { id: { in: quizIds } },
      data: { status: 'DISABLED' },
    });
    await tx.courseChapter.updateMany({
      where: { id: { in: chapterIds } },
      data: { status: 'OFFLINE' },
    });
    await tx.course.update({
      where: { id: course.id },
      data: { status: 'OFFLINE' },
    });
    return { ...before, archived: true };
  }, TRANSACTION_OPTIONS);
}

export function formatJavascriptStarterCleanupResult(
  result: JavascriptStarterCleanupResult,
) {
  return [
    `Mode: ${result.mode}`,
    `Course slug: ${JAVASCRIPT_STARTER_SLUG}`,
    `Found: ${result.found}`,
    `Course: ${result.courseId ?? 'NOT_FOUND'} / ${result.courseTitle ?? 'NOT_FOUND'} / ${result.courseStatus ?? 'NOT_FOUND'}`,
    `Chapters / lessons / content blocks: ${result.chapters} / ${result.lessons} / ${result.contentBlocks}`,
    `Quizzes / questions / options: ${result.quizzes} / ${result.questions} / ${result.options}`,
    `Course / chapter learning records: ${result.courseLearningRecords} / ${result.chapterLearningRecords}`,
    `Learning goals: ${result.learningGoals}`,
    `Quiz attempts / answers: ${result.quizAttempts} / ${result.quizAnswers}`,
    `Practice attempts / answers: ${result.practiceAttempts} / ${result.practiceAnswers}`,
    `Battle snapshots: ${result.battleSnapshots}`,
    `Battle-enabled questions: ${result.battleEnabledQuestions}`,
    result.mode === 'DRY_RUN'
      ? 'No database writes performed.'
      : `Archived: ${result.archived}`,
  ].join('\n');
}

async function main() {
  const mode = parseJavascriptStarterCleanupMode(process.argv.slice(2));
  const prisma = new PrismaService();
  try {
    const result = await runJavascriptStarterCleanup(
      prisma as unknown as JavascriptStarterCleanupDatabase,
      mode,
    );
    console.log(formatJavascriptStarterCleanupResult(result));
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Cleanup failed.');
    process.exitCode = 1;
  });
}
