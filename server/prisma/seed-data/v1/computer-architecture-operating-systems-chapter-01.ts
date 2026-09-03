import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'computer-system-hierarchy',
  'program-to-machine-execution',
  'cpu-memory-io-coordination',
  'instruction-set-architecture-isa',
  'os-resource-management-role',
  'performance-correctness-system-boundary',
] as const;

const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`,
  `${key}-battle-medium`,
  `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_01 =
  parsePythonChapterSource(
    readSeedDocument('computer-architecture-operating-systems-chapter-01.md', [
      'docs',
      '开发文档',
      'computer-architecture-operating-systems',
    ]),
    {
      chapterNumber: 1,
      chapterOrdinal: '一',
      chapterKey: 'computer-architecture-operating-systems-chapter-01',
      lessonKeys: LESSON_KEYS,
      questionKeys: QUESTION_KEYS,
      quizTitle: '计算机组成原理与操作系统基础第1章章节测验',
      quizDescription:
        '检验本章计算机组成原理与操作系统基础知识。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      programmingLanguage: 'text',
      keyPrefix: 'computer-architecture-operating-systems-chapter-01',
      questionKeyOffset: 0,
    },
  );
