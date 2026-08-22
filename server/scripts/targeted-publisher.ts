import { createHash } from 'crypto';
import type { SeedCourse } from '../prisma/seed-data/types';

type TargetedPublisherTransaction = {
  course: { upsert(args: unknown): Promise<{ id: string }> };
  courseChapter: { upsert(args: unknown): Promise<unknown> };
  chapterContentBlock: { upsert(args: unknown): Promise<unknown> };
  quiz: { upsert(args: unknown): Promise<unknown> };
  quizQuestion: { upsert(args: unknown): Promise<unknown> };
  quizOption: { upsert(args: unknown): Promise<unknown> };
};

type TargetedPublicationPlan = ReadonlyArray<{
  chapter: {
    title: string;
    summary: string;
    estimatedMinutes: number;
    sortOrder: number;
  };
  chapterId: string;
  contentBlocks: ReadonlyArray<{
    id: string;
    chapterId: string;
    type: string;
    sortOrder: number;
    content: unknown;
  }>;
  quiz: {
    id: string;
    chapterId: string;
    title: string;
    description: string;
    passScorePercent: number;
    questions: ReadonlyArray<{
      id: string;
      quizId: string;
      type: string;
      content: string;
      explanation: string;
      score: number;
      sortOrder: number;
      battlePresentation: string | null;
      battleDifficulty: string;
      isBattleEnabled: boolean;
      stemBlocks: unknown;
      explanationBlocks: unknown;
      acceptedAnswers: unknown;
      answerNormalization: unknown;
      caseSensitive: boolean;
      knowledgeTags: ReadonlyArray<string>;
      programmingLanguage: string | null;
      battleSkillCode: string | null;
      options: ReadonlyArray<{
        id: string;
        questionId: string;
        content: string;
        isCorrect: boolean;
        sortOrder: number;
      }>;
    }>;
  };
}>;

export type TargetedPublisherMode = 'DRY_RUN' | 'APPLY';

const SEED_NAMESPACE = 'code-pioneer.seed-content';

export function stableTargetedPublisherId(
  kind: string,
  key: string,
  namespace = SEED_NAMESPACE,
) {
  const hash = createHash('sha1')
    .update(`${namespace}:${kind}:${key}`)
    .digest();
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

export function parseTargetedPublisherMode(
  args: string[],
): TargetedPublisherMode {
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

export function assertPublishableSeedCourse(course: SeedCourse) {
  if (course.status !== 'PUBLISHED') {
    throw new Error(
      `Targeted publisher requires a PUBLISHED source: ${course.slug}`,
    );
  }
  if (course.chapters.length === 0) {
    throw new Error(
      `Targeted publisher cannot publish an empty course: ${course.slug}`,
    );
  }
  for (const chapter of course.chapters) {
    if (chapter.lessons.length === 0) {
      throw new Error(
        `Targeted publisher cannot publish an empty chapter: ${course.slug}/${chapter.key}`,
      );
    }
  }
}

export async function publishTargetedCourseDefinitions(
  tx: TargetedPublisherTransaction,
  course: SeedCourse,
  courseId: string,
  records: TargetedPublicationPlan,
) {
  assertPublishableSeedCourse(course);
  if (records.length !== course.chapters.length) {
    throw new Error(
      `Targeted publisher plan does not match source chapters: ${course.slug}`,
    );
  }
  for (const record of records) {
    if (
      record.contentBlocks.length === 0 ||
      record.quiz.questions.length === 0
    ) {
      throw new Error(
        `Targeted publisher cannot publish an empty chapter plan: ${course.slug}/${record.chapterId}`,
      );
    }
  }
  const courseRecord = await tx.course.upsert({
    where: { slug: course.slug },
    create: {
      id: courseId,
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
      status: 'PUBLISHED',
      sortOrder: course.sortOrder,
    },
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
      status: 'PUBLISHED',
      sortOrder: course.sortOrder,
      deletedAt: null,
      publishedAt: new Date(),
    },
    select: { id: true },
  });

  for (const record of records) {
    await tx.courseChapter.upsert({
      where: { id: record.chapterId },
      create: {
        id: record.chapterId,
        courseId: courseRecord.id,
        title: record.chapter.title,
        summary: record.chapter.summary,
        estimatedMinutes: record.chapter.estimatedMinutes,
        sortOrder: record.chapter.sortOrder,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      update: {
        courseId: courseRecord.id,
        title: record.chapter.title,
        summary: record.chapter.summary,
        estimatedMinutes: record.chapter.estimatedMinutes,
        sortOrder: record.chapter.sortOrder,
        status: 'PUBLISHED',
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
        status: 'PUBLISHED',
      },
      update: {
        title: record.quiz.title,
        description: record.quiz.description,
        passScorePercent: record.quiz.passScorePercent,
        status: 'PUBLISHED',
      },
    });

    for (const question of record.quiz.questions) {
      const questionData = {
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
      };
      await tx.quizQuestion.upsert({
        where: { id: question.id },
        create: { id: question.id, ...questionData },
        update: questionData,
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

  return courseRecord;
}
