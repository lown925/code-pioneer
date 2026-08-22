import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'and-or-not-conditions',
  'in-and-between',
  'like-pattern-matching',
  'string-functions',
  'numeric-functions',
  'date-time-functions',
] as const;

const QUESTION_KEYS = [
  'and-or-not-conditions-concept',
  'and-or-not-conditions-battle-medium',
  'and-or-not-conditions-battle-hard',
  'in-and-between-concept',
  'in-and-between-battle-medium',
  'in-and-between-battle-hard',
  'like-pattern-matching-concept',
  'like-pattern-matching-battle-medium',
  'like-pattern-matching-battle-hard',
  'string-functions-concept',
  'string-functions-battle-medium',
  'string-functions-battle-hard',
  'numeric-functions-concept',
  'numeric-functions-battle-medium',
  'numeric-functions-battle-hard',
  'date-time-functions-concept',
  'date-time-functions-battle-medium',
  'date-time-functions-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_03 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-03.md', [
    'docs',
    '开发文档',
    'database-sql-foundations-complete-10-chapters',
  ]),
  {
    chapterNumber: 3,
    chapterOrdinal: '三',
    chapterKey: 'filters-functions',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第3章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);

