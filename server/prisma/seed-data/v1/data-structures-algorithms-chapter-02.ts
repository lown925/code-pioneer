import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'array-and-sequential-storage',
  'traverse-sequential-list',
  'insert-and-shift-elements',
  'delete-elements-and-boundaries',
  'search-and-update-elements',
  'score-management-with-list',
] as const;

const QUESTION_KEYS = [
  'arrays-third-element-index',
  'arrays-index-access-output',
  'arrays-last-index-expression',
  'arrays-direct-value-iteration',
  'arrays-traversal-output',
  'arrays-traversal-complexity',
  'arrays-append-method',
  'arrays-insert-output',
  'arrays-insert-at-start',
  'arrays-pop-vs-remove',
  'arrays-delete-output',
  'arrays-safe-remove-guard',
  'arrays-update-by-index',
  'arrays-update-output',
  'arrays-minimum-score-condition',
  'arrays-random-access-advantage',
  'arrays-score-normalization',
  'arrays-search-delete-complexity',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_02 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-02.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 2,
    chapterOrdinal: '二',
    chapterKey: 'data-structures-algorithms-arrays',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数组与顺序表章节测验',
    quizDescription:
      '检验你是否掌握顺序存储、列表遍历、插入、删除、查找和更新操作。',
    passScorePercent: 70,
  },
);
