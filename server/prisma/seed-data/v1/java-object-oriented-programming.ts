import type { SeedCourse } from '../types';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_01 } from './java-object-oriented-programming-chapter-01';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_02 } from './java-object-oriented-programming-chapter-02';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_03 } from './java-object-oriented-programming-chapter-03';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_04 } from './java-object-oriented-programming-chapter-04';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_05 } from './java-object-oriented-programming-chapter-05';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_06 } from './java-object-oriented-programming-chapter-06';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_07 } from './java-object-oriented-programming-chapter-07';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_08 } from './java-object-oriented-programming-chapter-08';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_09 } from './java-object-oriented-programming-chapter-09';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_10 } from './java-object-oriented-programming-chapter-10';

export const JAVA_OBJECT_ORIENTED_PROGRAMMING_COURSE: SeedCourse = {
  version: 'v1', key: 'java-object-oriented-programming', slug: 'java-object-oriented-programming', title: 'Java 面向对象程序设计',
  summary: '从 Java 语法、类与对象出发，建立封装、继承、多态、集合、异常和现代 Java 的工程实践能力。',
  description: '课程覆盖 Java 平台、流程控制、类对象、封装继承多态、常用类、异常、集合泛型、IO、Lambda、Stream 和面向对象设计。',
  category: 'PROGRAMMING', language: 'Java', difficulty: 'INTERMEDIATE', estimatedMinutes: 1200,
  targetAudience: '希望系统掌握 Java 面向对象编程和后端工程基础的学习者。',
  learningObjectives: [
    '理解 Java 平台、JVM、基本语法、流程控制和方法参数传递',
    '能够使用类、对象、构造器、封装、继承、多态和接口组织代码',
    '能够处理字符串、集合、泛型、异常、文件 IO 和序列化边界',
    '能够使用 Lambda、Stream 和可测试的面向对象设计完成综合实践',
  ],
  status: 'PUBLISHED', sortOrder: 800, battleSkillCode: 'JAVASCRIPT',
  chapters: [
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_01,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_02,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_03,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_04,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_05,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_06,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_07,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_08,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_09,
    JAVA_OBJECT_ORIENTED_PROGRAMMING_CHAPTER_10,
  ],
};
