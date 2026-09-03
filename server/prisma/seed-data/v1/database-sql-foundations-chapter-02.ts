import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'numeric-and-character-types',
  'date-time-and-boolean-types',
  'null-three-valued-logic',
  'aliases-and-expressions',
  'case-conditional-expression',
  'casts-and-coalesce',
] as const;

const QUESTION_KEYS = [
  'numeric-and-character-types-concept',
  'numeric-and-character-types-battle-medium',
  'numeric-and-character-types-battle-hard',
  'date-time-and-boolean-types-concept',
  'date-time-and-boolean-types-battle-medium',
  'date-time-and-boolean-types-battle-hard',
  'null-three-valued-logic-concept',
  'null-three-valued-logic-battle-medium',
  'null-three-valued-logic-battle-hard',
  'aliases-and-expressions-concept',
  'aliases-and-expressions-battle-medium',
  'aliases-and-expressions-battle-hard',
  'case-conditional-expression-concept',
  'case-conditional-expression-battle-medium',
  'case-conditional-expression-battle-hard',
  'casts-and-coalesce-concept',
  'casts-and-coalesce-battle-medium',
  'casts-and-coalesce-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_02 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-02.md', [
    'docs',
    '开发文档',
    'database-sql-foundations',
  ]),
  {
    chapterNumber: 2,
    chapterOrdinal: '二',
    chapterKey: 'data-types-null-expressions',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第2章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);
