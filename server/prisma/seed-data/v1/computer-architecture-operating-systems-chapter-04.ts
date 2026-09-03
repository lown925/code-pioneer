import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'cpu-datapath',
  'fetch-decode-execute',
  'controller-and-control-signals',
  'pipeline-fundamentals',
  'data-hazards-and-forwarding',
  'control-hazards-and-branch-prediction',
] as const;

const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`,
  `${key}-battle-medium`,
  `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_04 =
  parsePythonChapterSource(
    readSeedDocument('computer-architecture-operating-systems-chapter-04.md', [
      'docs',
      '开发文档',
      'computer-architecture-operating-systems',
    ]),
    {
      chapterNumber: 4,
      chapterOrdinal: '四',
      chapterKey: 'computer-architecture-operating-systems-chapter-04',
      lessonKeys: LESSON_KEYS,
      questionKeys: QUESTION_KEYS,
      quizTitle: '计算机组成原理与操作系统基础第4章章节测验',
      quizDescription:
        '检验本章计算机组成原理与操作系统基础知识。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      programmingLanguage: 'text',
      keyPrefix: 'computer-architecture-operating-systems-chapter-04',
      questionKeyOffset: 54,
    },
  );
