import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'understand-and-define-functions',
  'pass-data-with-parameters',
  'return-results-from-functions',
  'use-default-and-keyword-arguments',
  'understand-local-variables-and-scope',
  'split-functions-by-responsibility',
] as const;

const QUESTION_KEYS = [
  'define-show-message-function',
  'function-definition-keyword',
  'call-show-start-function',
  'greet-python-student-output',
  'formal-parameter-term',
  'call-show-score-with-twelve',
  'add-function-return-output',
  'return-result-keyword',
  'return-calculated-score',
  'default-score-argument-output',
  'keyword-argument-term',
  'progress-default-value',
  'local-and-global-score-output',
  'local-variable-term',
  'score-per-question-parameter',
  'single-responsibility-benefit',
  'single-function-responsibility',
  'return-draw-result',
] as const;

export const PYTHON_BASIC_CHAPTER_10 = parsePythonChapterSource(
  readSeedDocument('python-basic-chapter-10.md'),
  {
    chapterNumber: 10,
    chapterOrdinal: '十',
    chapterKey: 'python-functions',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '函数章节测验',
    quizDescription:
      '检验你是否掌握函数定义与调用、参数、返回值、默认参数、关键字参数、变量作用域和职责拆分。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
