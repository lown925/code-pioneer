import { existsSync } from 'fs';
import { basename } from 'path';
import {
  BATTLE_SKILL_SEEDS,
  VERSIONED_COURSE_SEEDS,
} from '../prisma/seed-data';
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
    expect(course.battleSkillCode).toBe('PYTHON');
  });

  it('loads the JavaScript and BattleSkill seed contracts', () => {
    const { course, questions, battleQuestions } = countQuestions(
      'javascript-starter',
    );

    expect(course.chapters).toHaveLength(2);
    expect(questions).toHaveLength(24);
    expect(battleQuestions).toHaveLength(22);
    expect(course.battleSkillCode).toBe('JAVASCRIPT');
    expect(BATTLE_SKILL_SEEDS).toEqual([
      expect.objectContaining({ code: 'PYTHON', isEnabled: true }),
      expect.objectContaining({ code: 'JAVASCRIPT', isEnabled: false }),
    ]);
  });
});
