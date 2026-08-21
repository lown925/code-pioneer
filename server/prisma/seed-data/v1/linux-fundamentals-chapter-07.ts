import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'packages-and-distros',
  'apt-workflow',
  'dnf-workflow',
  'systemd-systemctl',
  'service-lifecycle',
  'service-enable-status',
] as const;

const QUESTION_KEYS = [
  'packages-and-distros-concept',
  'packages-and-distros-battle-medium',
  'packages-and-distros-battle-hard',
  'apt-workflow-concept',
  'apt-workflow-battle-medium',
  'apt-workflow-battle-hard',
  'dnf-workflow-concept',
  'dnf-workflow-battle-medium',
  'dnf-workflow-battle-hard',
  'systemd-systemctl-concept',
  'systemd-systemctl-battle-medium',
  'systemd-systemctl-battle-hard',
  'service-lifecycle-concept',
  'service-lifecycle-battle-medium',
  'service-lifecycle-battle-hard',
  'service-enable-status-concept',
  'service-enable-status-battle-medium',
  'service-enable-status-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_07 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-07.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 7,
    chapterOrdinal: '七',
    chapterKey: 'linux-fundamentals-chapter-07',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '软件包与系统服务章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
