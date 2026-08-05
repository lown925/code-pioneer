import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const CHAPTER_SOURCE_PATH = resolve(
  process.cwd(),
  '..',
  'docs',
  'python-basic-chapter-09-full.md',
);

const LESSON_KEYS = [
  'understand-dictionaries-and-key-value-pairs',
  'add-update-and-delete-dictionary-items',
  'safely-read-with-get',
  'iterate-over-dictionaries',
  'understand-sets-and-deduplication',
  'set-operations-and-applications',
] as const;

const QUESTION_KEYS = [
  'dictionary-rating-output',
  'dictionary-key-value-relationship',
  'read-course-name-from-dictionary',
  'update-player-rating',
  'delete-dictionary-keyword',
  'add-learning-progress',
  'dictionary-get-default-output',
  'dictionary-get-method',
  'get-favorite-count-default',
  'dictionary-items-method',
  'dictionary-values-method',
  'iterate-course-question-counts',
  'set-unique-element-count',
  'create-empty-set',
  'add-battle-tag',
  'set-intersection-operator',
  'set-difference-operation',
  'pending-battle-courses',
] as const;

export const PYTHON_BASIC_CHAPTER_09 = parsePythonChapterSource(
  readFileSync(CHAPTER_SOURCE_PATH, 'utf8'),
  {
    chapterNumber: 9,
    chapterOrdinal: '九',
    chapterKey: 'python-dictionaries-and-sets',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '字典与集合章节测验',
    quizDescription:
      '检验你是否掌握字典的增删改查和遍历，以及集合的去重、成员判断和集合运算。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
