import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'cat-head-tail',
  'grep-text-search',
  'sort-and-uniq',
  'wc-text-counting',
  'cut-field-extraction',
  'text-pipeline-composition',
] as const;

const QUESTION_KEYS = [
  'cat-head-tail-concept',
  'cat-head-tail-battle-medium',
  'cat-head-tail-battle-hard',
  'grep-text-search-concept',
  'grep-text-search-battle-medium',
  'grep-text-search-battle-hard',
  'sort-and-uniq-concept',
  'sort-and-uniq-battle-medium',
  'sort-and-uniq-battle-hard',
  'wc-text-counting-concept',
  'wc-text-counting-battle-medium',
  'wc-text-counting-battle-hard',
  'cut-field-extraction-concept',
  'cut-field-extraction-battle-medium',
  'cut-field-extraction-battle-hard',
  'text-pipeline-composition-concept',
  'text-pipeline-composition-battle-medium',
  'text-pipeline-composition-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_04 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-04.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 4,
    chapterOrdinal: '四',
    chapterKey: 'linux-fundamentals-chapter-04',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '文本查看、搜索与处理章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
