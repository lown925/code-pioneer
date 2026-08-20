import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'why-trees',
  'tree-terminology',
  'tree-depth-and-height',
  'binary-tree-basics',
  'construct-binary-tree',
  'recursive-tree-access',
] as const;

const QUESTION_KEYS = [
  'trees-hierarchy-use-case',
  'trees-vs-linked-list-structure',
  'trees-parent-child-description',
  'trees-leaf-definition',
  'trees-parent-child-relations',
  'trees-leaf-condition',
  'trees-root-depth',
  'trees-node-depth',
  'trees-height-by-levels',
  'trees-binary-child-limit',
  'trees-binary-node-fields',
  'trees-connect-left-child',
  'trees-left-right-path',
  'trees-nested-child-output',
  'trees-none-child-access',
  'trees-recursion-base-case',
  'trees-count-nodes-result',
  'trees-empty-node-condition',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_07 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-07.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 7,
    chapterOrdinal: '七',
    chapterKey: 'data-structures-algorithms-binary-tree',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '树与二叉树章节测验',
    quizDescription:
      '检验你是否理解树的术语、深度与高度、二叉树节点和递归访问。',
    passScorePercent: 70,
  },
);
