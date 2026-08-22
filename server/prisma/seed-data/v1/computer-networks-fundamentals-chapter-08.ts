import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'dns-name-resolution', 'http-requests-and-responses', 'http-connections-and-cache',
  'https-and-tls', 'email-protocols', 'application-layer-protocol-analysis',
] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_08 = parsePythonChapterSource(
  readSeedDocument('computer-networks-fundamentals-chapter-08.md', ['docs', '开发文档', 'computer-networks-fundamentals']),
  {
    chapterNumber: 8, chapterOrdinal: '八', chapterKey: 'computer-networks-fundamentals-chapter-08',
    lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: '计算机网络基础第8章章节测验', quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70, programmingLanguage: 'python', keyPrefix: 'computer-networks-fundamentals-chapter-08', questionKeyOffset: 126,
  },
);
