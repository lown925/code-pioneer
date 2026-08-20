import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'priority-queue-basics',
  'complete-binary-tree-and-heap',
  'max-heap-and-min-heap',
  'heap-insertion-and-sift-up',
  'heap-root-removal-and-sift-down',
  'heapq-and-top-k',
] as const;

const QUESTION_KEYS = [
  'heap-priority-vs-fifo',
  'heap-smallest-priority-first',
  'heap-priority-queue-use-case',
  'heap-complete-binary-tree-shape',
  'heap-left-child-index',
  'heap-parent-index-expression',
  'heap-min-root-property',
  'heap-max-property',
  'heap-not-fully-sorted',
  'heap-insert-initial-position',
  'heap-min-sift-up-condition',
  'heap-sift-up-parent-expression',
  'heap-root-replacement',
  'heap-min-sift-down-child',
  'heap-root-removal-shape',
  'heapq-default-heap-type',
  'heapq-first-pop-output',
  'heapq-pop-assignment',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_09 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-09.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 9,
    chapterOrdinal: '九',
    chapterKey: 'data-structures-algorithms-heap-priority-queue',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '堆与优先队列章节测验',
    quizDescription:
      '检验你是否理解堆结构、优先队列、上下调整以及 heapq 的使用。',
    passScorePercent: 70,
  },
);
