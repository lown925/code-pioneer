import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'cpu-scheduling-goals',
  'fcfs-sjf-and-time-slicing',
  'race-conditions-and-critical-sections',
  'mutexes-and-semaphores',
  'condition-variables-and-wait-notify',
  'deadlock-conditions-and-handling',
] as const;

const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`,
  `${key}-battle-medium`,
  `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_08 =
  parsePythonChapterSource(
    readSeedDocument('computer-architecture-operating-systems-chapter-08.md', [
      'docs',
      '开发文档',
      'computer-architecture-operating-systems',
    ]),
    {
      chapterNumber: 8,
      chapterOrdinal: '八',
      chapterKey: 'computer-architecture-operating-systems-chapter-08',
      lessonKeys: LESSON_KEYS,
      questionKeys: QUESTION_KEYS,
      quizTitle: '计算机组成原理与操作系统基础第8章章节测验',
      quizDescription:
        '检验本章计算机组成原理与操作系统基础知识。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      programmingLanguage: 'python',
      keyPrefix: 'computer-architecture-operating-systems-chapter-08',
      questionKeyOffset: 126,
    },
  );
