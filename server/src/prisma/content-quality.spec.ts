import { assertNoExactDuplicatesInCourse, auditCrossCourseExactDuplicates, auditExactDuplicates, normalizeQuestionText } from '../../prisma/seed-data/content-quality';
import type { SeedCourse } from '../../prisma/seed-data/types';

const makeCourse = (slug: string, questionKey: string, title: string): SeedCourse => ({
  version: 'test', key: slug, slug, title, summary: '', description: '', category: 'GENERAL', language: 'Python',
  difficulty: 'BEGINNER', estimatedMinutes: 1, targetAudience: '', learningObjectives: [], sortOrder: 1,
  chapters: [{ key: 'chapter-1', title: 'Chapter', summary: '', estimatedMinutes: 1, sortOrder: 1, quizTitle: 'Quiz', quizDescription: '', passScorePercent: 60,
    lessons: [{ key: 'lesson-1', title: 'Lesson', summary: '', estimatedMinutes: 1, blocks: [], questions: [{ key: questionKey, type: 'SINGLE_CHOICE', title, explanation: '', difficulty: 'MEDIUM', score: 1, isBattleEnabled: true, battlePresentation: 'TEXT_CHOICE', options: [{ key: 'a', content: 'A', isCorrect: true }, { key: 'b', content: 'B', isCorrect: false }] }] }],
  }],
});

describe('content quality duplicate gate', () => {
  it('normalizes formatting without using fuzzy similarity', () => {
    expect(normalizeQuestionText(' **A**\n B。 ')).toBe('A B');
    expect(normalizeQuestionText('pre-order')).not.toBe(
      normalizeQuestionText('preorder'),
    );
  });

  it('fails exact duplicates within a course', () => {
    const course = makeCourse('course-a', 'q-1', 'What is a stack?');
    course.chapters[0]!.lessons[0]!.questions.push({ ...course.chapters[0]!.lessons[0]!.questions[0]!, key: 'q-2' });
    expect(() => assertNoExactDuplicatesInCourse(course)).toThrow('Exact duplicate');
  });

  it('reports cross-course duplicates without failing a course import', () => {
    expect(auditCrossCourseExactDuplicates([
      makeCourse('course-a', 'q-1', 'What is a stack?'),
      makeCourse('course-b', 'q-2', 'What is a stack?'),
    ])).toHaveLength(1);
  });

  it('classifies same-chapter and cross-chapter exact duplicates', () => {
    const first = makeCourse('course-a', 'q-1', 'What is a stack?');
    const second = makeCourse('course-a', 'q-2', 'What is a stack?');
    second.chapters[0]!.key = 'chapter-2';
    expect(auditExactDuplicates([first, second])[0]?.scope).toBe('cross-chapter');
  });
});
