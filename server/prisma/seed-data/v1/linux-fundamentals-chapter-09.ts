import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'shell-variables-expansion',
  'command-substitution',
  'if-conditions',
  'for-loops',
  'shell-functions',
  'script-robustness',
] as const;

const QUESTION_KEYS = [
  'shell-variables-expansion-concept',
  'shell-variables-expansion-battle-medium',
  'shell-variables-expansion-battle-hard',
  'command-substitution-concept',
  'command-substitution-battle-medium',
  'command-substitution-battle-hard',
  'if-conditions-concept',
  'if-conditions-battle-medium',
  'if-conditions-battle-hard',
  'for-loops-concept',
  'for-loops-battle-medium',
  'for-loops-battle-hard',
  'shell-functions-concept',
  'shell-functions-battle-medium',
  'shell-functions-battle-hard',
  'script-robustness-concept',
  'script-robustness-battle-medium',
  'script-robustness-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_09 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-09.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 9,
    chapterOrdinal: '九',
    chapterKey: 'linux-fundamentals-chapter-09',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: 'Shell 基础与脚本章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
