import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'graph-basics',
  'directed-undirected-and-adjacency-list',
  'depth-first-search',
  'breadth-first-search',
  'choose-dfs-or-bfs',
  'graph-connectivity',
] as const;

const QUESTION_KEYS = [
  'graph-vertex-definition',
  'graph-edge-road-example',
  'graph-visited-purpose',
  'graph-directed-edge-meaning',
  'graph-adjacency-list-meaning',
  'graph-undirected-reverse-edge',
  'graph-dfs-strategy',
  'graph-dfs-visited-purpose',
  'graph-dfs-cycle-without-visited',
  'graph-bfs-queue',
  'graph-bfs-visit-order',
  'graph-bfs-dequeue-statement',
  'graph-bfs-shortest-unweighted-path',
  'graph-traversal-complexity',
  'graph-dfs-vs-bfs-properties',
  'graph-reachability-check',
  'graph-bfs-early-exit',
  'graph-bfs-mark-neighbor-visited',
] as const;

export const DATA_STRUCTURES_ALGORITHMS_CHAPTER_11 = parsePythonChapterSource(
  readSeedDocument('data-structures-algorithms-chapter-11.md', [
    'docs',
    'data-structures-algorithms-chapter',
  ]),
  {
    chapterNumber: 11,
    chapterOrdinal: '十一',
    chapterKey: 'data-structures-algorithms-graph-traversal',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '图与图的遍历章节测验',
    quizDescription: '检验你是否掌握图、邻接表、DFS、BFS、复杂度和连通性判断。',
    passScorePercent: 70,
  },
);
