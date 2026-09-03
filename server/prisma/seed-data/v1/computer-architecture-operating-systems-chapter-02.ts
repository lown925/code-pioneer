import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'binary-hexadecimal-bit-patterns',
  'unsigned-integers-and-range',
  'twos-complement-signed-integers',
  'bit-operations-and-masks',
  'floating-point-ieee754',
  'overflow-rounding-numeric-reliability',
] as const;

const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`,
  `${key}-battle-medium`,
  `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_02 =
  parsePythonChapterSource(
    readSeedDocument('computer-architecture-operating-systems-chapter-02.md', [
      'docs',
      '开发文档',
      'computer-architecture-operating-systems',
    ]),
    {
      chapterNumber: 2,
      chapterOrdinal: '二',
      chapterKey: 'computer-architecture-operating-systems-chapter-02',
      lessonKeys: LESSON_KEYS,
      questionKeys: QUESTION_KEYS,
      quizTitle: '计算机组成原理与操作系统基础第2章章节测验',
      quizDescription:
        '检验本章计算机组成原理与操作系统基础知识。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      programmingLanguage: 'text',
      keyPrefix: 'computer-architecture-operating-systems-chapter-02',
      questionKeyOffset: 18,
    },
  );
