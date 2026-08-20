import { existsSync, readFileSync } from 'fs';
import { basename, resolve } from 'path';
import {
  BATTLE_SKILL_SEEDS,
  VERSIONED_COURSE_SEEDS,
} from '../prisma/seed-data';
import {
  FORMAL_COURSE_PLAN,
  PUBLISHED_FORMAL_COURSE_SLUGS,
} from '../prisma/seed-data/formal-course-plan';
import { resolveSeedDocumentPath } from '../prisma/seed-data/content-source';

const PYTHON_CHAPTER_FILES = [
  'python-basic-chapter-01.md',
  'python-basic-chapter-02.md',
  'python-basic-chapter-03.md',
  'python-basic-chapter-04.md',
  'python-basic-chapter-05.md',
  'python-basic-chapter-06-full.md',
  'python-basic-chapter-07.md',
  'python-basic-chapter-08.md',
  'python-basic-chapter-09-full.md',
  'python-basic-chapter-10.md',
  'python-basic-chapter-11.md',
  'python-basic-chapter-12-formal.md',
  'python-basic-chapter-13-formal.md',
  'python-basic-chapter-14-formal.md',
  'python-basic-chapter-15-regenerated.md',
] as const;

const DATA_STRUCTURES_CHAPTER_FILES = Array.from(
  { length: 12 },
  (_, index) =>
    `data-structures-algorithms-chapter-${String(index + 1).padStart(2, '0')}.md`,
);

const BATTLE_PRESENTATIONS = new Set([
  'TEXT_CHOICE',
  'CODE_READING',
  'CODE_PURPOSE',
  'OUTPUT_PREDICTION',
  'BUG_FIX',
  'CODE_COMPLETION_CHOICE',
  'CODE_SNIPPET_CHOICE',
  'INPUT_CODE_FILL',
]);

function countQuestions(courseSlug: string) {
  const course = VERSIONED_COURSE_SEEDS.find(
    (candidate) => candidate.slug === courseSlug,
  );
  if (!course) {
    throw new Error(`Missing seed course: ${courseSlug}`);
  }

  const questions = course.chapters.flatMap((chapter) =>
    chapter.lessons.flatMap((lesson) => lesson.questions),
  );

  return {
    course,
    questions,
    battleQuestions: questions.filter((question) => question.isBattleEnabled),
  };
}

function findQuestion(courseSlug: string, questionKey: string) {
  const { questions } = countQuestions(courseSlug);
  const question = questions.find((candidate) => candidate.key === questionKey);

  if (!question) {
    throw new Error(`Missing seed question: ${questionKey}`);
  }

  return question;
}

describe('seed content parser', () => {
  it('resolves every Python chapter document from the repository docs', () => {
    for (const fileName of PYTHON_CHAPTER_FILES) {
      const documentPath = resolveSeedDocumentPath(fileName);

      expect(existsSync(documentPath)).toBe(true);
      expect(basename(documentPath)).toBe(fileName);
      expect(documentPath.replaceAll('\\', '/')).toContain(
        `/docs/python-chapter/${fileName}`,
      );
    }
  });

  it('loads the complete Python seed contract', () => {
    const { course, questions, battleQuestions } =
      countQuestions('python-basic');
    const eligibleBattleQuestions = battleQuestions.filter(
      (question) =>
        question.difficulty === 'MEDIUM' || question.difficulty === 'HARD',
    );

    expect(course.chapters).toHaveLength(15);
    expect(course.chapters.map((chapter) => chapter.sortOrder)).toEqual(
      Array.from({ length: 15 }, (_, index) => index + 1),
    );
    expect(
      course.chapters.every(
        (chapter) =>
          chapter.lessons.length > 0 &&
          chapter.lessons.every(
            (lesson) => lesson.blocks.length > 0 && lesson.questions.length > 0,
          ),
      ),
    ).toBe(true);
    expect(questions).toHaveLength(270);
    expect(battleQuestions).toHaveLength(190);
    expect(eligibleBattleQuestions.length).toBeGreaterThanOrEqual(20);
    expect(course.battleSkillCode).toBe('PYTHON');
  });

  it('keeps the question prompt before code in parsed Python Battle stems', () => {
    const outputQuestion = findQuestion('python-basic', 'string-length-output');
    const sqrtQuestion = findQuestion(
      'python-basic',
      'calculate-square-root-with-math',
    );

    expect(outputQuestion.stemBlocks).toEqual([
      { type: 'TEXT', text: '下面程序会输出什么？' },
      {
        type: 'CODE',
        language: 'python',
        code: 'text = "Python"\nprint(len(text))',
      },
    ]);
    expect(sqrtQuestion.stemBlocks).toEqual([
      {
        type: 'TEXT',
        text: '程序已经导入 math 模块。请补全代码，计算 81 的平方根。',
      },
      {
        type: 'CODE',
        language: 'python',
        code: 'import math\n\nresult = __________________\nprint(result)',
      },
    ]);
  });

  it('requires every CODE_FILL question to expose a visible blank and code context', () => {
    const { questions } = countQuestions('python-basic');
    const codeFillQuestions = questions.filter(
      (question) => question.type === 'CODE_FILL',
    );

    expect(codeFillQuestions.length).toBeGreaterThan(0);
    expect(
      codeFillQuestions.every(
        (question) =>
          question.stemBlocks?.some(
            (block) =>
              block.type === 'CODE' &&
              block.code.trim().length > 0 &&
              block.code.includes('____'),
          ) === true && question.acceptedAnswers.length > 0,
      ),
    ).toBe(true);
  });

  it('keeps the BattleSkill seed contract without publishing the test course', () => {
    expect(VERSIONED_COURSE_SEEDS.map((course) => course.slug)).toEqual([
      'python-basic',
      'data-structures-algorithms',
    ]);
    expect(VERSIONED_COURSE_SEEDS.map((course) => course.slug)).not.toContain(
      'javascript-starter',
    );
    expect(
      existsSync(
        resolve(__dirname, '../prisma/seed-data/v1/javascript-starter.ts'),
      ),
    ).toBe(false);
    expect(BATTLE_SKILL_SEEDS).toEqual([
      expect.objectContaining({ code: 'PYTHON', isEnabled: true }),
      expect.objectContaining({ code: 'JAVASCRIPT', isEnabled: false }),
    ]);
  });

  it('loads the data structures and algorithms chapter contract', () => {
    const { course, questions, battleQuestions } = countQuestions(
      'data-structures-algorithms',
    );
    const mediumBattleQuestions = battleQuestions.filter(
      (question) => question.difficulty === 'MEDIUM',
    );
    const hardBattleQuestions = battleQuestions.filter(
      (question) => question.difficulty === 'HARD',
    );
    const codeFillQuestions = questions.filter(
      (question) => question.type === 'CODE_FILL',
    );

    expect(course.chapters).toHaveLength(12);
    expect(course.chapters.map((chapter) => chapter.sortOrder)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
    expect(
      course.chapters.every((chapter) => chapter.lessons.length === 6),
    ).toBe(true);
    expect(questions).toHaveLength(216);
    expect(battleQuestions).toHaveLength(144);
    expect(mediumBattleQuestions).toHaveLength(72);
    expect(hardBattleQuestions).toHaveLength(72);
    expect(codeFillQuestions).toHaveLength(36);
    expect(
      new Set(
        course.chapters.flatMap((chapter) =>
          chapter.lessons.map((lesson) => lesson.key),
        ),
      ).size,
    ).toBe(72);
    expect(new Set(questions.map((question) => question.key)).size).toBe(216);
    expect(
      codeFillQuestions.every(
        (question) =>
          question.acceptedAnswers.length > 0 &&
          question.stemBlocks?.some(
            (block) => block.type === 'CODE' && block.code.includes('____'),
          ) === true,
      ),
    ).toBe(true);
    expect(
      questions.every(
        (question) =>
          question.explanation.trim().length > 0 &&
          (!question.isBattleEnabled ||
            ((question.type === 'SINGLE_CHOICE' ||
              question.type === 'CODE_FILL') &&
              (question.difficulty === 'MEDIUM' ||
                question.difficulty === 'HARD'))),
      ),
    ).toBe(true);
    expect(
      questions
        .filter((question) => question.type === 'SINGLE_CHOICE')
        .every(
          (question) =>
            question.options.filter((option) => option.isCorrect).length === 1,
        ),
    ).toBe(true);
    expect(course.battleSkillCode).toBe('PYTHON');
  });

  it('enforces every data structures chapter content gate', () => {
    const { course } = countQuestions('data-structures-algorithms');

    course.chapters.forEach((chapter, index) => {
      const questions = chapter.lessons.flatMap((lesson) => lesson.questions);
      const battleQuestions = questions.filter(
        (question) => question.isBattleEnabled,
      );
      const sourcePath = resolveSeedDocumentPath(
        DATA_STRUCTURES_CHAPTER_FILES[index]!,
        ['docs', 'data-structures-algorithms-chapter'],
      );
      const source = readFileSync(sourcePath, 'utf8');
      const sourceQuestionNumbers = [
        ...source.matchAll(/^#### 题目 (\d+)$/gm),
      ].map((match) => Number(match[1]));

      expect(chapter.lessons).toHaveLength(6);
      expect(questions).toHaveLength(18);
      expect(battleQuestions).toHaveLength(12);
      expect(
        battleQuestions.filter((question) => question.difficulty === 'MEDIUM'),
      ).toHaveLength(6);
      expect(
        battleQuestions.filter((question) => question.difficulty === 'HARD'),
      ).toHaveLength(6);
      expect(
        questions.filter((question) => question.type === 'CODE_FILL'),
      ).toHaveLength(3);
      expect(sourceQuestionNumbers).toEqual(
        Array.from({ length: 18 }, (_, questionIndex) => questionIndex + 1),
      );
      expect(new Set(chapter.lessons.map((lesson) => lesson.key)).size).toBe(6);
      expect(new Set(questions.map((question) => question.key)).size).toBe(18);

      for (const question of questions) {
        expect(question.explanation.trim().length).toBeGreaterThan(0);
        if (question.type === 'SINGLE_CHOICE') {
          expect(
            question.options.filter((option) => option.isCorrect),
          ).toHaveLength(1);
        }
        if (question.type === 'CODE_FILL') {
          expect(question.acceptedAnswers.length).toBeGreaterThan(0);
          expect(
            question.stemBlocks?.some(
              (block) => block.type === 'CODE' && block.code.includes('____'),
            ),
          ).toBe(true);
          expect(
            question.explanationBlocks?.some(
              (block) => block.type === 'CODE' && block.code.trim().length > 0,
            ),
          ).toBe(true);
        }
        if (question.isBattleEnabled) {
          expect(['SINGLE_CHOICE', 'CODE_FILL']).toContain(question.type);
          expect(['MEDIUM', 'HARD']).toContain(question.difficulty);
          expect(BATTLE_PRESENTATIONS.has(question.battlePresentation)).toBe(
            true,
          );
        }
      }
    });
  });

  it('keeps exactly ten formal plans while publishing only completed sources', () => {
    expect(FORMAL_COURSE_PLAN).toHaveLength(10);
    expect(FORMAL_COURSE_PLAN.map((course) => course.order)).toEqual(
      Array.from({ length: 10 }, (_, index) => index + 1),
    );
    expect(new Set(FORMAL_COURSE_PLAN.map((course) => course.slug)).size).toBe(
      10,
    );
    expect(PUBLISHED_FORMAL_COURSE_SLUGS).toEqual([
      'python-basic',
      'data-structures-algorithms',
    ]);
    expect(VERSIONED_COURSE_SEEDS.map((course) => course.slug)).toEqual(
      PUBLISHED_FORMAL_COURSE_SLUGS,
    );

    for (const course of FORMAL_COURSE_PLAN) {
      expect(course.chapters.length).toBeGreaterThan(0);
      expect(course.chapters.map((chapter) => chapter.number)).toEqual(
        Array.from({ length: course.chapters.length }, (_, index) => index + 1),
      );
      expect(new Set(course.chapters.map((chapter) => chapter.slug)).size).toBe(
        course.chapters.length,
      );
      expect(
        course.chapters.every((chapter) => chapter.title.trim().length > 0),
      ).toBe(true);
      if (!course.publishedSeed) {
        expect(
          VERSIONED_COURSE_SEEDS.some((seed) => seed.slug === course.slug),
        ).toBe(false);
      } else {
        const seed = VERSIONED_COURSE_SEEDS.find(
          (candidate) => candidate.slug === course.slug,
        );
        expect(seed?.chapters.map((chapter) => chapter.key)).toEqual(
          course.chapters.map((chapter) => chapter.slug),
        );
      }
    }
  });
});
