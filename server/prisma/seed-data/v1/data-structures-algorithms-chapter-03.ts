import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'why-linked-lists',
  'create-and-connect-nodes',
  'traverse-singly-linked-list',
  'insert-linked-list-node',
  'delete-linked-list-node',
  'choose-list-or-linked-list',
] as const;

const QUESTION_KEYS = [
  'linked-list-node-order',
  'linked-list-vs-sequential-storage',
  'linked-list-bypass-node',
  'linked-list-next-reference',
  'linked-list-node-output',
  'linked-list-connect-three-nodes',
  'linked-list-traversal-step',
  'linked-list-traversal-output',
  'linked-list-index-access-complexity',
  'linked-list-head-insertion-order',
  'linked-list-middle-insertion-result',
  'linked-list-preserve-next-on-insert',
  'linked-list-delete-head',
  'linked-list-middle-delete-result',
  'linked-list-delete-by-value-complexity',
  'linked-list-vs-array-index-access',
  'linked-list-insertion-requirements',
  'linked-list-bypass-current-node',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_03 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-03.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 3,
    chapterOrdinal: '三',
    chapterKey: 'data-structures-algorithms-linked-list',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '链表章节测验',
    quizDescription:
      '检验你是否理解节点连接、单链表遍历、插入、删除及其与顺序表的差异。',
    passScorePercent: 70,
  },
);
