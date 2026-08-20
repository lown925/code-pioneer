import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'data-structure-and-algorithm',
  'algorithm-steps',
  'algorithm-efficiency',
  'time-complexity',
  'space-complexity',
  'algorithm-analysis',
] as const;

const QUESTION_KEYS = [
  'algorithm-definition',
  'maximum-score-output',
  'maximum-negative-value-condition',
  'algorithm-positive-average-step',
  'positive-sum-output',
  'avoid-zero-division',
  'linear-scan-growth',
  'halving-loop-count',
  'linear-vs-halving-growth',
  'constant-time-operation',
  'linear-sum-complexity',
  'halving-scale-expression',
  'space-complexity-definition',
  'new-list-space-complexity',
  'in-place-space-comparison',
  'complexity-analysis-focus',
  'linear-scan-complexity',
  'duplicate-scan-start-index',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_01 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-01.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 1,
    chapterOrdinal: '一',
    chapterKey: 'data-structures-algorithms-introduction',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '认识算法与复杂度章节测验',
    quizDescription:
      '检验你是否理解算法步骤、时间复杂度、空间复杂度和基础代码分析。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
