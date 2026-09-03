import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'network-edge-and-core',
  'protocols-and-standards',
  'osi-and-tcp-ip-layers',
  'encapsulation-and-decapsulation',
  'switching-and-network-performance',
  'end-to-end-communication-path',
] as const;

const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [
  `${key}-concept`,
  `${key}-battle-medium`,
  `${key}-battle-hard`,
]) as readonly string[];

export const COMPUTER_NETWORKS_FUNDAMENTALS_CHAPTER_01 =
  parsePythonChapterSource(
    readSeedDocument('computer-networks-fundamentals-chapter-01.md', [
      'docs',
      '开发文档',
      'computer-networks-fundamentals',
    ]),
    {
      chapterNumber: 1,
      chapterOrdinal: '一',
      chapterKey: 'computer-networks-fundamentals-chapter-01',
      lessonKeys: LESSON_KEYS,
      questionKeys: QUESTION_KEYS,
      quizTitle: '计算机网络基础第1章章节测验',
      quizDescription: '检验本章计算机网络基础知识。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      programmingLanguage: 'text',
      keyPrefix: 'computer-networks-fundamentals-chapter-01',
      questionKeyOffset: 0,
    },
  );
