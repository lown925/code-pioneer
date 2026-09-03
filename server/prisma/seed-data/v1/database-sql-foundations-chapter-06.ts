import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'scalar-and-single-column-subqueries',
  'in-subqueries',
  'exists-and-correlated-subqueries',
  'union-and-union-all',
  'cte-common-table-expressions',
  'complex-query-decomposition',
] as const;

const QUESTION_KEYS = [
  'scalar-and-single-column-subqueries-concept',
  'scalar-and-single-column-subqueries-battle-medium',
  'scalar-and-single-column-subqueries-battle-hard',
  'in-subqueries-concept',
  'in-subqueries-battle-medium',
  'in-subqueries-battle-hard',
  'exists-and-correlated-subqueries-concept',
  'exists-and-correlated-subqueries-battle-medium',
  'exists-and-correlated-subqueries-battle-hard',
  'union-and-union-all-concept',
  'union-and-union-all-battle-medium',
  'union-and-union-all-battle-hard',
  'cte-common-table-expressions-concept',
  'cte-common-table-expressions-battle-medium',
  'cte-common-table-expressions-battle-hard',
  'complex-query-decomposition-concept',
  'complex-query-decomposition-battle-medium',
  'complex-query-decomposition-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_06 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-06.md', [
    'docs',
    '开发文档',
    'database-sql-foundations',
  ]),
  {
    chapterNumber: 6,
    chapterOrdinal: '六',
    chapterKey: 'subqueries-sets-cte',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第6章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);
