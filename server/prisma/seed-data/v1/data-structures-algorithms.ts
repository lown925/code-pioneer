import type { SeedCourse } from '../types';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_01 } from './data-structures-algorithms-chapter-01';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_02 } from './data-structures-algorithms-chapter-02';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_03 } from './data-structures-algorithms-chapter-03';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_04 } from './data-structures-algorithms-chapter-04';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_05 } from './data-structures-algorithms-chapter-05';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_06 } from './data-structures-algorithms-chapter-06';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_07 } from './data-structures-algorithms-chapter-07';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_08 } from './data-structures-algorithms-chapter-08';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_09 } from './data-structures-algorithms-chapter-09';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_10 } from './data-structures-algorithms-chapter-10';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_11 } from './data-structures-algorithms-chapter-11';
import { DATA_STRUCTURES_ALGORITHMS_CHAPTER_12 } from './data-structures-algorithms-chapter-12';

export const DATA_STRUCTURES_ALGORITHMS_COURSE: SeedCourse = {
  version: 'v1',
  key: 'data-structures-algorithms',
  slug: 'data-structures-algorithms',
  title: '数据结构与算法基础',
  summary: '从算法步骤和复杂度分析开始，逐步建立数据结构与算法的基础思维。',
  description:
    '课程使用 Python 示例讲解数据结构与算法的基本关系、问题拆解、时间复杂度和空间复杂度，帮助初学者建立可执行、可分析的编程思维。',
  category: 'GENERAL',
  language: 'Python',
  difficulty: 'BEGINNER',
  estimatedMinutes: 1440,
  targetAudience:
    '已经了解 Python 基础语法，希望开始学习数据结构、算法和复杂度分析的初学者。',
  learningObjectives: [
    '能够解释数据结构与算法分别解决什么问题',
    '能够把简单问题拆解成明确、有限、可执行的步骤',
    '能够识别 O(1)、O(log n)、O(n) 和 O(n²) 的基础程序结构',
    '能够理解时间复杂度与空间复杂度的区别',
    '能够对简单 Python 程序进行初步的算法分析',
  ],
  status: 'PUBLISHED',
  sortOrder: 300,
  battleSkillCode: 'PYTHON',
  chapters: [
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_01,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_02,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_03,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_04,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_05,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_06,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_07,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_08,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_09,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_10,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_11,
    DATA_STRUCTURES_ALGORITHMS_CHAPTER_12,
  ],
};
