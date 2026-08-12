import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'understand-classes-and-objects',
  'initialize-objects-with-init',
  'manage-instance-attributes',
  'define-instance-methods',
  'use-inheritance-and-overriding',
  'design-classes-and-applications',
] as const;

const QUESTION_KEYS = [
  'class-definition-keyword',
  'object-instance-term',
  'instantiate-player-object',
  'object-initializer-method',
  'self-parameter',
  'save-nickname-instance-attribute',
  'independent-object-state-output',
  'object-attribute-access',
  'update-course-progress-attribute',
  'call-show-profile-method',
  'class-method-term',
  'increment-rating-method',
  'inherit-user-class',
  'super-function',
  'initialize-parent-nickname',
  'class-use-case',
  'data-and-behavior',
  'calculate-battle-score',
] as const;

export const PYTHON_BASIC_CHAPTER_14 = parsePythonChapterSource(
  readSeedDocument('python-basic-chapter-14-formal.md'),
  {
    chapterNumber: 14,
    chapterOrdinal: '十四',
    chapterKey: 'python-object-oriented-basics',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '面向对象基础章节测验',
    quizDescription:
      '检验你是否掌握类、对象、属性、实例方法、构造初始化、继承、方法重写和基础类设计。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
