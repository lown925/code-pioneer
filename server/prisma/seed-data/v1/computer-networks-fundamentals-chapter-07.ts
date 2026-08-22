import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'network-congestion', 'congestion-window', 'slow-start',
  'congestion-avoidance', 'rtt-and-timeout', 'end-to-end-performance-diagnostics',
] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_07 = parsePythonChapterSource(
  readSeedDocument('computer-networks-fundamentals-chapter-07.md', ['docs', '开发文档', 'computer-networks-fundamentals']),
  {
    chapterNumber: 7, chapterOrdinal: '七', chapterKey: 'computer-networks-fundamentals-chapter-07',
    lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: '计算机网络基础第7章章节测验', quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70, programmingLanguage: 'python', keyPrefix: 'computer-networks-fundamentals-chapter-07', questionKeyOffset: 108,
  },
);
