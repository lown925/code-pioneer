import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'preorder-traversal',
  'inorder-traversal',
  'postorder-traversal',
  'level-order-traversal',
  'binary-search-tree-basics',
  'binary-search-tree-insertion',
] as const;

const QUESTION_KEYS = [
  'tree-preorder-sequence',
  'tree-preorder-three-nodes',
  'tree-preorder-five-nodes',
  'tree-inorder-sequence',
  'tree-inorder-values',
  'tree-inorder-left-recursion',
  'tree-postorder-sequence',
  'tree-postorder-three-nodes',
  'tree-postorder-use-case',
  'tree-level-order-data-structure',
  'tree-level-order-sequence',
  'tree-level-order-dequeue',
  'bst-smaller-value-side',
  'bst-search-next-subtree',
  'bst-search-complexity-caveat',
  'bst-insert-left-child',
  'bst-insert-path',
  'bst-left-branch-condition',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_08 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-08.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 8,
    chapterOrdinal: '八',
    chapterKey: 'data-structures-algorithms-tree-traversal-bst',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '二叉树遍历与二叉搜索树章节测验',
    quizDescription: '检验你是否掌握四种遍历顺序及二叉搜索树的查找与插入规则。',
    passScorePercent: 70,
  },
);
