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
import {
  assertNoExactDuplicatesInCourse,
  auditCrossCourseExactDuplicates,
} from '../prisma/seed-data/content-quality';
import { LINUX_FUNDAMENTALS_COURSE } from '../prisma/seed-data/v1/linux-fundamentals';
import { DATABASE_SQL_FOUNDATIONS_COURSE } from '../prisma/seed-data/v1/database-sql-foundations';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE } from '../prisma/seed-data/v1/computer-architecture-operating-systems';
import { COMPUTER_NETWORKS_FUNDAMENTALS_COURSE } from '../prisma/seed-data/v1/computer-networks-fundamentals';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_COURSE } from '../prisma/seed-data/v1/java-object-oriented-programming';
import { SPARK_DATA_PROCESSING_COURSE } from '../prisma/seed-data/v1/spark-data-processing';
import {
  getComputerArchitectureOperatingSystemsSourceStats,
  validateComputerArchitectureOperatingSystemsSource,
} from '../scripts/publish-computer-architecture-operating-systems';
import type { SeedCourse } from '../prisma/seed-data/types';
import {
  assertPublishableSeedCourse,
  publishTargetedCourseDefinitions,
} from '../scripts/targeted-publisher';

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

const LINUX_CHAPTER_FILES = Array.from(
  { length: 10 },
  (_, index) =>
    `linux-fundamentals-chapter-${String(index + 1).padStart(2, '0')}.md`,
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

  it('maps the network course comprehensive judgment presentation', () => {
    const hardBattle =
      COMPUTER_NETWORKS_FUNDAMENTALS_COURSE.chapters[0]?.lessons[0]
        ?.questions[2];
    expect(hardBattle?.battlePresentation).toBe('CODE_READING');
  });

  it('maps the Java course engineering judgment presentation', () => {
    const hardBattle =
      JAVA_OBJECT_ORIENTED_PROGRAMMING_COURSE.chapters[0]?.lessons[0]
        ?.questions[2];
    expect(hardBattle?.battlePresentation).toBe('CODE_PURPOSE');
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

  it('keeps the BattleSkill seed contract and published course registry', () => {
    expect(VERSIONED_COURSE_SEEDS.map((course) => course.slug)).toEqual([
      'python-basic',
      'data-structures-algorithms',
      'linux-fundamentals',
      'database-sql-foundations',
      'computer-architecture-operating-systems',
      'computer-networks-fundamentals',
      'java-object-oriented-programming',
      'software-engineering-project-development',
      'big-data-fundamentals',
      'spark-data-processing',
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

  it('enforces the Linux source, identity, quality, and duplicate gates', () => {
    const { course, questions, battleQuestions } =
      countQuestions('linux-fundamentals');
    const lessonKeys = course.chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => lesson.key),
    );

    expect(course.chapters).toHaveLength(10);
    expect(course.chapters.map((chapter) => chapter.key)).toEqual(
      LINUX_CHAPTER_FILES.map((fileName) => fileName.replace('.md', '')),
    );
    expect(course.chapters.map((chapter) => chapter.sortOrder)).toEqual(
      Array.from({ length: 10 }, (_, index) => index + 1),
    );
    expect(lessonKeys).toHaveLength(60);
    expect(new Set(lessonKeys).size).toBe(60);
    expect(questions).toHaveLength(180);
    expect(new Set(questions.map((question) => question.key)).size).toBe(180);
    expect(battleQuestions).toHaveLength(120);
    expect(
      battleQuestions.filter((question) => question.difficulty === 'MEDIUM'),
    ).toHaveLength(60);
    expect(
      battleQuestions.filter((question) => question.difficulty === 'HARD'),
    ).toHaveLength(60);
    expect(
      questions.filter((question) => question.type === 'CODE_FILL'),
    ).toHaveLength(30);

    course.chapters.forEach((chapter, index) => {
      const chapterQuestions = chapter.lessons.flatMap(
        (lesson) => lesson.questions,
      );
      const chapterBattleQuestions = chapterQuestions.filter(
        (question) => question.isBattleEnabled,
      );
      const sourcePath = resolveSeedDocumentPath(LINUX_CHAPTER_FILES[index]!, [
        'docs',
        '开发文档',
        'linux-fundamentals-complete-10-chapters',
      ]);
      const sourceQuestionNumbers = [
        ...readFileSync(sourcePath, 'utf8').matchAll(/^#### 题目 (\d+)$/gm),
      ].map((match) => Number(match[1]));

      expect(chapter.lessons).toHaveLength(6);
      expect(chapterQuestions).toHaveLength(18);
      expect(chapterBattleQuestions).toHaveLength(12);
      expect(
        chapterBattleQuestions.filter(
          (question) => question.difficulty === 'MEDIUM',
        ),
      ).toHaveLength(6);
      expect(
        chapterBattleQuestions.filter(
          (question) => question.difficulty === 'HARD',
        ),
      ).toHaveLength(6);
      expect(
        chapterQuestions.filter((question) => question.type === 'CODE_FILL'),
      ).toHaveLength(3);
      expect(sourceQuestionNumbers).toEqual(
        Array.from({ length: 18 }, (_, questionIndex) => questionIndex + 1),
      );
    });

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
            (block) =>
              block.type === 'CODE' &&
              block.language === 'bash' &&
              block.code.includes('____'),
          ),
        ).toBe(true);
        expect(
          question.explanationBlocks?.some(
            (block) =>
              block.type === 'CODE' &&
              block.language === 'bash' &&
              block.code.trim().length > 0,
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

    expect(() => assertNoExactDuplicatesInCourse(course)).not.toThrow();
    expect(
      auditCrossCourseExactDuplicates(VERSIONED_COURSE_SEEDS).filter((group) =>
        group.questions.some(
          (question) => question.courseSlug === 'linux-fundamentals',
        ),
      ),
    ).toHaveLength(0);
  });

  it('enforces the SQL source, stable identity, content, and duplicate gates', () => {
    const { course, questions, battleQuestions } = countQuestions(
      'database-sql-foundations',
    );
    expect(course).toBe(DATABASE_SQL_FOUNDATIONS_COURSE);
    expect(course.chapters).toHaveLength(10);
    expect(course.chapters.map((chapter) => chapter.key)).toEqual([
      'database-sql-introduction',
      'data-types-null-expressions',
      'filters-functions',
      'aggregation-grouping',
      'joins-relations',
      'subqueries-sets-cte',
      'data-modification-transactions',
      'schema-constraints-indexes',
      'views-window-functions',
      'sql-practice-optimization',
    ]);
    expect(course.chapters.flatMap((chapter) => chapter.lessons)).toHaveLength(
      60,
    );
    expect(
      new Set(
        course.chapters
          .flatMap((chapter) => chapter.lessons)
          .map((lesson) => lesson.key),
      ).size,
    ).toBe(60);
    expect(questions).toHaveLength(180);
    expect(new Set(questions.map((question) => question.key)).size).toBe(180);
    expect(battleQuestions).toHaveLength(120);
    expect(
      battleQuestions.filter((question) => question.difficulty === 'MEDIUM'),
    ).toHaveLength(60);
    expect(
      battleQuestions.filter((question) => question.difficulty === 'HARD'),
    ).toHaveLength(60);
    expect(
      questions.filter((question) => question.type === 'CODE_FILL'),
    ).toHaveLength(30);
    course.chapters.forEach((chapter) => {
      const chapterQuestions = chapter.lessons.flatMap(
        (lesson) => lesson.questions,
      );
      expect(chapter.lessons).toHaveLength(6);
      expect(chapterQuestions).toHaveLength(18);
      expect(
        chapterQuestions.filter((question) => question.isBattleEnabled),
      ).toHaveLength(12);
      expect(
        chapterQuestions.filter(
          (question) =>
            question.isBattleEnabled && question.difficulty === 'MEDIUM',
        ),
      ).toHaveLength(6);
      expect(
        chapterQuestions.filter(
          (question) =>
            question.isBattleEnabled && question.difficulty === 'HARD',
        ),
      ).toHaveLength(6);
      expect(
        chapterQuestions.filter((question) => question.type === 'CODE_FILL'),
      ).toHaveLength(3);
      expect(
        chapterQuestions.every(
          (question) => question.explanation.trim().length > 0,
        ),
      ).toBe(true);
      expect(
        chapterQuestions
          .filter((question) => question.type === 'CODE_FILL')
          .every(
            (question) =>
              question.acceptedAnswers.length > 0 &&
              question.stemBlocks?.some(
                (block) =>
                  block.type === 'CODE' &&
                  block.language === 'sql' &&
                  block.code.includes('____'),
              ) &&
              question.explanationBlocks?.some(
                (block) =>
                  block.type === 'CODE' &&
                  block.language === 'sql' &&
                  block.code.trim().length > 0,
              ),
          ),
      ).toBe(true);
    });
    expect(() => assertNoExactDuplicatesInCourse(course)).not.toThrow();
    expect(
      auditCrossCourseExactDuplicates(VERSIONED_COURSE_SEEDS).filter((group) =>
        group.questions.some(
          (question) => question.courseSlug === 'database-sql-foundations',
        ),
      ),
    ).toHaveLength(0);
  });

  it('enforces the computer architecture and operating systems source gates', () => {
    const { course, questions, battleQuestions } = countQuestions(
      'computer-architecture-operating-systems',
    );
    expect(course).toBe(COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE);
    expect(getComputerArchitectureOperatingSystemsSourceStats()).toEqual({
      chapters: 10,
      lessons: 60,
      questions: 180,
      battleQuestions: 120,
      mediumBattleQuestions: 60,
      hardBattleQuestions: 60,
      codeFillQuestions: 30,
    });
    expect(course.chapters.map((chapter) => chapter.key)).toEqual(
      Array.from(
        { length: 10 },
        (_, index) =>
          `computer-architecture-operating-systems-chapter-${String(index + 1).padStart(2, '0')}`,
      ),
    );
    expect(
      new Set(
        course.chapters
          .flatMap((chapter) => chapter.lessons)
          .map((lesson) => lesson.key),
      ).size,
    ).toBe(60);
    expect(new Set(questions.map((question) => question.key)).size).toBe(180);
    expect(battleQuestions).toHaveLength(120);
    expect(
      questions.filter((question) => question.type === 'CODE_FILL'),
    ).toHaveLength(30);
    for (const chapter of course.chapters) {
      const chapterQuestions = chapter.lessons.flatMap(
        (lesson) => lesson.questions,
      );
      expect(chapter.lessons).toHaveLength(6);
      expect(chapterQuestions).toHaveLength(18);
      expect(
        chapterQuestions.filter((question) => question.isBattleEnabled),
      ).toHaveLength(12);
      expect(
        chapterQuestions.filter(
          (question) =>
            question.isBattleEnabled && question.difficulty === 'MEDIUM',
        ),
      ).toHaveLength(6);
      expect(
        chapterQuestions.filter(
          (question) =>
            question.isBattleEnabled && question.difficulty === 'HARD',
        ),
      ).toHaveLength(6);
      expect(
        chapterQuestions.filter((question) => question.type === 'CODE_FILL'),
      ).toHaveLength(3);
      expect(
        chapterQuestions.every(
          (question) => question.explanation.trim().length > 0,
        ),
      ).toBe(true);
      expect(
        chapterQuestions
          .filter((question) => question.type === 'CODE_FILL')
          .every(
            (question) =>
              question.acceptedAnswers.length > 0 &&
              question.stemBlocks?.some(
                (block) => block.type === 'CODE' && block.code.includes('____'),
              ) &&
              question.explanationBlocks?.some(
                (block) =>
                  block.type === 'CODE' && block.code.trim().length > 0,
              ),
          ),
      ).toBe(true);
    }
    expect(() =>
      validateComputerArchitectureOperatingSystemsSource(),
    ).not.toThrow();
    expect(() => assertNoExactDuplicatesInCourse(course)).not.toThrow();
    expect(
      auditCrossCourseExactDuplicates(VERSIONED_COURSE_SEEDS).filter((group) =>
        group.questions.some(
          (question) =>
            question.courseSlug === 'computer-architecture-operating-systems',
        ),
      ),
    ).toHaveLength(0);
  });

  it('enforces the computer networks source gates and professional identity', () => {
    const { course, questions, battleQuestions } = countQuestions(
      'computer-networks-fundamentals',
    );
    expect(course).toBe(COMPUTER_NETWORKS_FUNDAMENTALS_COURSE);
    expect(course.chapters.map((chapter) => chapter.key)).toEqual(
      Array.from(
        { length: 10 },
        (_, index) =>
          `computer-networks-fundamentals-chapter-${String(index + 1).padStart(2, '0')}`,
      ),
    );
    expect(new Set(course.chapters.flatMap((chapter) => chapter.lessons).map((lesson) => lesson.key)).size).toBe(60);
    expect(new Set(questions.map((question) => question.key)).size).toBe(180);
    expect(battleQuestions).toHaveLength(120);
    expect(battleQuestions.filter((question) => question.difficulty === 'MEDIUM')).toHaveLength(60);
    expect(battleQuestions.filter((question) => question.difficulty === 'HARD')).toHaveLength(60);
    expect(questions.filter((question) => question.type === 'CODE_FILL')).toHaveLength(30);
    for (const chapter of course.chapters) {
      const chapterQuestions = chapter.lessons.flatMap((lesson) => lesson.questions);
      expect(chapter.lessons).toHaveLength(6);
      expect(chapterQuestions).toHaveLength(18);
      expect(chapterQuestions.filter((question) => question.isBattleEnabled)).toHaveLength(12);
      expect(chapterQuestions.filter((question) => question.isBattleEnabled && question.difficulty === 'MEDIUM')).toHaveLength(6);
      expect(chapterQuestions.filter((question) => question.isBattleEnabled && question.difficulty === 'HARD')).toHaveLength(6);
      expect(chapterQuestions.filter((question) => question.type === 'CODE_FILL')).toHaveLength(3);
      expect(chapterQuestions.filter((question) => question.type === 'CODE_FILL').every((question) => question.acceptedAnswers.length > 0 && question.stemBlocks?.some((block) => block.type === 'CODE' && block.code.includes('____')) && question.explanationBlocks?.some((block) => block.type === 'CODE' && block.code.trim().length > 0))).toBe(true);
    }
    expect(() => assertNoExactDuplicatesInCourse(course)).not.toThrow();
    expect(auditCrossCourseExactDuplicates(VERSIONED_COURSE_SEEDS).filter((group) => group.questions.some((question) => question.courseSlug === 'computer-networks-fundamentals'))).toHaveLength(0);
  });

  it('enforces the Java source gates and professional identity', () => {
    const { course, questions, battleQuestions } = countQuestions(
      'java-object-oriented-programming',
    );
    expect(course).toBe(JAVA_OBJECT_ORIENTED_PROGRAMMING_COURSE);
    expect(course.chapters.map((chapter) => chapter.key)).toEqual(
      Array.from(
        { length: 10 },
        (_, index) =>
          `java-object-oriented-programming-chapter-${String(index + 1).padStart(2, '0')}`,
      ),
    );
    expect(new Set(course.chapters.flatMap((chapter) => chapter.lessons).map((lesson) => lesson.key)).size).toBe(60);
    expect(new Set(questions.map((question) => question.key)).size).toBe(180);
    expect(battleQuestions).toHaveLength(120);
    expect(battleQuestions.filter((question) => question.difficulty === 'MEDIUM')).toHaveLength(60);
    expect(battleQuestions.filter((question) => question.difficulty === 'HARD')).toHaveLength(60);
    expect(questions.filter((question) => question.type === 'CODE_FILL')).toHaveLength(30);
    for (const chapter of course.chapters) {
      const chapterQuestions = chapter.lessons.flatMap((lesson) => lesson.questions);
      expect(chapter.lessons).toHaveLength(6);
      expect(chapterQuestions).toHaveLength(18);
      expect(chapterQuestions.filter((question) => question.isBattleEnabled)).toHaveLength(12);
      expect(chapterQuestions.filter((question) => question.isBattleEnabled && question.difficulty === 'MEDIUM')).toHaveLength(6);
      expect(chapterQuestions.filter((question) => question.isBattleEnabled && question.difficulty === 'HARD')).toHaveLength(6);
      expect(chapterQuestions.filter((question) => question.type === 'CODE_FILL')).toHaveLength(3);
      expect(chapterQuestions.filter((question) => question.type === 'CODE_FILL').every((question) => question.acceptedAnswers.length > 0 && question.stemBlocks?.some((block) => block.type === 'CODE' && block.code.includes('____')) && question.explanationBlocks?.some((block) => block.type === 'CODE' && block.code.trim().length > 0))).toBe(true);
    }
    expect(() => assertNoExactDuplicatesInCourse(course)).not.toThrow();
    expect(auditCrossCourseExactDuplicates(VERSIONED_COURSE_SEEDS).filter((group) => group.questions.some((question) => question.courseSlug === 'java-object-oriented-programming'))).toHaveLength(0);
  });

  it('enforces the Spark source gates and big-data-only identity', () => {
    const { course, questions, battleQuestions } = countQuestions(
      'spark-data-processing',
    );
    expect(course).toBe(SPARK_DATA_PROCESSING_COURSE);
    expect(course.chapters.map((chapter) => chapter.key)).toEqual(
      Array.from(
        { length: 10 },
        (_, index) =>
          `spark-data-processing-chapter-${String(index + 1).padStart(2, '0')}`,
      ),
    );
    const lessons = course.chapters.flatMap((chapter) => chapter.lessons);
    expect(lessons).toHaveLength(60);
    expect(new Set(lessons.map((lesson) => lesson.key)).size).toBe(60);
    expect(questions).toHaveLength(180);
    expect(new Set(questions.map((question) => question.key)).size).toBe(180);
    expect(battleQuestions).toHaveLength(120);
    expect(
      battleQuestions.filter((question) => question.difficulty === 'MEDIUM'),
    ).toHaveLength(60);
    expect(
      battleQuestions.filter((question) => question.difficulty === 'HARD'),
    ).toHaveLength(60);
    expect(
      questions.filter((question) => question.type === 'CODE_FILL'),
    ).toHaveLength(30);
    for (const chapter of course.chapters) {
      const chapterQuestions = chapter.lessons.flatMap(
        (lesson) => lesson.questions,
      );
      const chapterBattleQuestions = chapterQuestions.filter(
        (question) => question.isBattleEnabled,
      );
      expect(chapter.lessons).toHaveLength(6);
      expect(chapterQuestions).toHaveLength(18);
      expect(chapterBattleQuestions).toHaveLength(12);
      expect(
        chapterBattleQuestions.filter(
          (question) => question.difficulty === 'MEDIUM',
        ),
      ).toHaveLength(6);
      expect(
        chapterBattleQuestions.filter(
          (question) => question.difficulty === 'HARD',
        ),
      ).toHaveLength(6);
      expect(
        chapterQuestions.filter((question) => question.type === 'CODE_FILL'),
      ).toHaveLength(3);
      expect(
        chapterQuestions
          .filter((question) => question.type === 'CODE_FILL')
          .every(
            (question) =>
              question.acceptedAnswers.length > 0 &&
              question.stemBlocks?.some(
                (block) =>
                  block.type === 'CODE' &&
                  block.language === 'python' &&
                  block.code.includes('____'),
              ) &&
              question.explanationBlocks?.some(
                (block) =>
                  block.type === 'CODE' &&
                  block.language === 'python' &&
                  block.code.trim().length > 0,
              ),
          ),
      ).toBe(true);
    }
    expect(() => assertNoExactDuplicatesInCourse(course)).not.toThrow();
    expect(
      auditCrossCourseExactDuplicates(VERSIONED_COURSE_SEEDS).filter((group) =>
        group.questions.some(
          (question) => question.courseSlug === 'spark-data-processing',
        ),
      ),
    ).toHaveLength(0);
  });

  it('keeps ten formal plans and completed sources aligned', () => {
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
      'linux-fundamentals',
      'database-sql-foundations',
      'computer-architecture-operating-systems',
      'computer-networks-fundamentals',
      'java-object-oriented-programming',
      'software-engineering-project-development',
      'big-data-fundamentals',
      'spark-data-processing',
    ]);
    expect(VERSIONED_COURSE_SEEDS.map((course) => course.slug)).toEqual(
      PUBLISHED_FORMAL_COURSE_SLUGS,
    );
    expect(
      FORMAL_COURSE_PLAN.map((course) => ({
        order: course.order,
        slug: course.slug,
        title: course.title,
        subjectCategory: course.subjectCategory,
        implementationLanguage: course.implementationLanguage,
        professionalDirections: course.professionalDirections,
        prerequisites: course.prerequisites,
        nextCourses: course.nextCourses,
        coreRouteOrder: course.coreRouteOrder,
      })),
    ).toEqual([
      {
        order: 1,
        slug: 'python-basic',
        title: 'Python 基础入门',
        subjectCategory: '程序设计',
        implementationLanguage: 'Python',
        professionalDirections: [
          'computer-science',
          'software-engineering',
          'big-data',
        ],
        prerequisites: [],
        nextCourses: ['data-structures-algorithms', 'linux-fundamentals'],
        coreRouteOrder: {
          'big-data': 1,
          'computer-science': 1,
          'software-engineering': 1,
        },
      },
      {
        order: 2,
        slug: 'data-structures-algorithms',
        title: '数据结构与算法基础',
        subjectCategory: '算法',
        implementationLanguage: 'Python',
        professionalDirections: [
          'computer-science',
          'software-engineering',
          'big-data',
        ],
        prerequisites: ['python-basic'],
        nextCourses: [
          'database-sql-foundations',
          'java-object-oriented-programming',
          'linux-fundamentals',
        ],
        coreRouteOrder: {
          'big-data': 2,
          'computer-science': 2,
          'software-engineering': 2,
        },
      },
      {
        order: 3,
        slug: 'linux-fundamentals',
        title: 'Linux 基础与常用命令',
        subjectCategory: '系统',
        implementationLanguage: null,
        professionalDirections: [
          'computer-science',
          'big-data',
          'software-engineering',
        ],
        prerequisites: ['python-basic'],
        nextCourses: [
          'database-sql-foundations',
          'big-data-fundamentals',
          'computer-networks-fundamentals',
        ],
        coreRouteOrder: { 'big-data': 3, 'computer-science': 3 },
      },
      {
        order: 4,
        slug: 'database-sql-foundations',
        title: '数据库与 SQL 基础',
        subjectCategory: '数据库',
        implementationLanguage: 'SQL',
        professionalDirections: [
          'computer-science',
          'software-engineering',
          'big-data',
        ],
        prerequisites: ['python-basic'],
        nextCourses: [
          'software-engineering-project-development',
          'big-data-fundamentals',
        ],
        coreRouteOrder: {
          'big-data': 4,
          'computer-science': 4,
          'software-engineering': 4,
        },
      },
      {
        order: 5,
        slug: 'computer-architecture-operating-systems',
        title: '计算机组成原理与操作系统基础',
        subjectCategory: '系统',
        implementationLanguage: null,
        professionalDirections: ['computer-science'],
        prerequisites: ['data-structures-algorithms'],
        nextCourses: ['computer-networks-fundamentals'],
        coreRouteOrder: { 'computer-science': 5 },
      },
      {
        order: 6,
        slug: 'computer-networks-fundamentals',
        title: '计算机网络基础',
        subjectCategory: '网络',
        implementationLanguage: null,
        professionalDirections: ['computer-science', 'software-engineering'],
        prerequisites: ['linux-fundamentals'],
        nextCourses: [],
        coreRouteOrder: { 'computer-science': 6, 'software-engineering': 6 },
      },
      {
        order: 7,
        slug: 'java-object-oriented-programming',
        title: 'Java 面向对象程序设计',
        subjectCategory: '程序设计',
        implementationLanguage: 'Java',
        professionalDirections: ['software-engineering', 'computer-science'],
        prerequisites: ['data-structures-algorithms'],
        nextCourses: [
          'database-sql-foundations',
          'software-engineering-project-development',
        ],
        coreRouteOrder: { 'software-engineering': 3 },
      },
      {
        order: 8,
        slug: 'software-engineering-project-development',
        title: '软件工程与项目开发',
        subjectCategory: '软件工程',
        implementationLanguage: null,
        professionalDirections: ['software-engineering'],
        prerequisites: [
          'data-structures-algorithms',
          'database-sql-foundations',
        ],
        nextCourses: ['computer-networks-fundamentals'],
        coreRouteOrder: { 'software-engineering': 5 },
      },
      {
        order: 9,
        slug: 'big-data-fundamentals',
        title: '大数据技术基础',
        subjectCategory: '大数据',
        implementationLanguage: null,
        professionalDirections: ['big-data'],
        prerequisites: [
          'python-basic',
          'linux-fundamentals',
          'database-sql-foundations',
        ],
        nextCourses: ['spark-data-processing'],
        coreRouteOrder: { 'big-data': 5 },
      },
      {
        order: 10,
        slug: 'spark-data-processing',
        title: 'Spark 数据处理',
        subjectCategory: '大数据',
        implementationLanguage: 'Scala',
        professionalDirections: ['big-data'],
        prerequisites: ['python-basic', 'big-data-fundamentals'],
        nextCourses: [],
        coreRouteOrder: { 'big-data': 6 },
      },
    ]);

    const formalSlugs = new Set(
      FORMAL_COURSE_PLAN.map((course) => course.slug),
    );
    for (const course of FORMAL_COURSE_PLAN) {
      expect(
        [...course.prerequisites, ...course.nextCourses].every((slug) =>
          formalSlugs.has(slug),
        ),
      ).toBe(true);
    }

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

  it('keeps the SQL content manifest aligned with its registered skeleton', () => {
    const course = FORMAL_COURSE_PLAN.find(
      (candidate) => candidate.slug === 'database-sql-foundations',
    );
    const manifest = readFileSync(
      resolve(
        __dirname,
        '../../docs/开发文档/database-sql-foundations-complete-10-chapters/database-sql-foundations-course-manifest.txt',
      ),
      'utf8',
    );
    const manifestChapterSlugs = [
      ...manifest.matchAll(/^\d+\.\s+(\S+)\s+\|/gm),
    ].map((match) => match[1]);

    expect(manifest).toContain(`slug：${course?.slug}`);
    expect(manifestChapterSlugs).toEqual(
      course?.chapters.map((chapter) => chapter.slug),
    );
  });

  it('rejects empty targeted publisher sources before any production write', async () => {
    const emptyCourse = structuredClone(
      LINUX_FUNDAMENTALS_COURSE,
    ) as SeedCourse;
    emptyCourse.chapters = [];
    expect(() => assertPublishableSeedCourse(emptyCourse)).toThrow(
      'cannot publish an empty course',
    );

    const emptyChapter = structuredClone(
      LINUX_FUNDAMENTALS_COURSE,
    ) as SeedCourse;
    emptyChapter.chapters[0]!.lessons = [];
    const courseUpsert = jest.fn();
    await expect(
      publishTargetedCourseDefinitions(
        { course: { upsert: courseUpsert } } as never,
        emptyChapter,
        'course-id',
        [],
      ),
    ).rejects.toThrow('cannot publish an empty chapter');
    expect(courseUpsert).not.toHaveBeenCalled();

    await expect(
      publishTargetedCourseDefinitions(
        { course: { upsert: courseUpsert } } as never,
        LINUX_FUNDAMENTALS_COURSE,
        'course-id',
        [],
      ),
    ).rejects.toThrow('plan does not match source chapters');
    expect(courseUpsert).not.toHaveBeenCalled();
  });
});
