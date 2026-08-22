import type { SeedCourse } from '../types';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_01 } from './computer-architecture-operating-systems-chapter-01';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_02 } from './computer-architecture-operating-systems-chapter-02';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_03 } from './computer-architecture-operating-systems-chapter-03';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_04 } from './computer-architecture-operating-systems-chapter-04';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_05 } from './computer-architecture-operating-systems-chapter-05';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_06 } from './computer-architecture-operating-systems-chapter-06';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_07 } from './computer-architecture-operating-systems-chapter-07';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_08 } from './computer-architecture-operating-systems-chapter-08';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_09 } from './computer-architecture-operating-systems-chapter-09';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_10 } from './computer-architecture-operating-systems-chapter-10';

export const COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE: SeedCourse = {
  version: 'v1',
  key: 'computer-architecture-operating-systems',
  slug: 'computer-architecture-operating-systems',
  title: '计算机组成原理与操作系统基础',
  summary:
    '从数据表示、CPU、存储与 I/O 出发，建立操作系统进程、内存和文件系统的系统理解。',
  description:
    '课程覆盖计算机系统层次、数据表示、指令执行、CPU 流水线、Cache、I/O、中断、进程线程、调度同步、虚拟内存和文件系统。',
  category: 'SYSTEM',
  language: 'Python',
  difficulty: 'INTERMEDIATE',
  estimatedMinutes: 1200,
  targetAudience: '希望系统掌握计算机组成原理和操作系统基础概念的学习者。',
  learningObjectives: [
    '理解程序、指令、CPU、存储器、I/O 和操作系统之间的层次关系',
    '能够分析二进制、补码、浮点数和指令执行的基本机制',
    '能够解释 Cache、流水线、中断、DMA、进程线程和 CPU 调度的工作方式',
    '能够分析同步、死锁、分页、虚拟内存、文件系统和系统调用的状态变化',
  ],
  status: 'PUBLISHED',
  sortOrder: 600,
  battleSkillCode: 'PYTHON',
  chapters: [
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_01,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_02,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_03,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_04,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_05,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_06,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_07,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_08,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_09,
    COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_CHAPTER_10,
  ],
};
