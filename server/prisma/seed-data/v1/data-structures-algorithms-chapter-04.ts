import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'stack-and-lifo',
  'stack-basic-operations',
  'stack-and-recent-actions',
  'parentheses-matching',
  'stack-and-function-calls',
  'symbol-checker-with-stack',
] as const;

const QUESTION_KEYS = [
  'stack-lifo-rule',
  'stack-pop-output',
  'stack-top-after-operations',
  'stack-peek-expression',
  'stack-basic-operations-output',
  'stack-nonempty-condition',
  'stack-undo-scenario',
  'stack-undo-output',
  'stack-multiple-undo-order',
  'stack-push-opening-bracket',
  'stack-mismatched-bracket-top',
  'stack-bracket-mismatch-condition',
  'stack-function-return-order',
  'stack-recursion-output',
  'stack-recursion-base-case',
  'stack-unmatched-opening-check',
  'stack-parentheses-complexity',
  'stack-final-nonempty-condition',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_04 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-04.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 4,
    chapterOrdinal: '四',
    chapterKey: 'data-structures-algorithms-stack',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '栈章节测验',
    quizDescription:
      '检验你是否掌握栈的后进先出规则、基本操作、括号匹配和典型应用。',
    passScorePercent: 70,
  },
);
