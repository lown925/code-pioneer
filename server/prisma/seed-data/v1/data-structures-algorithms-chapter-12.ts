import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'sequential-search',
  'binary-search',
  'bubble-sort',
  'selection-and-insertion-sort',
  'quick-sort-and-divide-conquer',
  'score-analysis-project',
] as const;

const QUESTION_KEYS = [
  'search-sequential-order-requirement',
  'search-sequential-result-index',
  'search-sequential-worst-case',
  'search-binary-sorted-input',
  'search-binary-move-right-bound',
  'search-binary-middle-expression',
  'sort-bubble-adjacent-comparison',
  'sort-bubble-one-pass-result',
  'sort-bubble-complexity',
  'sort-selection-round-purpose',
  'sort-insertion-core-idea',
  'sort-insertion-shift-condition',
  'sort-quick-divide-conquer',
  'sort-quick-pivot-partition',
  'sort-quick-worst-case',
  'analysis-score-band-counts',
  'analysis-binary-search-sorted-scores',
  'analysis-binary-search-right-bound',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_12 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-12.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 12,
    chapterOrdinal: '十二',
    chapterKey: 'data-structures-algorithms-search-sort',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '查找、排序与综合算法训练章节测验',
    quizDescription:
      '检验你是否掌握顺序查找、二分查找、基础排序和综合算法选择。',
    passScorePercent: 70,
  },
);
