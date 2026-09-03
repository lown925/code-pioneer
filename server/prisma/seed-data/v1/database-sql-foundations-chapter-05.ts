import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'foreign-keys-and-relations',
  'inner-join',
  'left-join',
  'multi-condition-join',
  'multi-table-join',
  'join-duplicates-and-debugging',
] as const;

const QUESTION_KEYS = [
  'foreign-keys-and-relations-concept',
  'foreign-keys-and-relations-battle-medium',
  'foreign-keys-and-relations-battle-hard',
  'inner-join-concept',
  'inner-join-battle-medium',
  'inner-join-battle-hard',
  'left-join-concept',
  'left-join-battle-medium',
  'left-join-battle-hard',
  'multi-condition-join-concept',
  'multi-condition-join-battle-medium',
  'multi-condition-join-battle-hard',
  'multi-table-join-concept',
  'multi-table-join-battle-medium',
  'multi-table-join-battle-hard',
  'join-duplicates-and-debugging-concept',
  'join-duplicates-and-debugging-battle-medium',
  'join-duplicates-and-debugging-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_05 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-05.md', [
    'docs',
    '开发文档',
    'database-sql-foundations',
  ]),
  {
    chapterNumber: 5,
    chapterOrdinal: '五',
    chapterKey: 'joins-relations',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第5章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);
