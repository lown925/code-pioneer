import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'basic-arithmetic-operators',
  'floor-division-modulo-and-power',
  'compound-assignment-operators',
  'operator-precedence-and-parentheses',
  'comparison-operators',
  'logical-operators',
] as const;

const QUESTION_KEYS = [
  'calculate-battle-score',
  'remaining-question-output',
  'calculate-remaining-chapters',
  'calculate-full-pages',
  'remaining-page-questions',
  'calculate-power-result',
  'compound-score-increment',
  'compound-rating-output',
  'update-score-with-assignment',
  'multiplication-precedence-output',
  'parenthesized-reward-expression',
  'calculate-bonus-final-score',
  'greater-than-or-equal-expression',
  'rating-equality-output',
  'compare-quiz-pass-score',
  'both-players-ready',
  'author-or-admin-operator',
  'allow-join-when-not-full',
] as const;

export const PYTHON_BASIC_CHAPTER_04 = parsePythonChapterSource(
  readSeedDocument('python-basic-chapter-04.md'),
  {
    chapterNumber: 4,
    chapterOrdinal: '四',
    chapterKey: 'python-operators-and-expressions',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '运算符与表达式章节测验',
    quizDescription:
      '检验你是否掌握算术、复合赋值、运算优先级、比较和逻辑运算符。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
