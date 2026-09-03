import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'socket-communication-model', 'client-and-server', 'ping-and-traceroute',
  'dns-and-port-diagnostics', 'packet-capture-and-protocol-analysis',
  'url-to-page-end-to-end-path',
] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_10 = parsePythonChapterSource(
  readSeedDocument('computer-networks-fundamentals-chapter-10.md', ['docs', '开发文档', 'computer-networks-fundamentals']),
  {
    chapterNumber: 10, chapterOrdinal: '十', chapterKey: 'computer-networks-fundamentals-chapter-10',
    lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: '计算机网络基础第10章章节测验', quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70, programmingLanguage: 'text', keyPrefix: 'computer-networks-fundamentals-chapter-10', questionKeyOffset: 162,
  },
);
