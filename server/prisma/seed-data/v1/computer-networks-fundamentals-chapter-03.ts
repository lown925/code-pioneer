import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'data-link-layer-and-frames', 'mac-addresses', 'crc-and-error-detection',
  'ethernet-mechanisms', 'switch-learning-and-forwarding', 'vlan-and-lan-segmentation',
] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_03 = parsePythonChapterSource(
  readSeedDocument('computer-networks-fundamentals-chapter-03.md', ['docs', '开发文档', 'computer-networks-fundamentals']),
  {
    chapterNumber: 3, chapterOrdinal: '三', chapterKey: 'computer-networks-fundamentals-chapter-03',
    lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: '计算机网络基础第3章章节测验', quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
    passScorePercent: 70, programmingLanguage: 'text', keyPrefix: 'computer-networks-fundamentals-chapter-03', questionKeyOffset: 36,
  },
);
