import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'confidentiality-integrity-and-authentication', 'symmetric-and-asymmetric-encryption',
  'hashes-and-digital-signatures', 'tls-trust-chain', 'common-network-attacks',
  'firewalls-and-least-privilege',
] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_09 = parsePythonChapterSource(
  readSeedDocument('computer-networks-fundamentals-chapter-09.md', ['docs', '开发文档', 'computer-networks-fundamentals']),
  {
    chapterNumber: 9, chapterOrdinal: '九', chapterKey: 'computer-networks-fundamentals-chapter-09',
    lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: '计算机网络基础第9章章节测验', quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70, programmingLanguage: 'python', keyPrefix: 'computer-networks-fundamentals-chapter-09', questionKeyOffset: 144,
  },
);
