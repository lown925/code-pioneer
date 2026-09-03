import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'ipv4-addresses-and-datagrams', 'subnet-masks-and-cidr', 'subnetting',
  'routing-tables-and-longest-prefix', 'arp-address-resolution', 'icmp-and-network-diagnostics',
] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_04 = parsePythonChapterSource(
  readSeedDocument('computer-networks-fundamentals-chapter-04.md', ['docs', '开发文档', 'computer-networks-fundamentals']),
  {
    chapterNumber: 4, chapterOrdinal: '四', chapterKey: 'computer-networks-fundamentals-chapter-04',
    lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: '计算机网络基础第4章章节测验', quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70, programmingLanguage: 'text', keyPrefix: 'computer-networks-fundamentals-chapter-04', questionKeyOffset: 54,
  },
);
