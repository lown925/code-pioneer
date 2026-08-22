import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = ['list-and-arraylist', 'set-and-hashset', 'map-and-hashmap', 'iterators-and-enhanced-for', 'generics-basics', 'collection-choice-and-complexity'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];

export const JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_07 = parsePythonChapterSource(
  readSeedDocument('java-object-oriented-programming-chapter-07.md', ['docs', '开发文档', 'java-object-oriented-programming']),
  {
    chapterNumber: 7, chapterOrdinal: '七', chapterKey: 'java-object-oriented-programming-chapter-07', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: 'Java 面向对象程序设计第7章章节测验', quizDescription: '检验本章 Java 面向对象程序设计知识。提交后可查看每题答案与解析。', passScorePercent: 70,
    programmingLanguage: 'java', keyPrefix: 'java-object-oriented-programming-chapter-07', questionKeyOffset: 108,
  },
);
