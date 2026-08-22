import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'routing-and-forwarding', 'static-routing', 'distance-vector-routing',
  'link-state-routing', 'autonomous-systems-and-bgp', 'routing-fault-analysis',
] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_05 = parsePythonChapterSource(
  readSeedDocument('computer-networks-fundamentals-chapter-05.md', ['docs', '开发文档', 'computer-networks-fundamentals']),
  {
    chapterNumber: 5, chapterOrdinal: '五', chapterKey: 'computer-networks-fundamentals-chapter-05',
    lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: '计算机网络基础第5章章节测验', quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70, programmingLanguage: 'python', keyPrefix: 'computer-networks-fundamentals-chapter-05', questionKeyOffset: 72,
  },
);
