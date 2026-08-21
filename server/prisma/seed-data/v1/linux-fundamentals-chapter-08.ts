import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'ip-addresses-interfaces',
  'ping-connectivity',
  'dns-resolution',
  'ss-listening-ports',
  'curl-http-validation',
  'network-troubleshooting',
] as const;

const QUESTION_KEYS = [
  'ip-addresses-interfaces-concept',
  'ip-addresses-interfaces-battle-medium',
  'ip-addresses-interfaces-battle-hard',
  'ping-connectivity-concept',
  'ping-connectivity-battle-medium',
  'ping-connectivity-battle-hard',
  'dns-resolution-concept',
  'dns-resolution-battle-medium',
  'dns-resolution-battle-hard',
  'ss-listening-ports-concept',
  'ss-listening-ports-battle-medium',
  'ss-listening-ports-battle-hard',
  'curl-http-validation-concept',
  'curl-http-validation-battle-medium',
  'curl-http-validation-battle-hard',
  'network-troubleshooting-concept',
  'network-troubleshooting-battle-medium',
  'network-troubleshooting-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_08 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-08.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 8,
    chapterOrdinal: '八',
    chapterKey: 'linux-fundamentals-chapter-08',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: 'Linux 网络基础与常用命令章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
