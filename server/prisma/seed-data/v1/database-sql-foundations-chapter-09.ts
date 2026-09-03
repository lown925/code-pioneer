import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'views-basics',
  'window-over',
  'row-number-ranking',
  'rank-and-dense-rank',
  'partition-by',
  'window-aggregates',
] as const;

const QUESTION_KEYS = [
  'views-basics-concept',
  'views-basics-battle-medium',
  'views-basics-battle-hard',
  'window-over-concept',
  'window-over-battle-medium',
  'window-over-battle-hard',
  'row-number-ranking-concept',
  'row-number-ranking-battle-medium',
  'row-number-ranking-battle-hard',
  'rank-and-dense-rank-concept',
  'rank-and-dense-rank-battle-medium',
  'rank-and-dense-rank-battle-hard',
  'partition-by-concept',
  'partition-by-battle-medium',
  'partition-by-battle-hard',
  'window-aggregates-concept',
  'window-aggregates-battle-medium',
  'window-aggregates-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_09 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-09.md', [
    'docs',
    '开发文档',
    'database-sql-foundations',
  ]),
  {
    chapterNumber: 9,
    chapterOrdinal: '九',
    chapterKey: 'views-window-functions',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第9章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);
