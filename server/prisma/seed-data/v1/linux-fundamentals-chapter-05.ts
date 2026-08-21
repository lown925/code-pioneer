import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'users-groups-identity',
  'rwx-permission-bits',
  'chmod-symbolic-mode',
  'chmod-numeric-mode',
  'chown-ownership',
  'sudo-least-privilege',
] as const;

const QUESTION_KEYS = [
  'users-groups-identity-concept',
  'users-groups-identity-battle-medium',
  'users-groups-identity-battle-hard',
  'rwx-permission-bits-concept',
  'rwx-permission-bits-battle-medium',
  'rwx-permission-bits-battle-hard',
  'chmod-symbolic-mode-concept',
  'chmod-symbolic-mode-battle-medium',
  'chmod-symbolic-mode-battle-hard',
  'chmod-numeric-mode-concept',
  'chmod-numeric-mode-battle-medium',
  'chmod-numeric-mode-battle-hard',
  'chown-ownership-concept',
  'chown-ownership-battle-medium',
  'chown-ownership-battle-hard',
  'sudo-least-privilege-concept',
  'sudo-least-privilege-battle-medium',
  'sudo-least-privilege-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_05 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-05.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 5,
    chapterOrdinal: '五',
    chapterKey: 'linux-fundamentals-chapter-05',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '用户、用户组与权限章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
