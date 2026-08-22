import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'relational-database-and-tables',
  'rows-columns-primary-keys',
  'select-basics',
  'where-filtering',
  'order-by-sorting',
  'limit-result-control',
] as const;

const QUESTION_KEYS = [
  'relational-database-and-tables-concept',
  'relational-database-and-tables-battle-medium',
  'relational-database-and-tables-battle-hard',
  'rows-columns-primary-keys-concept',
  'rows-columns-primary-keys-battle-medium',
  'rows-columns-primary-keys-battle-hard',
  'select-basics-concept',
  'select-basics-battle-medium',
  'select-basics-battle-hard',
  'where-filtering-concept',
  'where-filtering-battle-medium',
  'where-filtering-battle-hard',
  'order-by-sorting-concept',
  'order-by-sorting-battle-medium',
  'order-by-sorting-battle-hard',
  'limit-result-control-concept',
  'limit-result-control-battle-medium',
  'limit-result-control-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_01 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-01.md', [
    'docs',
    '开发文档',
    'database-sql-foundations-complete-10-chapters',
  ]),
  {
    chapterNumber: 1,
    chapterOrdinal: '一',
    chapterKey: 'database-sql-introduction',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第1章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);

