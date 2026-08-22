import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = ['string-immutability', 'stringbuilder', 'wrapper-types-and-autoboxing', 'common-object-methods', 'equals-and-hashcode', 'enum-types'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];

export const JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_05 = parsePythonChapterSource(
  readSeedDocument('java-object-oriented-programming-chapter-05.md', ['docs', '开发文档', 'java-object-oriented-programming']),
  {
    chapterNumber: 5, chapterOrdinal: '五', chapterKey: 'java-object-oriented-programming-chapter-05', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: 'Java 面向对象程序设计第5章章节测验', quizDescription: '检验本章 Java 面向对象程序设计知识。提交后可查看每题答案与解析。', passScorePercent: 70,
    programmingLanguage: 'java', keyPrefix: 'java-object-oriented-programming-chapter-05', questionKeyOffset: 72,
  },
);
