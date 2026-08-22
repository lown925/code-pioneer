import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = ['functional-interfaces', 'lambda-expressions', 'method-references', 'stream-creation-and-intermediate-operations', 'terminal-operations-and-collectors', 'optional-and-null-handling'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];

export const JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_09 = parsePythonChapterSource(
  readSeedDocument('java-object-oriented-programming-chapter-09.md', ['docs', '开发文档', 'java-object-oriented-programming']),
  {
    chapterNumber: 9, chapterOrdinal: '九', chapterKey: 'java-object-oriented-programming-chapter-09', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: 'Java 面向对象程序设计第9章章节测验', quizDescription: '检验本章 Java 面向对象程序设计知识。提交后可查看每题答案与解析。', passScorePercent: 70,
    programmingLanguage: 'java', keyPrefix: 'java-object-oriented-programming-chapter-09', questionKeyOffset: 144,
  },
);
