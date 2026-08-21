import type { SeedCourse } from '../types';
import { LINUX_FUNDAMENTALS_CHAPTER_01 } from './linux-fundamentals-chapter-01';
import { LINUX_FUNDAMENTALS_CHAPTER_02 } from './linux-fundamentals-chapter-02';
import { LINUX_FUNDAMENTALS_CHAPTER_03 } from './linux-fundamentals-chapter-03';
import { LINUX_FUNDAMENTALS_CHAPTER_04 } from './linux-fundamentals-chapter-04';
import { LINUX_FUNDAMENTALS_CHAPTER_05 } from './linux-fundamentals-chapter-05';
import { LINUX_FUNDAMENTALS_CHAPTER_06 } from './linux-fundamentals-chapter-06';
import { LINUX_FUNDAMENTALS_CHAPTER_07 } from './linux-fundamentals-chapter-07';
import { LINUX_FUNDAMENTALS_CHAPTER_08 } from './linux-fundamentals-chapter-08';
import { LINUX_FUNDAMENTALS_CHAPTER_09 } from './linux-fundamentals-chapter-09';
import { LINUX_FUNDAMENTALS_CHAPTER_10 } from './linux-fundamentals-chapter-10';

export const LINUX_FUNDAMENTALS_COURSE: SeedCourse = {
  version: 'v1',
  key: 'linux-fundamentals',
  slug: 'linux-fundamentals',
  title: 'Linux 基础与常用命令',
  summary: '从终端、文件系统和常用命令出发，建立 Linux 基础操作与排查能力。',
  description:
    '课程覆盖文件操作、文本处理、权限、进程、软件包、服务、网络、Shell 脚本和综合运维实践。',
  category: 'SYSTEM',
  language: 'Bash',
  difficulty: 'BEGINNER',
  estimatedMinutes: 1200,
  targetAudience: '希望掌握 Linux 基础操作、常用命令和安全排查流程的初学者。',
  learningObjectives: [
    '理解 Linux、发行版、Shell、目录和标准流的基础概念',
    '能够安全使用文件、文本、权限、进程、服务和网络命令',
    '能够阅读基础 Bash 命令和脚本并判断执行结果',
    '能够使用观察—判断—操作—验证流程处理常见问题',
  ],
  status: 'PUBLISHED',
  sortOrder: 400,
  battleSkillCode: 'PYTHON',
  chapters: [
    LINUX_FUNDAMENTALS_CHAPTER_01,
    LINUX_FUNDAMENTALS_CHAPTER_02,
    LINUX_FUNDAMENTALS_CHAPTER_03,
    LINUX_FUNDAMENTALS_CHAPTER_04,
    LINUX_FUNDAMENTALS_CHAPTER_05,
    LINUX_FUNDAMENTALS_CHAPTER_06,
    LINUX_FUNDAMENTALS_CHAPTER_07,
    LINUX_FUNDAMENTALS_CHAPTER_08,
    LINUX_FUNDAMENTALS_CHAPTER_09,
    LINUX_FUNDAMENTALS_CHAPTER_10,
  ],
};
