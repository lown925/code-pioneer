import type { SeedCourse, SeedQuestion } from './types';

export type ExactDuplicateGroup = {
  identity: string;
  questions: Array<{ courseSlug: string; chapterKey: string; lessonKey: string; questionKey: string }>;
};

export type DuplicateAudit = ExactDuplicateGroup & {
  scope: 'same-chapter' | 'cross-chapter' | 'cross-course';
};

export function normalizeQuestionText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/```[a-zA-Z0-9_-]*\s*/g, '')
    .replace(/[`*_>#~]/g, '')
    .replace(/\s*([。！？；：，、,.!?;:])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[。！？；：，、,.!?;:]+$/g, '');
}

function questionIdentity(question: SeedQuestion) {
  const blocks = 'stemBlocks' in question ? question.stemBlocks ?? [] : [];
  const code = blocks
    .filter((block) => block.type === 'CODE')
    .map((block) => normalizeQuestionText(block.code))
    .join('\n');
  const options = 'options' in question
    ? question.options.map((option) => `${normalizeQuestionText(option.content)}:${option.isCorrect ? '1' : '0'}`).join('|')
    : '';
  const acceptedAnswers = 'acceptedAnswers' in question
    ? question.acceptedAnswers.map(normalizeQuestionText).sort().join('|')
    : '';
  return [normalizeQuestionText(question.title), code, options, acceptedAnswers].join('\u001f');
}

export function findExactDuplicateQuestionGroups(courses: readonly SeedCourse[]): ExactDuplicateGroup[] {
  const groups = new Map<string, ExactDuplicateGroup['questions']>();
  for (const course of courses) {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        for (const question of lesson.questions) {
          const identity = questionIdentity(question);
          const entries = groups.get(identity) ?? [];
          entries.push({ courseSlug: course.slug, chapterKey: chapter.key, lessonKey: lesson.key, questionKey: question.key });
          groups.set(identity, entries);
        }
      }
    }
  }
  return [...groups.entries()]
    .filter(([, questions]) => questions.length > 1)
    .map(([identity, questions]) => ({ identity, questions }));
}

export function assertNoExactDuplicatesInCourse(course: SeedCourse) {
  const groups = findExactDuplicateQuestionGroups([course]);
  if (groups.length > 0) {
    const locations = groups.flatMap((group) => group.questions.map((question) => `${question.lessonKey}/${question.questionKey}`));
    throw new Error(`Exact duplicate questions in ${course.slug}: ${locations.join(', ')}`);
  }
}

export function auditCrossCourseExactDuplicates(courses: readonly SeedCourse[]) {
  return findExactDuplicateQuestionGroups(courses).filter((group) => new Set(group.questions.map((question) => question.courseSlug)).size > 1);
}


export function auditExactDuplicates(courses: readonly SeedCourse[]): DuplicateAudit[] {
  return findExactDuplicateQuestionGroups(courses).map((group) => {
    const coursesInGroup = new Set(group.questions.map((question) => question.courseSlug));
    const chaptersInGroup = new Set(group.questions.map((question) => `${question.courseSlug}/${question.chapterKey}`));
    const scope = coursesInGroup.size > 1
      ? 'cross-course'
      : chaptersInGroup.size > 1
        ? 'cross-chapter'
        : 'same-chapter';
    return { ...group, scope };
  });
}
