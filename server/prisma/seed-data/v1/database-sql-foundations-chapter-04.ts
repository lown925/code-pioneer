import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'count-sum-avg',
  'min-max-and-null',
  'group-by-basics',
  'multiple-column-grouping',
  'having-filtering',
  'aggregate-analysis',
] as const;

const QUESTION_KEYS = [
  'count-sum-avg-concept',
  'count-sum-avg-battle-medium',
  'count-sum-avg-battle-hard',
  'min-max-and-null-concept',
  'min-max-and-null-battle-medium',
  'min-max-and-null-battle-hard',
  'group-by-basics-concept',
  'group-by-basics-battle-medium',
  'group-by-basics-battle-hard',
  'multiple-column-grouping-concept',
  'multiple-column-grouping-battle-medium',
  'multiple-column-grouping-battle-hard',
  'having-filtering-concept',
  'having-filtering-battle-medium',
  'having-filtering-battle-hard',
  'aggregate-analysis-concept',
  'aggregate-analysis-battle-medium',
  'aggregate-analysis-battle-hard',
] as const;

export const DATABASE_SQL_FOUNDATIONS_CHAPTER_04 = parsePythonChapterSource(
  readSeedDocument('database-sql-foundations-chapter-04.md', [
    'docs',
    '开发文档',
    'database-sql-foundations',
  ]),
  {
    chapterNumber: 4,
    chapterOrdinal: '四',
    chapterKey: 'aggregation-grouping',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '数据库与 SQL 基础第4章章节测验',
    quizDescription: '检验本章数据库与 SQL 基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'sql',
  },
);
