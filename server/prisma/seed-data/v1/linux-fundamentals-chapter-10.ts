import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'disk-space-observation',
  'log-troubleshooting',
  'service-health-check',
  'backup-and-verification',
  'pre-deploy-checklist',
  'observe-judge-operate-verify',
] as const;

const QUESTION_KEYS = [
  'disk-space-observation-concept',
  'disk-space-observation-battle-medium',
  'disk-space-observation-battle-hard',
  'log-troubleshooting-concept',
  'log-troubleshooting-battle-medium',
  'log-troubleshooting-battle-hard',
  'service-health-check-concept',
  'service-health-check-battle-medium',
  'service-health-check-battle-hard',
  'backup-and-verification-concept',
  'backup-and-verification-battle-medium',
  'backup-and-verification-battle-hard',
  'pre-deploy-checklist-concept',
  'pre-deploy-checklist-battle-medium',
  'pre-deploy-checklist-battle-hard',
  'observe-judge-operate-verify-concept',
  'observe-judge-operate-verify-battle-medium',
  'observe-judge-operate-verify-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_10 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-10.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 10,
    chapterOrdinal: '十',
    chapterKey: 'linux-fundamentals-chapter-10',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: 'Linux 综合运维实践章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
