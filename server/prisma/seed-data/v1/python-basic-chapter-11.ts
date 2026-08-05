import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const CHAPTER_SOURCE_PATH = resolve(
  process.cwd(),
  '..',
  'docs',
  'python-basic-chapter-11.md',
);

const LESSON_KEYS = [
  'understand-modules-and-import',
  'use-from-import-and-aliases',
  'create-custom-modules',
  'use-the-math-standard-library',
  'use-the-random-standard-library',
  'work-with-dates-and-times',
] as const;

const QUESTION_KEYS = [
  'import-math-module',
  'module-import-keyword',
  'calculate-square-root-with-math',
  'call-directly-imported-sqrt',
  'module-alias-keyword',
  'alias-datetime-module',
  'import-custom-score-module',
  'direct-execution-module-name',
  'import-calculate-score-function',
  'calculate-page-count-with-ceil',
  'square-root-function-name',
  'calculate-total-pages',
  'choose-random-course',
  'shuffle-list-method',
  'generate-random-question-number',
  'get-current-date',
  'time-duration-type',
  'calculate-battle-expiration-time',
] as const;

export const PYTHON_BASIC_CHAPTER_11 = parsePythonChapterSource(
  readFileSync(CHAPTER_SOURCE_PATH, 'utf8'),
  {
    chapterNumber: 11,
    chapterOrdinal: '十一',
    chapterKey: 'python-modules-and-standard-library',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '模块、包与常用标准库章节测验',
    quizDescription:
      '检验你是否掌握模块导入、别名、自定义模块，以及 math、random 和 datetime 常用标准库。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
