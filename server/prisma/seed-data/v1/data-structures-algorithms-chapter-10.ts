import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'dictionary-and-fast-lookup',
  'hash-functions',
  'hash-collisions',
  'collision-resolution',
  'hash-complexity-and-load',
  'hash-table-applications',
] as const;

const QUESTION_KEYS = [
  'hash-key-value-lookup',
  'hash-dictionary-output',
  'hash-lookup-not-always-one-step',
  'hash-function-purpose',
  'hash-modulo-bucket',
  'hash-bucket-index-expression',
  'hash-collision-definition',
  'hash-same-bucket-example',
  'hash-collision-resolution-need',
  'hash-separate-chaining',
  'hash-linear-probing-wrap',
  'hash-linear-probing-expression',
  'hash-average-constant-time',
  'hash-clustered-keys-performance',
  'hash-worst-case-linear-time',
  'hash-set-duplicate-detection',
  'hash-duplicate-detection-complexity',
  'hash-add-to-seen-set',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_10 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-10.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 10,
    chapterOrdinal: '十',
    chapterKey: 'data-structures-algorithms-hash-table',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '哈希表章节测验',
    quizDescription:
      '检验你是否理解哈希函数、冲突处理、复杂度及哈希表的典型应用。',
    passScorePercent: 70,
  },
);
