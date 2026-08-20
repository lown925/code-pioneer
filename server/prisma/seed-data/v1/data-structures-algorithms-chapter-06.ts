import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'string-index-and-traversal',
  'character-frequency-counting',
  'two-pointers-and-palindrome',
  'basic-substring-search',
  'most-frequent-character',
  'string-algorithm-practice',
] as const;

const QUESTION_KEYS = [
  'strings-index-access',
  'strings-traversal-output',
  'strings-last-index-expression',
  'strings-frequency-dictionary-key',
  'strings-frequency-count-output',
  'strings-frequency-fixed-assignment-bug',
  'strings-palindrome-pointer-starts',
  'strings-palindrome-output',
  'strings-palindrome-complexity',
  'strings-substring-outer-loop-purpose',
  'strings-substring-start-position',
  'strings-substring-range-bound',
  'strings-frequency-table-purpose',
  'strings-character-count',
  'strings-most-frequent-complexity',
  'strings-frequency-data-structure',
  'strings-combined-linear-complexity',
  'strings-right-pointer-update',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_06 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-06.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 6,
    chapterOrdinal: '六',
    chapterKey: 'data-structures-algorithms-string-algorithms',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '字符串与基础算法技巧章节测验',
    quizDescription:
      '检验你是否掌握字符串遍历、频率统计、双指针和基础子串查找。',
    passScorePercent: 70,
  },
);
