import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'processes-and-pids',
  'ps-process-view',
  'pgrep-process-name',
  'kill-signals',
  'foreground-background-jobs',
  'process-troubleshooting',
] as const;

const QUESTION_KEYS = [
  'processes-and-pids-concept',
  'processes-and-pids-battle-medium',
  'processes-and-pids-battle-hard',
  'ps-process-view-concept',
  'ps-process-view-battle-medium',
  'ps-process-view-battle-hard',
  'pgrep-process-name-concept',
  'pgrep-process-name-battle-medium',
  'pgrep-process-name-battle-hard',
  'kill-signals-concept',
  'kill-signals-battle-medium',
  'kill-signals-battle-hard',
  'foreground-background-jobs-concept',
  'foreground-background-jobs-battle-medium',
  'foreground-background-jobs-battle-hard',
  'process-troubleshooting-concept',
  'process-troubleshooting-battle-medium',
  'process-troubleshooting-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_06 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-06.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 6,
    chapterOrdinal: '六',
    chapterKey: 'linux-fundamentals-chapter-06',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '进程与任务管理章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
