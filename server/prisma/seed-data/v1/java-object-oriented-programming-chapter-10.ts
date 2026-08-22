import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = ['responsibility-and-class-design', 'composition-over-inheritance', 'depend-on-interfaces', 'simple-layered-design', 'testability-and-refactoring', 'course-management-project'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];

export const JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_10 = parsePythonChapterSource(
  readSeedDocument('java-object-oriented-programming-chapter-10.md', ['docs', '开发文档', 'java-object-oriented-programming']),
  {
    chapterNumber: 10, chapterOrdinal: '十', chapterKey: 'java-object-oriented-programming-chapter-10', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS,
    quizTitle: 'Java 面向对象程序设计第10章章节测验', quizDescription: '检验本章 Java 面向对象程序设计知识。提交后可查看每题答案与解析。', passScorePercent: 70,
    programmingLanguage: 'java', keyPrefix: 'java-object-oriented-programming-chapter-10', questionKeyOffset: 162,
  },
);
