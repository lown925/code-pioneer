import 'dotenv/config';

import { createHash } from 'crypto';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  BATTLE_SKILL_SEEDS,
  VERSIONED_COURSE_SEEDS,
} from '../prisma/seed-data';
import type {
  SeedChapter,
  SeedCodeFillQuestion,
  SeedCourse,
  SeedFillBlankQuestion,
  SeedLesson,
  SeedLessonBlock,
  SeedQuestion,
  SeedSingleChoiceQuestion,
} from '../prisma/seed-data/types';
import { assertNoExactDuplicatesInCourse, auditCrossCourseExactDuplicates } from '../prisma/seed-data/content-quality';
import {
  BattleQuestionDifficulty,
  ChapterStatus,
  ContentBlockType,
  CourseStatus,
  QuestionType,
  QuizStatus,
} from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { DEFAULT_BATTLE_QUESTION_COUNT } from '../src/battle/battle.constants';

type ManagedQuestionSummary = {
  questionCount: number;
  battleEnabledCount: number;
};

type NormalizedLessonBlock = {
  key: string;
  type: ContentBlockType;
  content: Record<string, unknown>;
};

type CandidateQuestionRecord = {
  id: string;
  type: QuestionType;
  acceptedAnswers: unknown;
  battlePresentation: string | null;
  battleDifficulty: string | null;
  options: Array<{
    isCorrect: boolean;
  }>;
};

const SEED_NAMESPACE = 'code-pioneer.seed-content';
const CONTENT_SEED_VERSION_NAME = 'content-seed.version';
const SEED_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 120_000,
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

function lessonHeadingBlock(lesson: SeedLesson) {
  return {
    key: `${lesson.key}:heading`,
    type: ContentBlockType.HEADING,
    content: {
      text: lesson.title,
      level: 2,
    },
  } satisfies NormalizedLessonBlock;
}

function lessonSummaryBlock(lesson: SeedLesson) {
  return {
    key: `${lesson.key}:summary`,
    type: ContentBlockType.TEXT,
    content: {
      text: lesson.summary,
    },
  } satisfies NormalizedLessonBlock;
}

function normalizeLessonBlock(block: SeedLessonBlock) {
  switch (block.type) {
    case 'TEXT':
      return {
        key: block.key,
        type: ContentBlockType.TEXT,
        content: {
          text: block.text,
        },
      } satisfies NormalizedLessonBlock;
    case 'HEADING':
      return {
        key: block.key,
        type: ContentBlockType.HEADING,
        content: {
          text: block.text,
          level: block.level ?? 2,
        },
      } satisfies NormalizedLessonBlock;
    case 'CODE':
      return {
        key: block.key,
        type: ContentBlockType.CODE,
        content: {
          language: block.language,
          code: block.code,
          ...(block.caption ? { caption: block.caption } : {}),
        },
      } satisfies NormalizedLessonBlock;
    case 'TIP':
    case 'WARNING':
      return {
        key: block.key,
        type: block.type,
        content: {
          text: block.text,
          ...(block.title ? { title: block.title } : {}),
        },
      } satisfies NormalizedLessonBlock;
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
      } satisfies NormalizedLessonBlock;
  }
}

function buildLessonTags(
  course: SeedCourse,
  chapter: SeedChapter,
  lesson: SeedLesson,
) {
  return [
    `course:${course.slug}`,
    `chapter:${chapter.key}`,
    `lesson:${lesson.key}`,
  ];
}

function ensureUniqueKeys<T extends { key: string }>(
  items: T[],
  scope: string,
) {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.key)) {
      throw new Error(`Duplicate key "${item.key}" in ${scope}`);
    }
    seen.add(item.key);
  }
}

function validateQuestion(
  question: SeedQuestion,
  course: SeedCourse,
  chapter: SeedChapter,
  lesson: SeedLesson,
) {
  const questionRef = `${lesson.key}/${question.key}`;

  if (!question.title.trim()) {
    throw new Error(
      `Question ${questionRef} in ${course.slug}/${chapter.key} is missing title`,
    );
  }

  if (!question.explanation.trim()) {
    throw new Error(
      `Question ${questionRef} in ${course.slug}/${chapter.key} is missing explanation`,
    );
  }

  if (question.score <= 0) {
    throw new Error(
      `Question ${questionRef} in ${course.slug}/${chapter.key} must have positive score`,
    );
  }

  if (question.type === QuestionType.SINGLE_CHOICE) {
    if (question.options.length < 2) {
      throw new Error(
        `Question ${lesson.key}/${question.key} must contain at least two options`,
      );
    }

    const correctCount = question.options.filter(
      (option) => option.isCorrect,
    ).length;
    if (correctCount !== 1) {
      throw new Error(
        `Question ${lesson.key}/${question.key} must contain exactly one correct option`,
      );
    }

    if (question.isBattleEnabled && !question.battlePresentation) {
      throw new Error(
        `Battle-enabled question ${lesson.key}/${question.key} must define battlePresentation`,
      );
    }
    return;
  }

  if (question.type === QuestionType.TRUE_FALSE) {
    const correctCount = question.options.filter(
      (option) => option.isCorrect,
    ).length;
    if (question.options.length !== 2 || correctCount !== 1) {
      throw new Error(
        `TRUE_FALSE question ${lesson.key}/${question.key} must contain exactly two options and one correct option`,
      );
    }

    if (question.isBattleEnabled) {
      throw new Error(
        `TRUE_FALSE question ${questionRef} cannot be battle-enabled in current implementation`,
      );
    }
    return;
  }

  if (
    question.type === QuestionType.FILL_BLANK ||
    question.type === QuestionType.CODE_FILL
  ) {
    if (
      question.acceptedAnswers.length === 0 ||
      question.acceptedAnswers.some((answer) => !answer.trim())
    ) {
      throw new Error(
        `${question.type} question ${lesson.key}/${question.key} must declare non-empty acceptedAnswers`,
      );
    }

    if (question.type === QuestionType.FILL_BLANK && question.isBattleEnabled) {
      throw new Error(
        `FILL_BLANK question ${questionRef} cannot be battle-enabled`,
      );
    }
  }
}

function isTextAnswerQuestion(
  question: SeedQuestion,
): question is SeedFillBlankQuestion | SeedCodeFillQuestion {
  return (
    question.type === QuestionType.FILL_BLANK ||
    question.type === QuestionType.CODE_FILL
  );
}

function isSingleChoiceQuestion(question: SeedQuestion) {
  return question.type === QuestionType.SINGLE_CHOICE;
}

function hasQuestionBlocks(
  question: SeedQuestion,
): question is
  SeedSingleChoiceQuestion | SeedFillBlankQuestion | SeedCodeFillQuestion {
  return (
    question.type === QuestionType.SINGLE_CHOICE ||
    question.type === QuestionType.FILL_BLANK ||
    question.type === QuestionType.CODE_FILL
  );
}

function hasProgrammingLanguage(
  question: SeedQuestion,
): question is SeedSingleChoiceQuestion | SeedCodeFillQuestion {
  return (
    question.type === QuestionType.SINGLE_CHOICE ||
    question.type === QuestionType.CODE_FILL
  );
}

function getStemBlocks(question: SeedQuestion) {
  if (!hasQuestionBlocks(question) || !question.stemBlocks) {
    return Prisma.JsonNull;
  }

  return question.stemBlocks;
}

function getExplanationBlocks(question: SeedQuestion) {
  if (!hasQuestionBlocks(question) || !question.explanationBlocks) {
    return Prisma.JsonNull;
  }

  return question.explanationBlocks;
}

function getProgrammingLanguage(question: SeedQuestion) {
  return hasProgrammingLanguage(question)
    ? (question.programmingLanguage ?? null)
    : null;
}

function getAcceptedAnswers(question: SeedQuestion) {
  if (!isTextAnswerQuestion(question)) {
    return Prisma.JsonNull;
  }

  return question.acceptedAnswers;
}

function getAnswerNormalization(question: SeedQuestion) {
  if (!isTextAnswerQuestion(question)) {
    return Prisma.JsonNull;
  }

  return {
    trim: question.answerNormalization?.trim ?? true,
    normalizeLineEndings:
      question.answerNormalization?.normalizeLineEndings ?? true,
    caseSensitive:
      question.answerNormalization?.caseSensitive ??
      question.type === QuestionType.CODE_FILL,
    collapseWhitespace:
      question.answerNormalization?.collapseWhitespace ??
      question.type === QuestionType.FILL_BLANK,
  };
}

function getCaseSensitive(question: SeedQuestion) {
  if (!isTextAnswerQuestion(question)) {
    return true;
  }

  return (
    question.answerNormalization?.caseSensitive ??
    question.type === QuestionType.CODE_FILL
  );
}

function validateCourseSeed(course: SeedCourse) {
  assertNoExactDuplicatesInCourse(course);
  if (course.chapters.length === 0) {
    throw new Error(`${course.slug} must contain at least one chapter`);
  }

  ensureUniqueKeys(course.chapters, `course ${course.slug} chapters`);

  for (const chapter of course.chapters) {
    if (chapter.lessons.length === 0) {
      throw new Error(
        `Chapter ${course.slug}/${chapter.key} must contain at least one lesson`,
      );
    }

    ensureUniqueKeys(
      chapter.lessons,
      `chapter ${course.slug}/${chapter.key} lessons`,
    );

    for (const lesson of chapter.lessons) {
      if (lesson.questions.length === 0 || lesson.questions.length > 50) {
        throw new Error(
          `Lesson ${course.slug}/${chapter.key}/${lesson.key} must contain 1 to 50 questions`,
        );
      }

      ensureUniqueKeys(
        lesson.blocks,
        `lesson ${course.slug}/${chapter.key}/${lesson.key} blocks`,
      );
      ensureUniqueKeys(
        lesson.questions,
        `lesson ${course.slug}/${chapter.key}/${lesson.key} questions`,
      );

      for (const question of lesson.questions) {
        validateQuestion(question, course, chapter, lesson);
      }
    }
  }
}

async function upsertCourseSeed(prisma: PrismaService, course: SeedCourse) {
  return prisma.$transaction(async (tx) => {
    const courseRecord = await tx.course.upsert({
      where: {
        slug: course.slug,
      },
      create: {
        id: makeId('course', course.slug),
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
        status: CourseStatus.PUBLISHED,
        sortOrder: course.sortOrder,
        deletedAt: null,
        publishedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    let questionCount = 0;
    let battleEnabledCount = 0;

    if (course.retiredChapterIds?.length) {
      const retiredAt = new Date();

      await tx.quiz.updateMany({
        where: {
          chapterId: { in: course.retiredChapterIds },
          chapter: { courseId: courseRecord.id },
          status: { not: QuizStatus.DISABLED },
        },
        data: { status: QuizStatus.DISABLED },
      });

      await tx.courseChapter.updateMany({
        where: {
          id: { in: course.retiredChapterIds },
          courseId: courseRecord.id,
          OR: [{ status: { not: ChapterStatus.OFFLINE } }, { deletedAt: null }],
        },
        data: {
          status: ChapterStatus.OFFLINE,
          deletedAt: retiredAt,
        },
      });
    }

    for (const chapter of course.chapters) {
      const chapterId = makeId('chapter', `${course.slug}:${chapter.key}`);

      await tx.courseChapter.upsert({
        where: {
          id: chapterId,
        },
        create: {
          id: chapterId,
          courseId: courseRecord.id,
          title: chapter.title,
          summary: chapter.summary,
          estimatedMinutes: chapter.estimatedMinutes,
          sortOrder: chapter.sortOrder,
          status: ChapterStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        update: {
          courseId: courseRecord.id,
          title: chapter.title,
          summary: chapter.summary,
          estimatedMinutes: chapter.estimatedMinutes,
          sortOrder: chapter.sortOrder,
          status: ChapterStatus.PUBLISHED,
          deletedAt: null,
          publishedAt: new Date(),
        },
      });

      const normalizedBlocks = chapter.lessons.flatMap((lesson) => [
        lessonHeadingBlock(lesson),
        lessonSummaryBlock(lesson),
        ...lesson.blocks.map((block) => normalizeLessonBlock(block)),
      ]);

      for (
        let blockIndex = 0;
        blockIndex < normalizedBlocks.length;
        blockIndex += 1
      ) {
        const block = normalizedBlocks[blockIndex]!;
        const blockId = makeId(
          'content-block',
          `${course.slug}:${chapter.key}:${block.key}`,
        );

        await tx.chapterContentBlock.upsert({
          where: {
            id: blockId,
          },
          create: {
            id: blockId,
            chapterId,
            type: block.type,
            sortOrder: blockIndex + 1,
            content: block.content,
            isVisible: true,
          },
          update: {
            chapterId,
            type: block.type,
            sortOrder: blockIndex + 1,
            content: block.content,
            isVisible: true,
            deletedAt: null,
          },
        });
      }

      const quiz = await tx.quiz.upsert({
        where: {
          chapterId,
        },
        create: {
          id: makeId('quiz', `${course.slug}:${chapter.key}`),
          chapterId,
          title: chapter.quizTitle,
          description: chapter.quizDescription,
          passScorePercent: chapter.passScorePercent,
          status: QuizStatus.PUBLISHED,
        },
        update: {
          title: chapter.quizTitle,
          description: chapter.quizDescription,
          passScorePercent: chapter.passScorePercent,
          status: QuizStatus.PUBLISHED,
        },
        select: {
          id: true,
        },
      });

      let sortOrder = 1;
      for (const lesson of chapter.lessons) {
        const lessonTags = buildLessonTags(course, chapter, lesson);

        for (const question of lesson.questions) {
          const questionId = makeId(
            'question',
            `${course.slug}:${chapter.key}:${lesson.key}:${question.key}`,
          );

          const knowledgeTags = [
            ...lessonTags,
            ...(question.tags ?? []),
            `difficulty:${question.difficulty.toLowerCase()}`,
          ];

          await tx.quizQuestion.upsert({
            where: {
              id: questionId,
            },
            create: {
              id: questionId,
              quizId: quiz.id,
              type: question.type,
              content: question.title,
              explanation: question.explanation,
              score: question.score,
              sortOrder,
              battlePresentation:
                (isSingleChoiceQuestion(question) ||
                  question.type === QuestionType.CODE_FILL) &&
                question.isBattleEnabled
                  ? question.battlePresentation
                  : null,
              battleDifficulty: question.difficulty,
              isBattleEnabled: question.isBattleEnabled,
              stemBlocks: getStemBlocks(question),
              explanationBlocks: getExplanationBlocks(question),
              acceptedAnswers: getAcceptedAnswers(question),
              answerNormalization: getAnswerNormalization(question),
              caseSensitive: getCaseSensitive(question),
              knowledgeTags,
              programmingLanguage: getProgrammingLanguage(question),
              battleSkillCode: question.isBattleEnabled
                ? course.battleSkillCode
                : null,
            },
            update: {
              quizId: quiz.id,
              type: question.type,
              content: question.title,
              explanation: question.explanation,
              score: question.score,
              sortOrder,
              battlePresentation:
                (isSingleChoiceQuestion(question) ||
                  question.type === QuestionType.CODE_FILL) &&
                question.isBattleEnabled
                  ? question.battlePresentation
                  : null,
              battleDifficulty: question.difficulty,
              isBattleEnabled: question.isBattleEnabled,
              stemBlocks: getStemBlocks(question),
              explanationBlocks: getExplanationBlocks(question),
              acceptedAnswers: getAcceptedAnswers(question),
              answerNormalization: getAnswerNormalization(question),
              caseSensitive: getCaseSensitive(question),
              knowledgeTags,
              programmingLanguage: getProgrammingLanguage(question),
              battleSkillCode: question.isBattleEnabled
                ? course.battleSkillCode
                : null,
            },
          });

          if ('options' in question) {
            for (
              let optionIndex = 0;
              optionIndex < question.options.length;
              optionIndex += 1
            ) {
              const item = question.options[optionIndex]!;
              const optionId = makeId(
                'option',
                `${course.slug}:${chapter.key}:${lesson.key}:${question.key}:${item.key}`,
              );

              await tx.quizOption.upsert({
                where: {
                  id: optionId,
                },
                create: {
                  id: optionId,
                  questionId,
                  content: item.content,
                  isCorrect: item.isCorrect,
                  sortOrder: optionIndex + 1,
                },
                update: {
                  questionId,
                  content: item.content,
                  isCorrect: item.isCorrect,
                  sortOrder: optionIndex + 1,
                },
              });
            }
          } else {
            await tx.quizAnswer.updateMany({
              where: {
                questionId,
                selectedOptionId: { not: null },
              },
              data: { selectedOptionId: null },
            });
            await tx.practiceAnswer.updateMany({
              where: {
                questionId,
                selectedOptionId: { not: null },
              },
              data: { selectedOptionId: null },
            });
            await tx.quizOption.deleteMany({ where: { questionId } });
          }

          questionCount += 1;
          if (question.isBattleEnabled) {
            battleEnabledCount += 1;
          }
          sortOrder += 1;
        }
      }
    }

    await tx.systemHealth.upsert({
      where: {
        name: `content-seed.course.${course.slug}`,
      },
      create: {
        name: `content-seed.course.${course.slug}`,
        value: JSON.stringify({
          version: course.version,
          chapterCount: course.chapters.length,
          questionCount,
          battleEnabledCount,
        }),
      },
      update: {
        value: JSON.stringify({
          version: course.version,
          chapterCount: course.chapters.length,
          questionCount,
          battleEnabledCount,
        }),
      },
    });

    return {
      courseId: courseRecord.id,
      questionCount,
      battleEnabledCount,
    } satisfies ManagedQuestionSummary & { courseId: string };
  }, SEED_TRANSACTION_OPTIONS);
}

async function countBattleEligibleQuestions(prisma: PrismaService) {
  const records = (await prisma.quizQuestion.findMany({
    where: {
      isBattleEnabled: true,
      type: {
        in: [QuestionType.SINGLE_CHOICE, QuestionType.CODE_FILL],
      },
      quiz: {
        status: QuizStatus.PUBLISHED,
        chapter: {
          status: ChapterStatus.PUBLISHED,
          course: {
            status: CourseStatus.PUBLISHED,
            deletedAt: null,
          },
        },
      },
    },
    select: {
      id: true,
      type: true,
      acceptedAnswers: true,
      battlePresentation: true,
      battleDifficulty: true,
      options: {
        select: {
          isCorrect: true,
        },
      },
    },
  })) as CandidateQuestionRecord[];

  return records.filter((record) => {
    if (!record.battlePresentation || !record.battleDifficulty) {
      return false;
    }

    if (record.type === QuestionType.SINGLE_CHOICE) {
      const correctCount = record.options.filter(
        (option) => option.isCorrect,
      ).length;
      return record.options.length >= 2 && correctCount === 1;
    }

    if (record.type === QuestionType.CODE_FILL) {
      return (
        Array.isArray(record.acceptedAnswers) &&
        record.acceptedAnswers.some((item) => typeof item === 'string')
      );
    }

    return false;
  }).length;
}

async function upsertBattleSkills(prisma: PrismaService) {
  for (const skill of BATTLE_SKILL_SEEDS) {
    await prisma.battleSkill.upsert({
      where: { code: skill.code },
      create: skill,
      update: {
        name: skill.name,
        isEnabled: skill.isEnabled,
        sortOrder: skill.sortOrder,
      },
    });
  }
}

async function main() {
  for (const course of VERSIONED_COURSE_SEEDS) {
    validateCourseSeed(course);
  }
  const crossCourseDuplicates = auditCrossCourseExactDuplicates(VERSIONED_COURSE_SEEDS);
  if (crossCourseDuplicates.length > 0) {
    console.warn(`Cross-course exact duplicate groups: ${crossCourseDuplicates.length}`);
  }

  const prisma = new PrismaService();

  try {
    await prisma.$connect();
    await upsertBattleSkills(prisma);

    const importedCourses: Array<{
      slug: string;
      courseId: string;
      chapterCount: number;
      questionCount: number;
      battleEnabledCount: number;
    }> = [];

    for (const course of VERSIONED_COURSE_SEEDS) {
      const result = await upsertCourseSeed(prisma, course);
      importedCourses.push({
        slug: course.slug,
        courseId: result.courseId,
        chapterCount: course.chapters.length,
        questionCount: result.questionCount,
        battleEnabledCount: result.battleEnabledCount,
      });
    }

    await prisma.systemHealth.upsert({
      where: {
        name: CONTENT_SEED_VERSION_NAME,
      },
      create: {
        name: CONTENT_SEED_VERSION_NAME,
        value: JSON.stringify(
          VERSIONED_COURSE_SEEDS.map((course) => ({
            slug: course.slug,
            version: course.version,
          })),
        ),
      },
      update: {
        value: JSON.stringify(
          VERSIONED_COURSE_SEEDS.map((course) => ({
            slug: course.slug,
            version: course.version,
          })),
        ),
      },
    });

    const battleEligibleCount = await countBattleEligibleQuestions(prisma);
    if (battleEligibleCount < DEFAULT_BATTLE_QUESTION_COUNT) {
      throw new Error(
        `Battle eligible question count is ${battleEligibleCount}, which is lower than required ${DEFAULT_BATTLE_QUESTION_COUNT}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          importedCourses,
          battleEligibleCount,
          requiredBattleQuestionCount: DEFAULT_BATTLE_QUESTION_COUNT,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`seed-content failed: ${message}`);
  process.exitCode = 1;
});
