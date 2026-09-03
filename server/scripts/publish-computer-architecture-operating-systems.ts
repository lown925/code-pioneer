import 'dotenv/config';

import { PrismaService } from '../src/prisma/prisma.service';
import { ContentBlockType } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE } from '../prisma/seed-data/v1/computer-architecture-operating-systems';
import type {
  SeedChapter,
  SeedCourse,
  SeedLesson,
  SeedLessonBlock,
  SeedQuestion,
} from '../prisma/seed-data/types';
import {
  assertNoExactDuplicatesInCourse,
  auditCrossCourseExactDuplicates,
} from '../prisma/seed-data/content-quality';
import { VERSIONED_COURSE_SEEDS } from '../prisma/seed-data';
import {
  assertPublishableSeedCourse,
  parseTargetedPublisherMode,
  publishTargetedCourseDefinitions,
  stableTargetedPublisherId,
  type TargetedPublisherMode,
} from './targeted-publisher';

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_SLUG =
  'computer-architecture-operating-systems';
const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 120_000 } as const;
const EXPECTED_CHAPTER_KEYS = Array.from(
  { length: 10 },
  (_, index) =>
    `${COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_SLUG}-chapter-${String(index + 1).padStart(2, '0')}`,
);

export type ComputerArchitectureSourceStats = {
  chapters: number;
  lessons: number;
  questions: number;
  battleQuestions: number;
  mediumBattleQuestions: number;
  hardBattleQuestions: number;
  codeFillQuestions: number;
};

type ProductionCourse = {
  id: string;
  slug: string;
  title: string;
  status: string;
  chapters: Array<{
    id: string;
    courseId: string;
    title: string;
    summary: string | null;
    estimatedMinutes: number;
    sortOrder: number;
    status: string;
    contentBlocks: Array<{
      id: string;
      chapterId: string;
      type: string;
      sortOrder: number;
      content: unknown;
      isVisible: boolean;
      deletedAt: Date | null;
    }>;
    quiz: {
      id: string;
      chapterId: string;
      title: string;
      description: string | null;
      passScorePercent: number;
      status: string;
      questions: Array<{
        id: string;
        quizId: string;
        type: string;
        content: string;
        explanation: string | null;
        score: number;
        sortOrder: number;
        battlePresentation: string | null;
        isBattleEnabled: boolean;
        battleDifficulty: string | null;
        stemBlocks: unknown;
        explanationBlocks: unknown;
        acceptedAnswers: unknown;
        answerNormalization: unknown;
        caseSensitive: boolean;
        knowledgeTags: unknown;
        programmingLanguage: string | null;
        battleSkillCode: string | null;
        options: Array<{
          id: string;
          questionId: string;
          content: string;
          isCorrect: boolean;
          sortOrder: number;
        }>;
      }>;
    } | null;
  }>;
};

type PublisherReader = {
  course: {
    findUnique(args: unknown): Promise<ProductionCourse | null>;
    findMany(args: unknown): Promise<ProductionCourse[]>;
  };
};

type PublisherTransaction = PublisherReader & {
  course: PublisherReader['course'] & {
    upsert(args: unknown): Promise<{ id: string }>;
  };
  courseChapter: { upsert(args: unknown): Promise<unknown> };
  chapterContentBlock: { upsert(args: unknown): Promise<unknown> };
  quiz: { upsert(args: unknown): Promise<unknown> };
  quizQuestion: { upsert(args: unknown): Promise<unknown> };
  quizOption: { upsert(args: unknown): Promise<unknown> };
};

export type ComputerArchitecturePublisherDatabase = PublisherReader & {
  $transaction<T>(
    callback: (tx: PublisherTransaction) => Promise<T>,
    options?: typeof TRANSACTION_OPTIONS,
  ): Promise<T>;
};

export type ComputerArchitecturePublisherResult = {
  mode: TargetedPublisherMode;
  source: ComputerArchitectureSourceStats;
  production: ComputerArchitectureSourceStats & {
    found: boolean;
    courseId: string | null;
    courseStatus: string | null;
    unchanged: number;
    needsUpdate: number;
  };
  transactionCommitted: boolean;
};

export function makeComputerArchitectureOperatingSystemsId(
  kind: string,
  key: string,
) {
  return stableTargetedPublisherId(kind, key);
}

export function parseComputerArchitectureOperatingSystemsPublisherMode(
  args: string[],
) {
  return parseTargetedPublisherMode(args);
}

function normalizedJson(value: unknown): unknown {
  if (value === Prisma.JsonNull || value === Prisma.DbNull) return null;
  if (Array.isArray(value)) return value.map(normalizedJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizedJson(item)]),
    );
  }
  return value;
}

function equalJson(left: unknown, right: unknown) {
  return (
    JSON.stringify(normalizedJson(left)) ===
    JSON.stringify(normalizedJson(right))
  );
}

function allQuestions(course: SeedCourse) {
  return course.chapters.flatMap((chapter) =>
    chapter.lessons.flatMap((lesson) => lesson.questions),
  );
}

export function validateComputerArchitectureOperatingSystemsSource(
  course: SeedCourse = COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE,
) {
  assertPublishableSeedCourse(course);
  if (course.slug !== COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_SLUG) {
    throw new Error('Computer architecture publisher source slug drifted.');
  }
  if (
    !equalJson(
      course.chapters.map((chapter) => chapter.key),
      EXPECTED_CHAPTER_KEYS,
    )
  ) {
    throw new Error(
      'Computer architecture publisher chapter identity drifted.',
    );
  }
  const lessons = course.chapters.flatMap((chapter) => chapter.lessons);
  const questions = allQuestions(course);
  const battleQuestions = questions.filter(
    (question) => question.isBattleEnabled,
  );
  if (
    lessons.length !== 60 ||
    questions.length !== 180 ||
    battleQuestions.length !== 120 ||
    battleQuestions.filter((question) => question.difficulty === 'MEDIUM')
      .length !== 60 ||
    battleQuestions.filter((question) => question.difficulty === 'HARD')
      .length !== 60 ||
    questions.filter((question) => question.type === 'CODE_FILL').length !==
      30 ||
    new Set(lessons.map((lesson) => lesson.key)).size !== 60 ||
    new Set(questions.map((question) => question.key)).size !== 180
  ) {
    throw new Error(
      'Computer architecture publisher source statistics drifted.',
    );
  }
  for (const chapter of course.chapters) {
    const chapterQuestions = chapter.lessons.flatMap(
      (lesson) => lesson.questions,
    );
    if (
      chapter.lessons.length !== 6 ||
      chapterQuestions.length !== 18 ||
      chapterQuestions.filter((question) => question.isBattleEnabled).length !==
        12 ||
      chapterQuestions.filter(
        (question) =>
          question.isBattleEnabled && question.difficulty === 'MEDIUM',
      ).length !== 6 ||
      chapterQuestions.filter(
        (question) =>
          question.isBattleEnabled && question.difficulty === 'HARD',
      ).length !== 6 ||
      chapterQuestions.filter((question) => question.type === 'CODE_FILL')
        .length !== 3
    ) {
      throw new Error(
        `Computer architecture chapter quality drifted: ${chapter.key}`,
      );
    }
    for (const question of chapterQuestions) {
      if (!question.explanation.trim()) {
        throw new Error(`Question explanation is empty: ${question.key}`);
      }
      if (question.type === 'CODE_FILL') {
        const codeStem = question.stemBlocks?.find(
          (block) => block.type === 'CODE',
        );
        const standardCode = question.explanationBlocks?.find(
          (block) => block.type === 'CODE',
        );
        if (
          question.acceptedAnswers.length === 0 ||
          !codeStem ||
          !codeStem.code.includes('____') ||
          !standardCode?.code.trim()
        ) {
          throw new Error(`CODE_FILL completeness drifted: ${question.key}`);
        }
      }
    }
  }
  assertNoExactDuplicatesInCourse(course);
  const duplicateGroups = auditCrossCourseExactDuplicates(
    VERSIONED_COURSE_SEEDS,
  );
  if (
    duplicateGroups.some((group) =>
      group.questions.some((question) => question.courseSlug === course.slug),
    )
  ) {
    throw new Error(
      'Computer architecture source has cross-course exact duplicates.',
    );
  }
}

export function getComputerArchitectureOperatingSystemsSourceStats(): ComputerArchitectureSourceStats {
  validateComputerArchitectureOperatingSystemsSource();
  const questions = allQuestions(
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE,
  );
  const battleQuestions = questions.filter(
    (question) => question.isBattleEnabled,
  );
  return {
    chapters: COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE.chapters.length,
    lessons: 60,
    questions: 180,
    battleQuestions: battleQuestions.length,
    mediumBattleQuestions: battleQuestions.filter(
      (question) => question.difficulty === 'MEDIUM',
    ).length,
    hardBattleQuestions: battleQuestions.filter(
      (question) => question.difficulty === 'HARD',
    ).length,
    codeFillQuestions: questions.filter(
      (question) => question.type === 'CODE_FILL',
    ).length,
  };
}

type NormalizedBlock = {
  key: string;
  type: ContentBlockType;
  content: Record<string, unknown>;
};

function normalizeLessonBlock(block: SeedLessonBlock): NormalizedBlock {
  switch (block.type) {
    case 'TEXT':
      return {
        key: block.key,
        type: ContentBlockType.TEXT,
        content: { text: block.text },
      };
    case 'HEADING':
      return {
        key: block.key,
        type: ContentBlockType.HEADING,
        content: { text: block.text, level: block.level ?? 2 },
      };
    case 'CODE':
      return {
        key: block.key,
        type: ContentBlockType.CODE,
        content: {
          language: block.language,
          code: block.code,
          ...(block.caption ? { caption: block.caption } : {}),
        },
      };
    case 'TIP':
    case 'WARNING':
      return {
        key: block.key,
        type: block.type,
        content: {
          text: block.text,
          ...(block.title ? { title: block.title } : {}),
        },
      };
    case 'EXAMPLE':
      return {
        key: block.key,
        type: ContentBlockType.EXAMPLE,
        content: {
          ...(block.title ? { title: block.title } : {}),
          ...(block.description ? { description: block.description } : {}),
          ...(block.text ? { text: block.text } : {}),
          ...(block.language ? { language: block.language } : {}),
          ...(block.code ? { code: block.code } : {}),
          ...(block.caption ? { caption: block.caption } : {}),
        },
      };
  }
}

function blocksForChapter(chapter: SeedChapter) {
  return [
    ...chapter.lessons.flatMap((lesson: SeedLesson) => [
    {
      key: `${lesson.key}:heading`,
      type: ContentBlockType.HEADING,
      content: { text: lesson.title, level: 2 },
    },
    {
      key: `${lesson.key}:summary`,
      type: ContentBlockType.TEXT,
      content: { text: lesson.summary },
    },
      ...lesson.blocks.map(normalizeLessonBlock),
    ]),
    ...(chapter.chapterBlocks ?? []).map(normalizeLessonBlock),
  ];
}

function questionExpected(
  course: SeedCourse,
  chapter: SeedChapter,
  lesson: SeedLesson,
  question: SeedQuestion,
  sortOrder: number,
) {
  const questionId = makeComputerArchitectureOperatingSystemsId(
    'question',
    `${course.slug}:${chapter.key}:${lesson.key}:${question.key}`,
  );
  const isTextAnswer =
    question.type === 'FILL_BLANK' || question.type === 'CODE_FILL';
  const options =
    'options' in question
      ? question.options.map((option, index) => ({
          id: makeComputerArchitectureOperatingSystemsId(
            'option',
            `${course.slug}:${chapter.key}:${lesson.key}:${question.key}:${option.key}`,
          ),
          questionId,
          content: option.content,
          isCorrect: option.isCorrect,
          sortOrder: index + 1,
        }))
      : [];
  return {
    id: questionId,
    quizId: makeComputerArchitectureOperatingSystemsId(
      'quiz',
      `${course.slug}:${chapter.key}`,
    ),
    type: question.type,
    content: question.title,
    explanation: question.explanation,
    score: question.score,
    sortOrder,
    battlePresentation: question.isBattleEnabled
      ? question.battlePresentation
      : null,
    battleDifficulty: question.difficulty,
    isBattleEnabled: question.isBattleEnabled,
    stemBlocks:
      'stemBlocks' in question
        ? (question.stemBlocks ?? Prisma.JsonNull)
        : Prisma.JsonNull,
    explanationBlocks:
      'explanationBlocks' in question
        ? (question.explanationBlocks ?? Prisma.JsonNull)
        : Prisma.JsonNull,
    acceptedAnswers: isTextAnswer ? question.acceptedAnswers : Prisma.JsonNull,
    answerNormalization: isTextAnswer
      ? (question.answerNormalization ?? {
          trim: true,
          normalizeLineEndings: true,
          caseSensitive: true,
        })
      : Prisma.JsonNull,
    caseSensitive: isTextAnswer
      ? (question.answerNormalization?.caseSensitive ?? true)
      : true,
    knowledgeTags: [
      `course:${course.slug}`,
      `chapter:${chapter.key}`,
      `lesson:${lesson.key}`,
      ...(question.tags ?? []),
      `difficulty:${question.difficulty.toLowerCase()}`,
    ],
    programmingLanguage:
      'programmingLanguage' in question
        ? (question.programmingLanguage ?? null)
        : null,
    battleSkillCode: question.isBattleEnabled ? course.battleSkillCode : null,
    options,
  };
}

export function buildComputerArchitectureOperatingSystemsPublicationPlan() {
  const course = COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE;
  return course.chapters.map((chapter) => {
    let questionSortOrder = 1;
    const questions = chapter.lessons.flatMap((lesson) =>
      lesson.questions.map((question) =>
        questionExpected(
          course,
          chapter,
          lesson,
          question,
          questionSortOrder++,
        ),
      ),
    );
    const chapterId = makeComputerArchitectureOperatingSystemsId(
      'chapter',
      `${course.slug}:${chapter.key}`,
    );
    return {
      chapter,
      chapterId,
      contentBlocks: blocksForChapter(chapter).map((block, index) => ({
        ...block,
        id: makeComputerArchitectureOperatingSystemsId(
          'content-block',
          `${course.slug}:${chapter.key}:${block.key}`,
        ),
        chapterId,
        sortOrder: index + 1,
      })),
      quiz: {
        id: makeComputerArchitectureOperatingSystemsId(
          'quiz',
          `${course.slug}:${chapter.key}`,
        ),
        chapterId,
        title: chapter.quizTitle,
        description: chapter.quizDescription,
        passScorePercent: chapter.passScorePercent,
        questions,
      },
    };
  });
}

const COURSE_SELECT = {
  id: true,
  slug: true,
  title: true,
  status: true,
  chapters: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      courseId: true,
      title: true,
      summary: true,
      estimatedMinutes: true,
      sortOrder: true,
      status: true,
      contentBlocks: {
        where: { isVisible: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          chapterId: true,
          type: true,
          sortOrder: true,
          content: true,
          isVisible: true,
          deletedAt: true,
        },
      },
      quiz: {
        select: {
          id: true,
          chapterId: true,
          title: true,
          description: true,
          passScorePercent: true,
          status: true,
          questions: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              quizId: true,
              type: true,
              content: true,
              explanation: true,
              score: true,
              sortOrder: true,
              battlePresentation: true,
              isBattleEnabled: true,
              battleDifficulty: true,
              stemBlocks: true,
              explanationBlocks: true,
              acceptedAnswers: true,
              answerNormalization: true,
              caseSensitive: true,
              knowledgeTags: true,
              programmingLanguage: true,
              battleSkillCode: true,
              options: {
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  questionId: true,
                  content: true,
                  isCorrect: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

async function readProduction(database: PublisherReader) {
  return database.course.findUnique({
    where: { slug: COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_SLUG },
    select: COURSE_SELECT,
  });
}

function findProductionDiff(
  course: ProductionCourse | null,
  source: ComputerArchitectureSourceStats,
) {
  const productionQuestions =
    course?.chapters.flatMap((chapter) => chapter.quiz?.questions ?? []) ?? [];
  if (!course) {
    return {
      chapters: 0,
      lessons: 0,
      questions: 0,
      battleQuestions: 0,
      mediumBattleQuestions: 0,
      hardBattleQuestions: 0,
      codeFillQuestions: 0,
      found: false,
      courseId: null,
      courseStatus: null,
      unchanged: 0,
      needsUpdate: source.questions,
    };
  }

  const lessonKeys = new Set(
    productionQuestions.flatMap((question) =>
      Array.isArray(question.knowledgeTags)
        ? question.knowledgeTags
            .filter(
              (tag): tag is string =>
                typeof tag === 'string' && tag.startsWith('lesson:'),
            )
            .map((tag) => tag.slice(7))
        : [],
    ),
  );
  let unchanged = 0;
  const records = buildComputerArchitectureOperatingSystemsPublicationPlan();

  for (const sourceChapter of records) {
    const productionChapter = course.chapters.find(
      (candidate) => candidate.id === sourceChapter.chapterId,
    );
    if (!productionChapter) continue;
    const activeProductionBlocks = productionChapter.contentBlocks.filter(
      (block) => block.isVisible === true && block.deletedAt === null,
    );
    const chapterDefinitionMatches =
      productionChapter.courseId === course.id &&
      productionChapter.title === sourceChapter.chapter.title &&
      productionChapter.summary === sourceChapter.chapter.summary &&
      productionChapter.estimatedMinutes ===
        sourceChapter.chapter.estimatedMinutes &&
      productionChapter.sortOrder === sourceChapter.chapter.sortOrder &&
      productionChapter.status === 'PUBLISHED' &&
      activeProductionBlocks.length ===
        sourceChapter.contentBlocks.length &&
      activeProductionBlocks.every((block, index) => {
        const sourceBlock = sourceChapter.contentBlocks[index];
        return (
          sourceBlock &&
          block.id === sourceBlock.id &&
          block.chapterId === sourceBlock.chapterId &&
          block.type === sourceBlock.type &&
          block.sortOrder === sourceBlock.sortOrder &&
          equalJson(block.content, sourceBlock.content)
        );
      });
    const productionQuiz = productionChapter.quiz;
    const quizDefinitionMatches =
      productionQuiz !== null &&
      productionQuiz.id === sourceChapter.quiz.id &&
      productionQuiz.chapterId === sourceChapter.quiz.chapterId &&
      productionQuiz.title === sourceChapter.quiz.title &&
      productionQuiz.description === sourceChapter.quiz.description &&
      productionQuiz.passScorePercent === sourceChapter.quiz.passScorePercent &&
      productionQuiz.status === 'PUBLISHED';
    if (!chapterDefinitionMatches || !quizDefinitionMatches) continue;
    const productionQuestionsById = new Map(
      productionQuiz.questions.map((question) => [question.id, question]),
    );
    for (const sourceQuestion of sourceChapter.quiz.questions) {
      const productionQuestion = productionQuestionsById.get(sourceQuestion.id);
      if (
        productionQuestion &&
        productionQuestion.quizId === sourceQuestion.quizId &&
        productionQuestion.type === sourceQuestion.type &&
        productionQuestion.content === sourceQuestion.content &&
        productionQuestion.explanation === sourceQuestion.explanation &&
        productionQuestion.score === sourceQuestion.score &&
        productionQuestion.sortOrder === sourceQuestion.sortOrder &&
        productionQuestion.battlePresentation ===
          sourceQuestion.battlePresentation &&
        productionQuestion.battleDifficulty ===
          sourceQuestion.battleDifficulty &&
        productionQuestion.isBattleEnabled === sourceQuestion.isBattleEnabled &&
        productionQuestion.caseSensitive === sourceQuestion.caseSensitive &&
        productionQuestion.programmingLanguage ===
          sourceQuestion.programmingLanguage &&
        productionQuestion.battleSkillCode === sourceQuestion.battleSkillCode &&
        equalJson(productionQuestion.stemBlocks, sourceQuestion.stemBlocks) &&
        equalJson(
          productionQuestion.explanationBlocks,
          sourceQuestion.explanationBlocks,
        ) &&
        equalJson(
          productionQuestion.acceptedAnswers,
          sourceQuestion.acceptedAnswers,
        ) &&
        equalJson(
          productionQuestion.answerNormalization,
          sourceQuestion.answerNormalization,
        ) &&
        equalJson(
          productionQuestion.knowledgeTags,
          sourceQuestion.knowledgeTags,
        ) &&
        equalJson(productionQuestion.options, sourceQuestion.options)
      ) {
        unchanged += 1;
      }
    }
  }

  return {
    chapters: course?.chapters.length ?? 0,
    lessons: lessonKeys.size,
    questions: productionQuestions.length,
    battleQuestions: productionQuestions.filter(
      (question) => question.isBattleEnabled,
    ).length,
    mediumBattleQuestions: productionQuestions.filter(
      (question) =>
        question.isBattleEnabled && question.battleDifficulty === 'MEDIUM',
    ).length,
    hardBattleQuestions: productionQuestions.filter(
      (question) =>
        question.isBattleEnabled && question.battleDifficulty === 'HARD',
    ).length,
    codeFillQuestions: productionQuestions.filter(
      (question) => question.type === 'CODE_FILL',
    ).length,
    found: true,
    courseId: course.id,
    courseStatus: course.status,
    unchanged,
    needsUpdate: source.questions - unchanged,
  };
}

export async function runComputerArchitectureOperatingSystemsPublisher(
  database: ComputerArchitecturePublisherDatabase,
  mode: TargetedPublisherMode,
): Promise<ComputerArchitecturePublisherResult> {
  validateComputerArchitectureOperatingSystemsSource();
  const source = getComputerArchitectureOperatingSystemsSourceStats();
  const current = await readProduction(database);
  const production = findProductionDiff(current, source);
  if (mode === 'DRY_RUN')
    return { mode, source, production, transactionCommitted: false };
  const committed = await database.$transaction(async (tx) => {
    const currentCourse = await readProduction(tx);
    const courseId =
      currentCourse?.id ??
      makeComputerArchitectureOperatingSystemsId(
        'course',
        COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE.slug,
      );
    const record = await publishTargetedCourseDefinitions(
      tx,
      COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE,
      courseId,
      buildComputerArchitectureOperatingSystemsPublicationPlan(),
    );
    return { courseId: record.id };
  }, TRANSACTION_OPTIONS);
  return {
    mode,
    source,
    production: { ...production, courseId: committed.courseId },
    transactionCommitted: true,
  };
}

export function formatComputerArchitectureOperatingSystemsPublisherResult(
  result: ComputerArchitecturePublisherResult,
) {
  return [
    `Mode: ${result.mode}`,
    `Course slug: ${COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_SLUG}`,
    `Source: ${result.source.chapters} chapters / ${result.source.lessons} lessons / ${result.source.questions} questions`,
    `Source Battle: ${result.source.battleQuestions} (${result.source.mediumBattleQuestions} MEDIUM / ${result.source.hardBattleQuestions} HARD)`,
    `Source CODE_FILL: ${result.source.codeFillQuestions}`,
    `Matched course: ${result.production.found}`,
    `Production course: ${result.production.courseId ?? 'NOT_FOUND'} / ${result.production.courseStatus ?? 'NOT_FOUND'}`,
    `Production counts: ${result.production.chapters} chapters / ${result.production.lessons} lessons / ${result.production.questions} questions`,
    `Production Battle: ${result.production.battleQuestions} (${result.production.mediumBattleQuestions} MEDIUM / ${result.production.hardBattleQuestions} HARD)`,
    `Production CODE_FILL: ${result.production.codeFillQuestions}`,
    `Unchanged: ${result.production.unchanged}`,
    `Needs update: ${result.production.needsUpdate}`,
    `Transaction committed: ${result.transactionCommitted}`,
    result.mode === 'DRY_RUN'
      ? 'No database writes performed.'
      : 'Publisher apply completed.',
  ].join('\n');
}

async function main() {
  const mode = parseComputerArchitectureOperatingSystemsPublisherMode(
    process.argv.slice(2),
  );
  const prisma = new PrismaService();
  try {
    await prisma.$connect();
    const result = await runComputerArchitectureOperatingSystemsPublisher(
      prisma as unknown as ComputerArchitecturePublisherDatabase,
      mode,
    );
    console.log(
      formatComputerArchitectureOperatingSystemsPublisherResult(result),
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Publisher failed.');
    process.exitCode = 1;
  });
}
