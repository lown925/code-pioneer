import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = ['member-fields-and-methods', 'constructors', 'this-keyword', 'access-modifiers', 'encapsulation-and-javabean', 'object-references-and-memory'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];

export const JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_03 = parsePythonChapterSource(
  readSeedDocument('java-object-oriented-programming-chapter-03.md', ['docs', '开发文档', 'java-object-oriented-programming']),
  {
    chapterNumber: 3, chapterOrdinal: '三', chapterKey: 'java-object-oriented-programming-chapter-03', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: 'Java 面向对象程序设计第3章章节测验', quizDescription: '检验本章 Java 面向对象程序设计知识。提交后可查看每题答案与解析。', passScorePercent: 70,
    programmingLanguage: 'java', keyPrefix: 'java-object-oriented-programming-chapter-03', questionKeyOffset: 36,
  },
);
