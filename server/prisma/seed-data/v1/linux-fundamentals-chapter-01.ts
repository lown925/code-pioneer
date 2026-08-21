import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'linux-shell-and-distro',
  'terminal-and-first-command',
  'command-options-and-quotes',
  'command-help',
  'standard-streams',
  'exit-status-and-conditions',
] as const;

const QUESTION_KEYS = [
  'linux-shell-and-distro-concept',
  'linux-shell-and-distro-battle-medium',
  'linux-shell-and-distro-battle-hard',
  'terminal-and-first-command-concept',
  'terminal-and-first-command-battle-medium',
  'terminal-and-first-command-battle-hard',
  'command-options-and-quotes-concept',
  'command-options-and-quotes-battle-medium',
  'command-options-and-quotes-battle-hard',
  'command-help-concept',
  'command-help-battle-medium',
  'command-help-battle-hard',
  'standard-streams-concept',
  'standard-streams-battle-medium',
  'standard-streams-battle-hard',
  'exit-status-and-conditions-concept',
  'exit-status-and-conditions-battle-medium',
  'exit-status-and-conditions-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_01 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-01.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 1,
    chapterOrdinal: '一',
    chapterKey: 'linux-fundamentals-chapter-01',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: 'Linux 与终端入门章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
