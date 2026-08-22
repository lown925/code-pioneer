import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'io-devices-and-controllers',
  'programmed-io-and-polling',
  'interrupt-mechanism',
  'dma-data-transfer',
  'device-drivers-and-operating-system',
  'io-performance-and-reliability',
] as const;

const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`,
  `${key}-battle-medium`,
  `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_06 =
  parsePythonChapterSource(
    readSeedDocument('computer-architecture-operating-systems-chapter-06.md', [
      'docs',
      '开发文档',
      'computer-architecture-operating-systems',
    ]),
    {
      chapterNumber: 6,
      chapterOrdinal: '六',
      chapterKey: 'computer-architecture-operating-systems-chapter-06',
      lessonKeys: LESSON_KEYS,
      questionKeys: QUESTION_KEYS,
      quizTitle: '计算机组成原理与操作系统基础第6章章节测验',
      quizDescription:
        '检验本章计算机组成原理与操作系统基础知识。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      programmingLanguage: 'python',
      keyPrefix: 'computer-architecture-operating-systems-chapter-06',
      questionKeyOffset: 90,
    },
  );
