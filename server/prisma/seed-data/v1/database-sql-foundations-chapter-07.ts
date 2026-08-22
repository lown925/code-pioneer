import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'insert-new-rows',
  'batch-insert',
  'safe-update',
  'safe-delete',
  'transactions-commit-rollback',
  'atomicity-and-consistency',
] as const;

const QUESTION_KEYS = [
  'insert-new-rows-concept',
  'insert-new-rows-battle-medium',
  'insert-new-rows-battle-hard',
  'batch-insert-concept',
  'batch-insert-battle-medium',
  'batch-insert-battle-hard',
  'safe-update-concept',
  'safe-update-battle-medium',
  'safe-update-battle-hard',
  'safe-delete-concept',
  'safe-delete-battle-medium',
  'safe-delete-battle-hard',
  'transactions-commit-rollback-concept',
  'transactions-commit-rollback-battle-medium',
  'transactions-commit-rollback-battle-hard',
  'atomicity-and-consistency-concept',
  'atomicity-and-consistency-battle-medium',
  'atomicity-and-consistency-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_07 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-07.md', [
    'docs',
    '开发文档',
    'database-sql-foundations-complete-10-chapters',
  ]),
  {
    chapterNumber: 7,
    chapterOrdinal: '七',
    chapterKey: 'data-modification-transactions',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第7章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);

