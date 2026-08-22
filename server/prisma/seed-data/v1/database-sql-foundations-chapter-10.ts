import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'requirements-to-schema',
  'comprehensive-report-query',
  'explain-query-plan',
  'indexes-and-optimization',
  'transaction-debugging',
  'comprehensive-sql-practice',
] as const;

const QUESTION_KEYS = [
  'requirements-to-schema-concept',
  'requirements-to-schema-battle-medium',
  'requirements-to-schema-battle-hard',
  'comprehensive-report-query-concept',
  'comprehensive-report-query-battle-medium',
  'comprehensive-report-query-battle-hard',
  'explain-query-plan-concept',
  'explain-query-plan-battle-medium',
  'explain-query-plan-battle-hard',
  'indexes-and-optimization-concept',
  'indexes-and-optimization-battle-medium',
  'indexes-and-optimization-battle-hard',
  'transaction-debugging-concept',
  'transaction-debugging-battle-medium',
  'transaction-debugging-battle-hard',
  'comprehensive-sql-practice-concept',
  'comprehensive-sql-practice-battle-medium',
  'comprehensive-sql-practice-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_10 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-10.md', [
    'docs',
    '开发文档',
    'database-sql-foundations-complete-10-chapters',
  ]),
  {
    chapterNumber: 10,
    chapterOrdinal: '十',
    chapterKey: 'sql-practice-optimization',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第10章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);

