import 'dotenv/config';

import { createHash } from 'crypto';
import { PrismaService } from '../src/prisma/prisma.service';
import { LINUX_FUNDAMENTALS_COURSE } from '../prisma/seed-data/v1/linux-fundamentals';
import type {
  SeedChapter,
  SeedCourse,
  SeedLesson,
  SeedLessonBlock,
  SeedQuestion,
} from '../prisma/seed-data/types';
import {
  ChapterStatus,
  ContentBlockType,
  CourseStatus,
  QuestionType,
  QuizStatus,
} from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';

export const LINUX_FUNDAMENTALS_SLUG = 'linux-fundamentals';
const SEED_NAMESPACE = 'code-pioneer.seed-content';
const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 120_000 } as const;

type PublisherMode = 'DRY_RUN' | 'APPLY';

type SourceStats = {
  chapters: number;
  lessons: number;
  questions: number;
  battleQuestions: number;
  mediumBattleQuestions: number;
  hardBattleQuestions: number;
  codeFillQuestions: number;
};

type ProductionStats = SourceStats & {
  found: boolean;
  courseId: string | null;
  courseStatus: string | null;
  courseTitle: string | null;
  unchanged: number;
  needsUpdate: number;
};

export type CourseBaseline = {
  found: boolean;
  courseId: string | null;
  slug: string;
  title: string | null;
  status: string | null;
  chapters: number;
  publishedChapters: number;
  lessons: number;
  questions: number;
  battleQuestions: number;
};

type NormalizedBlock = {
  key: string;
  type: ContentBlockType;
  content: Record<string, unknown>;
};

type ExistingCourse = {
  id: string;
  slug: string;
  title: string;
  status: string;
  chapters: Array<{
    id: string;
    courseId: string;
    key?: string;
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
    findUnique(args: unknown): Promise<ExistingCourse | null>;
    findMany(args: unknown): Promise<ExistingCourse[]>;
  };
};

type PublisherTransaction = PublisherReader & {
  course: PublisherReader['course'] & {
    upsert(args: unknown): Promise<{ id: string }>;
  };
  courseChapter: {
    upsert(args: unknown): Promise<{ id: string }>;
  };
  chapterContentBlock: {
    upsert(args: unknown): Promise<{ id: string }>;
  };
  quiz: {
    upsert(args: unknown): Promise<{ id: string }>;
  };
  quizQuestion: {
    upsert(args: unknown): Promise<{ id: string }>;
  };
  quizOption: {
    upsert(args: unknown): Promise<{ id: string }>;
  };
};

export type LinuxPublisherDatabase = PublisherReader & {
  $transaction<T>(
    callback: (tx: PublisherTransaction) => Promise<T>,
    options?: typeof TRANSACTION_OPTIONS,
  ): Promise<T>;
};

export type PublishResult = {
  mode: PublisherMode;
  source: SourceStats;
  production: ProductionStats;
  courseBaseline: CourseBaseline[];
  transactionCommitted: boolean;
};

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

export function makeLinuxId(kind: string, key: string) {
  return stableUuid(`${SEED_NAMESPACE}:${kind}:${key}`);
}

export function parseLinuxPublisherMode(args: string[]): PublisherMode {
  const known = new Set(['--dry-run', '--apply']);
  const unknown = args.filter((argument) => !known.has(argument));
  if (unknown.length > 0) {
    throw new Error(`Unknown publisher argument: ${unknown.join(', ')}`);
  }
  if (args.includes('--dry-run') && args.includes('--apply')) {
    throw new Error('--dry-run and --apply cannot be used together.');
  }
  return args.includes('--apply') ? 'APPLY' : 'DRY_RUN';
}

const EXPECTED_CHAPTER_SLUGS = [
  'linux-fundamentals-chapter-01',
  'linux-fundamentals-chapter-02',
  'linux-fundamentals-chapter-03',
  'linux-fundamentals-chapter-04',
  'linux-fundamentals-chapter-05',
  'linux-fundamentals-chapter-06',
  'linux-fundamentals-chapter-07',
  'linux-fundamentals-chapter-08',
  'linux-fundamentals-chapter-09',
  'linux-fundamentals-chapter-10',
] as const;

export function validateLinuxSource(
  course: SeedCourse = LINUX_FUNDAMENTALS_COURSE,
) {
  if (course.slug !== LINUX_FUNDAMENTALS_SLUG) {
    throw new Error('Linux publisher source slug drifted.');
  }
  if (course.chapters.length !== 10) {
    throw new Error('Linux publisher requires exactly 10 chapters.');
  }
  if (
    !equalJson(
      course.chapters.map((chapter) => chapter.key),
      EXPECTED_CHAPTER_SLUGS,
    )
  ) {
    throw new Error('Linux publisher chapter identity drifted.');
  }
  const lessons = course.chapters.flatMap((chapter) => chapter.lessons);
  const questions = lessons.flatMap((lesson) => lesson.questions);
  if (new Set(lessons.map((lesson) => lesson.key)).size !== 60) {
    throw new Error('Linux publisher lesson identity drifted.');
  }
  if (new Set(questions.map((question) => question.key)).size !== 180) {
    throw new Error('Linux publisher question identity drifted.');
  }
  if (
    lessons.length !== 60 ||
    questions.length !== 180 ||
    questions.filter((question) => question.isBattleEnabled).length !== 120 ||
    questions.filter(
      (question) =>
        question.isBattleEnabled && question.difficulty === 'MEDIUM',
    ).length !== 60 ||
    questions.filter(
      (question) => question.isBattleEnabled && question.difficulty === 'HARD',
    ).length !== 60 ||
    questions.filter((question) => question.type === 'CODE_FILL').length !== 30
  ) {
    throw new Error('Linux publisher source statistics drifted.');
  }
}

export function getLinuxSourceStats(): SourceStats {
  validateLinuxSource();
  const lessons = LINUX_FUNDAMENTALS_COURSE.chapters.flatMap(
    (chapter) => chapter.lessons,
  );
  const questions = lessons.flatMap((lesson) => lesson.questions);
  const battleQuestions = questions.filter(
    (question) => question.isBattleEnabled,
  );
  return {
    chapters: LINUX_FUNDAMENTALS_COURSE.chapters.length,
    lessons: lessons.length,
    questions: questions.length,
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

function lessonHeadingBlock(lesson: SeedLesson): NormalizedBlock {
  return {
    key: `${lesson.key}:heading`,
    type: ContentBlockType.HEADING,
    content: { text: lesson.title, level: 2 },
  };
}

function lessonSummaryBlock(lesson: SeedLesson): NormalizedBlock {
  return {
    key: `${lesson.key}:summary`,
    type: ContentBlockType.TEXT,
    content: { text: lesson.summary },
  };
}

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
  return chapter.lessons.flatMap((lesson) => [
    lessonHeadingBlock(lesson),
    lessonSummaryBlock(lesson),
    ...lesson.blocks.map(normalizeLessonBlock),
  ]);
}

function questionAnswerNormalization(question: SeedQuestion) {
  if (question.type !== 'FILL_BLANK' && question.type !== 'CODE_FILL') {
    return Prisma.JsonNull;
  }
  return {
    trim: question.answerNormalization?.trim ?? true,
    normalizeLineEndings:
      question.answerNormalization?.normalizeLineEndings ?? true,
    caseSensitive:
      question.answerNormalization?.caseSensitive ??
      question.type === 'CODE_FILL',
    collapseWhitespace:
      question.answerNormalization?.collapseWhitespace ??
      question.type === 'FILL_BLANK',
  };
}

function questionExpected(
  course: SeedCourse,
  chapter: SeedChapter,
  lesson: SeedLesson,
  question: SeedQuestion,
  sortOrder: number,
) {
  const questionId = makeLinuxId(
    'question',
    `${course.slug}:${chapter.key}:${lesson.key}:${question.key}`,
  );
  const isTextAnswer =
    question.type === 'FILL_BLANK' || question.type === 'CODE_FILL';
  const isBattleQuestion = question.isBattleEnabled;
  const options =
    'options' in question
      ? question.options.map((option, index) => ({
          id: makeLinuxId(
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
    quizId: makeLinuxId('quiz', `${course.slug}:${chapter.key}`),
    type: question.type,
    content: question.title,
    explanation: question.explanation,
    score: question.score,
    sortOrder,
    battlePresentation: isBattleQuestion ? question.battlePresentation : null,
    battleDifficulty: question.difficulty,
    isBattleEnabled: isBattleQuestion,
    stemBlocks:
      'stemBlocks' in question
        ? (question.stemBlocks ?? Prisma.JsonNull)
        : Prisma.JsonNull,
    explanationBlocks:
      'explanationBlocks' in question
        ? (question.explanationBlocks ?? Prisma.JsonNull)
        : Prisma.JsonNull,
    acceptedAnswers: isTextAnswer ? question.acceptedAnswers : Prisma.JsonNull,
    answerNormalization: questionAnswerNormalization(question),
    caseSensitive: isTextAnswer
      ? (question.answerNormalization?.caseSensitive ??
        question.type === 'CODE_FILL')
      : true,
    knowledgeTags: [
      `course:${course.slug}`,
      `chapter:${chapter.key}`,
      `lesson:${lesson.key}`,
      ...(question.tags ?? []),
      `difficulty:${question.difficulty.toLowerCase()}`,
    ],
    programmingLanguage:
      question.type === 'SINGLE_CHOICE' || question.type === 'CODE_FILL'
        ? (question.programmingLanguage ?? null)
        : null,
    battleSkillCode: isBattleQuestion ? course.battleSkillCode : null,
    options,
  };
}

export function buildLinuxPublicationPlan() {
  const course = LINUX_FUNDAMENTALS_COURSE;
  return course.chapters.map((chapter) => {
    let questionSortOrder = 1;
    const questions = chapter.lessons.flatMap((lesson) =>
      lesson.questions.map((question) => {
        const result = questionExpected(
          course,
          chapter,
          lesson,
          question,
          questionSortOrder,
        );
        questionSortOrder += 1;
        return result;
      }),
    );
    return {
      chapter,
      chapterId: makeLinuxId('chapter', `${course.slug}:${chapter.key}`),
      contentBlocks: blocksForChapter(chapter).map((block, index) => ({
        ...block,
        id: makeLinuxId(
          'content-block',
          `${course.slug}:${chapter.key}:${block.key}`,
        ),
        chapterId: makeLinuxId('chapter', `${course.slug}:${chapter.key}`),
        sortOrder: index + 1,
      })),
      quiz: {
        id: makeLinuxId('quiz', `${course.slug}:${chapter.key}`),
        chapterId: makeLinuxId('chapter', `${course.slug}:${chapter.key}`),
        title: chapter.quizTitle,
        description: chapter.quizDescription,
        passScorePercent: chapter.passScorePercent,
        questions,
      },
    };
  });
}

function courseCreateData(course: SeedCourse, id: string) {
  return {
    id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    category: course.category,
    language: course.language,
    difficulty: course.difficulty,
    estimatedMinutes: course.estimatedMinutes,
    targetAudience: course.targetAudience,
    learningObjectives: course.learningObjectives,
    status: CourseStatus.PUBLISHED,
    sortOrder: course.sortOrder,
  };
}

function findProductionDiff(course: ExistingCourse | null): ProductionStats {
  const source = getLinuxSourceStats();
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
      courseTitle: null,
      unchanged: 0,
      needsUpdate: source.questions,
    };
  }

  const productionQuestions = course.chapters.flatMap(
    (chapter) => chapter.quiz?.questions ?? [],
  );
  const lessonKeys = new Set(
    productionQuestions.flatMap((question) => {
      const tags = Array.isArray(question.knowledgeTags)
        ? question.knowledgeTags
        : [];
      const tag = tags.find(
        (value): value is string =>
          typeof value === 'string' && value.startsWith('lesson:'),
      );
      return tag ? [tag.slice('lesson:'.length)] : [];
    }),
  );
  let unchanged = 0;
  const records = buildLinuxPublicationPlan();

  for (const sourceChapter of records) {
    const productionChapter = course.chapters.find(
      (candidate) => candidate.id === sourceChapter.chapterId,
    );
    if (!productionChapter) continue;
    const productionQuestionsById = new Map(
      productionChapter.quiz?.questions.map((question) => [
        question.id,
        question,
      ]) ?? [],
    );
    for (const sourceQuestion of sourceChapter.quiz.questions) {
      const productionQuestion = productionQuestionsById.get(sourceQuestion.id);
      if (
        productionQuestion &&
        productionQuestion.quizId === sourceQuestion.quizId &&
        productionQuestion.content === sourceQuestion.content &&
        productionQuestion.explanation === sourceQuestion.explanation &&
        productionQuestion.type === sourceQuestion.type &&
        productionQuestion.sortOrder === sourceQuestion.sortOrder &&
        productionQuestion.isBattleEnabled === sourceQuestion.isBattleEnabled &&
        productionQuestion.battleDifficulty ===
          sourceQuestion.battleDifficulty &&
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
          productionQuestion.knowledgeTags,
          sourceQuestion.knowledgeTags,
        ) &&
        productionQuestion.options.length === sourceQuestion.options.length
      ) {
        unchanged += 1;
      }
    }
  }

  return {
    chapters: course.chapters.length,
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
    courseTitle: course.title,
    unchanged,
    needsUpdate: source.questions - unchanged,
  };
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
        select: {
          id: true,
          chapterId: true,
          type: true,
          sortOrder: true,
          content: true,
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
    where: { slug: LINUX_FUNDAMENTALS_SLUG },
    select: COURSE_SELECT,
  });
}

const AUDITED_COURSE_SLUGS = [
  'python-basic',
  'data-structures-algorithms',
  LINUX_FUNDAMENTALS_SLUG,
] as const;

async function readCourseBaseline(
  database: PublisherReader,
): Promise<CourseBaseline[]> {
  const courses = await database.course.findMany({
    where: { slug: { in: AUDITED_COURSE_SLUGS } },
    select: COURSE_SELECT,
  });
  return AUDITED_COURSE_SLUGS.map((slug) => {
    const course = courses.find((candidate) => candidate.slug === slug);
    if (!course) {
      return {
        found: false,
        courseId: null,
        slug,
        title: null,
        status: null,
        chapters: 0,
        publishedChapters: 0,
        lessons: 0,
        questions: 0,
        battleQuestions: 0,
      };
    }
    const questions = course.chapters.flatMap(
      (chapter) => chapter.quiz?.questions ?? [],
    );
    const lessonKeys = new Set(
      questions.flatMap((question) => {
        const tags = Array.isArray(question.knowledgeTags)
          ? question.knowledgeTags
          : [];
        const lessonTag = tags.find(
          (tag): tag is string =>
            typeof tag === 'string' && tag.startsWith('lesson:'),
        );
        return lessonTag ? [lessonTag.slice('lesson:'.length)] : [];
      }),
    );
    return {
      found: true,
      courseId: course.id,
      slug,
      title: course.title,
      status: course.status,
      chapters: course.chapters.length,
      publishedChapters: course.chapters.filter(
        (chapter) => chapter.status === 'PUBLISHED',
      ).length,
      lessons: lessonKeys.size,
      questions: questions.length,
      battleQuestions: questions.filter((question) => question.isBattleEnabled)
        .length,
    };
  });
}

export async function runLinuxPublisher(
  database: LinuxPublisherDatabase,
  mode: PublisherMode,
): Promise<PublishResult> {
  validateLinuxSource();
  const source = getLinuxSourceStats();
  const courseBaseline = await readCourseBaseline(database);
  const current = await readProduction(database);
  const production = findProductionDiff(current);
  if (mode === 'DRY_RUN') {
    return {
      mode,
      source,
      production,
      courseBaseline,
      transactionCommitted: false,
    };
  }

  const committed = await database.$transaction(async (tx) => {
    const currentCourse = await readProduction(tx);
    const course = LINUX_FUNDAMENTALS_COURSE;
    const courseId = currentCourse?.id ?? makeLinuxId('course', course.slug);
    const courseRecord = await tx.course.upsert({
      where: { slug: LINUX_FUNDAMENTALS_SLUG },
      create: courseCreateData(course, courseId),
      update: {
        title: course.title,
        summary: course.summary,
        description: course.description,
        category: course.category,
        language: course.language,
        difficulty: course.difficulty,
        estimatedMinutes: course.estimatedMinutes,
        targetAudience: course.targetAudience,
        learningObjectives: course.learningObjectives,
        status: CourseStatus.PUBLISHED,
        sortOrder: course.sortOrder,
        deletedAt: null,
        publishedAt: new Date(),
      },
      select: { id: true },
    });

    for (const record of buildLinuxPublicationPlan()) {
      await tx.courseChapter.upsert({
        where: { id: record.chapterId },
        create: {
          id: record.chapterId,
          courseId: courseRecord.id,
          title: record.chapter.title,
          summary: record.chapter.summary,
          estimatedMinutes: record.chapter.estimatedMinutes,
          sortOrder: record.chapter.sortOrder,
          status: ChapterStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        update: {
          courseId: courseRecord.id,
          title: record.chapter.title,
          summary: record.chapter.summary,
          estimatedMinutes: record.chapter.estimatedMinutes,
          sortOrder: record.chapter.sortOrder,
          status: ChapterStatus.PUBLISHED,
          deletedAt: null,
          publishedAt: new Date(),
        },
      });
      for (const block of record.contentBlocks) {
        await tx.chapterContentBlock.upsert({
          where: { id: block.id },
          create: {
            id: block.id,
            chapterId: record.chapterId,
            type: block.type,
            sortOrder: block.sortOrder,
            content: block.content,
            isVisible: true,
          },
          update: {
            chapterId: record.chapterId,
            type: block.type,
            sortOrder: block.sortOrder,
            content: block.content,
            isVisible: true,
            deletedAt: null,
          },
        });
      }
      await tx.quiz.upsert({
        where: { chapterId: record.chapterId },
        create: {
          id: record.quiz.id,
          chapterId: record.chapterId,
          title: record.quiz.title,
          description: record.quiz.description,
          passScorePercent: record.quiz.passScorePercent,
          status: QuizStatus.PUBLISHED,
        },
        update: {
          title: record.quiz.title,
          description: record.quiz.description,
          passScorePercent: record.quiz.passScorePercent,
          status: QuizStatus.PUBLISHED,
        },
      });
      for (const question of record.quiz.questions) {
        await tx.quizQuestion.upsert({
          where: { id: question.id },
          create: {
            id: question.id,
            quizId: record.quiz.id,
            type: question.type,
            content: question.content,
            explanation: question.explanation,
            score: question.score,
            sortOrder: question.sortOrder,
            battlePresentation: question.battlePresentation,
            battleDifficulty: question.battleDifficulty,
            isBattleEnabled: question.isBattleEnabled,
            stemBlocks: question.stemBlocks,
            explanationBlocks: question.explanationBlocks,
            acceptedAnswers: question.acceptedAnswers,
            answerNormalization: question.answerNormalization,
            caseSensitive: question.caseSensitive,
            knowledgeTags: question.knowledgeTags,
            programmingLanguage: question.programmingLanguage,
            battleSkillCode: question.battleSkillCode,
          },
          update: {
            quizId: record.quiz.id,
            type: question.type,
            content: question.content,
            explanation: question.explanation,
            score: question.score,
            sortOrder: question.sortOrder,
            battlePresentation: question.battlePresentation,
            battleDifficulty: question.battleDifficulty,
            isBattleEnabled: question.isBattleEnabled,
            stemBlocks: question.stemBlocks,
            explanationBlocks: question.explanationBlocks,
            acceptedAnswers: question.acceptedAnswers,
            answerNormalization: question.answerNormalization,
            caseSensitive: question.caseSensitive,
            knowledgeTags: question.knowledgeTags,
            programmingLanguage: question.programmingLanguage,
            battleSkillCode: question.battleSkillCode,
          },
        });
        for (const option of question.options) {
          await tx.quizOption.upsert({
            where: { id: option.id },
            create: option,
            update: {
              questionId: option.questionId,
              content: option.content,
              isCorrect: option.isCorrect,
              sortOrder: option.sortOrder,
            },
          });
        }
      }
    }
    return { courseId: courseRecord.id };
  }, TRANSACTION_OPTIONS);

  return {
    mode,
    source,
    production: { ...production, courseId: committed.courseId },
    courseBaseline,
    transactionCommitted: true,
  };
}

export function formatLinuxPublisherResult(result: PublishResult) {
  const baseline = result.courseBaseline.map(
    (course) =>
      `Baseline ${course.slug}: ${course.courseId ?? 'NOT_FOUND'} / ${course.title ?? 'NOT_FOUND'} / ${course.status ?? 'NOT_FOUND'} / ${course.chapters} chapters (${course.publishedChapters} published) / ${course.lessons} lessons / ${course.questions} questions / ${course.battleQuestions} Battle`,
  );
  return [
    `Mode: ${result.mode}`,
    `Course slug: ${LINUX_FUNDAMENTALS_SLUG}`,
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
    ...baseline,
    result.mode === 'DRY_RUN'
      ? 'No database writes performed.'
      : 'Publisher apply completed.',
  ].join('\n');
}

async function main() {
  const mode = parseLinuxPublisherMode(process.argv.slice(2));
  const prisma = new PrismaService();
  try {
    await prisma.$connect();
    const result = await runLinuxPublisher(
      prisma as unknown as LinuxPublisherDatabase,
      mode,
    );
    console.log(formatLinuxPublisherResult(result));
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
