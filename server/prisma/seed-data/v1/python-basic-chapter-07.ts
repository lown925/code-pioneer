import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const CHAPTER_SOURCE_PATH = resolve(
  process.cwd(),
  '..',
  'docs',
  'python-basic-chapter-07.md',
);

const LESSON_KEYS = [
  'create-and-read-strings',
  'string-slicing',
  'string-length-concatenation-and-repetition',
  'iterate-over-strings',
  'common-string-methods',
  'string-immutability-and-composition',
] as const;

const QUESTION_KEYS = [
  'string-first-character-output',
  'string-first-index',
  'invite-code-last-character',
  'string-slice-output',
  'slice-first-three-characters',
  'extract-year-from-invite-code',
  'string-length-output',
  'string-length-function',
  'repeat-divider-character',
  'string-loop-output-lines',
  'count-letter-in-string',
  'count-seven-in-invite-code',
  'trim-nickname-whitespace',
  'lowercase-string-output',
  'strip-course-name',
  'string-index-assignment-error',
  'string-immutability-name',
  'normalize-invite-code',
] as const;

export const PYTHON_BASIC_CHAPTER_07 = parsePythonChapterSource(
  readFileSync(CHAPTER_SOURCE_PATH, 'utf8'),
  {
    chapterNumber: 7,
    chapterOrdinal: '七',
    chapterKey: 'python-strings',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '字符串章节测验',
    quizDescription:
      '检验你是否掌握字符串创建、索引、切片、长度、拼接、遍历、常用方法和不可变性。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
