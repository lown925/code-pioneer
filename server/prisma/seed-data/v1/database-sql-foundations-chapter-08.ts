import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'create-table',
  'primary-key-and-unique',
  'foreign-keys-and-integrity',
  'not-null-check-default',
  'normalization-and-splitting',
  'index-basics',
] as const;

const QUESTION_KEYS = [
  'create-table-concept',
  'create-table-battle-medium',
  'create-table-battle-hard',
  'primary-key-and-unique-concept',
  'primary-key-and-unique-battle-medium',
  'primary-key-and-unique-battle-hard',
  'foreign-keys-and-integrity-concept',
  'foreign-keys-and-integrity-battle-medium',
  'foreign-keys-and-integrity-battle-hard',
  'not-null-check-default-concept',
  'not-null-check-default-battle-medium',
  'not-null-check-default-battle-hard',
  'normalization-and-splitting-concept',
  'normalization-and-splitting-battle-medium',
  'normalization-and-splitting-battle-hard',
  'index-basics-concept',
  'index-basics-battle-medium',
  'index-basics-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_08 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-08.md', [
    'docs',
    '开发文档',
    'database-sql-foundations',
  ]),
  {
    chapterNumber: 8,
    chapterOrdinal: '八',
    chapterKey: 'schema-constraints-indexes',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第8章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);
