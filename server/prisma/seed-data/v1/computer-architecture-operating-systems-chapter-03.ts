import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'machine-instruction-components',
  'registers-and-operands',
  'addressing-modes',
  'branches-jumps-and-loops',
  'function-calls-and-stack-frames',
  'analyze-program-from-instruction-sequence',
] as const;

const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`,
  `${key}-battle-medium`,
  `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_03 =
  parsePythonChapterSource(
    readSeedDocument('computer-architecture-operating-systems-chapter-03.md', [
      'docs',
      '开发文档',
      'computer-architecture-operating-systems',
    ]),
    {
      chapterNumber: 3,
      chapterOrdinal: '三',
      chapterKey: 'computer-architecture-operating-systems-chapter-03',
      lessonKeys: LESSON_KEYS,
      questionKeys: QUESTION_KEYS,
      quizTitle: '计算机组成原理与操作系统基础第3章章节测验',
      quizDescription:
        '检验本章计算机组成原理与操作系统基础知识。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      programmingLanguage: 'python',
      keyPrefix: 'computer-architecture-operating-systems-chapter-03',
      questionKeyOffset: 36,
    },
  );
