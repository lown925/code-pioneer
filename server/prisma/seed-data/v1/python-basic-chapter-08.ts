import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const CHAPTER_SOURCE_PATH = resolve(
  process.cwd(),
  '..',
  'docs',
  'python-basic-chapter-08.md',
);

const LESSON_KEYS = [
  'create-and-read-lists',
  'list-slicing-and-length',
  'add-and-update-list-elements',
  'delete-list-elements',
  'search-check-and-iterate-lists',
  'sort-reverse-and-tuples',
] as const;

const QUESTION_KEYS = [
  'list-second-course-output',
  'list-bracket-syntax',
  'list-last-course-index',
  'list-slice-output',
  'list-length-output',
  'slice-first-three-courses',
  'append-course-output',
  'list-append-method',
  'insert-git-between-courses',
  'pop-last-element-purpose',
  'remove-list-value-method',
  'pop-completed-course',
  'list-membership-output',
  'list-count-method',
  'count-correct-results',
  'sorted-returns-new-list',
  'tuple-bracket-syntax',
  'tuple-score-rule',
] as const;

export const PYTHON_BASIC_CHAPTER_08 = parsePythonChapterSource(
  readFileSync(CHAPTER_SOURCE_PATH, 'utf8'),
  {
    chapterNumber: 8,
    chapterOrdinal: '八',
    chapterKey: 'python-lists-and-tuples',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '列表与元组章节测验',
    quizDescription:
      '检验你是否掌握列表的索引、切片、增删改查、遍历和排序，以及元组的不可变特性。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
