import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'logical-and-physical-addresses',
  'paging-and-page-tables',
  'tlb-address-translation-cache',
  'page-faults',
  'page-replacement-algorithms',
  'virtual-memory-performance-and-thrashing',
] as const;

const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`,
  `${key}-battle-medium`,
  `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_09 =
  parsePythonChapterSource(
    readSeedDocument('computer-architecture-operating-systems-chapter-09.md', [
      'docs',
      '开发文档',
      'computer-architecture-operating-systems',
    ]),
    {
      chapterNumber: 9,
      chapterOrdinal: '九',
      chapterKey: 'computer-architecture-operating-systems-chapter-09',
      lessonKeys: LESSON_KEYS,
      questionKeys: QUESTION_KEYS,
      quizTitle: '计算机组成原理与操作系统基础第9章章节测验',
      quizDescription:
        '检验本章计算机组成原理与操作系统基础知识。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      programmingLanguage: 'python',
      keyPrefix: 'computer-architecture-operating-systems-chapter-09',
      questionKeyOffset: 144,
    },
  );
