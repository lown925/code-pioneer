import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'ports-and-sockets', 'udp-datagrams', 'tcp-connections-and-sequence',
  'acknowledgement-and-retransmission', 'flow-control', 'tcp-setup-and-teardown',
] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_06 = parsePythonChapterSource(
  readSeedDocument('computer-networks-fundamentals-chapter-06.md', ['docs', '开发文档', 'computer-networks-fundamentals']),
  {
    chapterNumber: 6, chapterOrdinal: '六', chapterKey: 'computer-networks-fundamentals-chapter-06',
    lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: '计算机网络基础第6章章节测验', quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70, programmingLanguage: 'python', keyPrefix: 'computer-networks-fundamentals-chapter-06', questionKeyOffset: 90,
  },
);
