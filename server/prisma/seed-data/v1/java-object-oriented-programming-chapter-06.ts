import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = ['exception-hierarchy', 'try-catch', 'finally', 'throws-and-throw', 'custom-exceptions', 'try-with-resources'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];

export const JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_06 = parsePythonChapterSource(
  readSeedDocument('java-object-oriented-programming-chapter-06.md', ['docs', '开发文档', 'java-object-oriented-programming']),
  {
    chapterNumber: 6, chapterOrdinal: '六', chapterKey: 'java-object-oriented-programming-chapter-06', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: 'Java 面向对象程序设计第6章章节测验', quizDescription: '检验本章 Java 面向对象程序设计知识。提交后可查看每题答案与解析。', passScorePercent: 70,
    programmingLanguage: 'java', keyPrefix: 'java-object-oriented-programming-chapter-06', questionKeyOffset: 90,
  },
);
