import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'queue-and-fifo',
  'queue-basic-operations',
  'list-front-removal-cost',
  'queue-with-deque',
  'circular-queue-concept',
  'task-scheduling-with-queue',
] as const;

const QUESTION_KEYS = [
  'queue-fifo-rule',
  'queue-first-dequeued-task',
  'queue-vs-stack-first-item',
  'queue-list-enqueue-position',
  'queue-list-output',
  'queue-nonempty-condition',
  'queue-list-front-removal-cost',
  'queue-pop-zero-complexity',
  'queue-large-workload-design',
  'queue-deque-front-method',
  'queue-deque-output',
  'queue-deque-popleft-assignment',
  'queue-circular-space-reuse',
  'queue-circular-index-wrap',
  'queue-circular-two-steps',
  'queue-fifo-use-case',
  'queue-task-processing-order',
  'queue-task-dequeue-expression',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_05 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-05.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 5,
    chapterOrdinal: '五',
    chapterKey: 'data-structures-algorithms-queue',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '队列章节测验',
    quizDescription:
      '检验你是否掌握先进先出规则、deque、循环队列思想和任务调度。',
    passScorePercent: 70,
  },
);
