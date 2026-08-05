import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const CHAPTER_SOURCE_PATH = resolve(
  process.cwd(),
  '..',
  'docs',
  'python-basic-chapter-06-full.md',
);

const LESSON_KEYS = [
  'why-loops-are-needed',
  'for-and-range-loops',
  'while-loops',
  'loop-accumulation-and-counting',
  'break-and-continue',
  'nested-loops',
] as const;

const QUESTION_KEYS = [
  'choose-loop-for-repetition',
  'loop-structure-name',
  'range-three-matches',
  'range-three-output',
  'range-end-value-six',
  'display-question-one-to-ten',
  'while-wait-count',
  'while-infinite-loop',
  'countdown-decrement',
  'sum-one-to-four',
  'accumulator-initial-value',
  'battle-score-loop',
  'break-output',
  'continue-skip-unanswered',
  'skip-third-question',
  'nested-loop-print-count',
  'nested-loop-total-executions',
  'nested-chapter-question-range',
] as const;

export const PYTHON_BASIC_CHAPTER_06 = parsePythonChapterSource(
  readFileSync(CHAPTER_SOURCE_PATH, 'utf8'),
  {
    chapterNumber: 6,
    chapterOrdinal: '六',
    chapterKey: 'python-loops',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '循环章节测验',
    quizDescription:
      '检验你是否掌握 for、while、range()、累加、计数、break、continue 和嵌套循环。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
