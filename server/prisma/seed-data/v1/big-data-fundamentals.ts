import type { SeedCourse } from '../types';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_01 } from './big-data-fundamentals-chapter-01';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_02 } from './big-data-fundamentals-chapter-02';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_03 } from './big-data-fundamentals-chapter-03';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_04 } from './big-data-fundamentals-chapter-04';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_05 } from './big-data-fundamentals-chapter-05';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_06 } from './big-data-fundamentals-chapter-06';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_07 } from './big-data-fundamentals-chapter-07';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_08 } from './big-data-fundamentals-chapter-08';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_09 } from './big-data-fundamentals-chapter-09';
import { BIG_DATA_FUNDAMENTALS_CHAPTER_10 } from './big-data-fundamentals-chapter-10';
export const BIG_DATA_FUNDAMENTALS_COURSE: SeedCourse = {
  version: 'v1', key: 'big-data-fundamentals', slug: 'big-data-fundamentals', title: '大数据技术基础',
  summary: '从数据工程、分布式存储计算、数仓、消息流和实时处理出发，建立大数据平台的系统理解。',
  description: '课程覆盖大数据特征、HDFS、MapReduce、Hive、NoSQL、Kafka、流处理、ETL、资源调度和综合数据管道。',
  category: 'BIG_DATA', language: 'Python', difficulty: 'INTERMEDIATE', estimatedMinutes: 1200,
  targetAudience: '希望系统掌握大数据平台原理、数据工程流程和分布式处理方法的学习者。',
  learningObjectives: ['理解大数据特征、数据工程生命周期和典型技术生态','能够分析 HDFS、MapReduce、Hive、NoSQL 和 Kafka 的核心机制','能够处理批流一体、窗口、水位线、状态计算和任务容错问题','能够从采集、存储、计算、质量到监控设计完整数据管道'],
  status: 'PUBLISHED', sortOrder: 900, battleSkillCode: 'PYTHON', chapters: [BIG_DATA_FUNDAMENTALS_CHAPTER_01, BIG_DATA_FUNDAMENTALS_CHAPTER_02, BIG_DATA_FUNDAMENTALS_CHAPTER_03, BIG_DATA_FUNDAMENTALS_CHAPTER_04, BIG_DATA_FUNDAMENTALS_CHAPTER_05, BIG_DATA_FUNDAMENTALS_CHAPTER_06, BIG_DATA_FUNDAMENTALS_CHAPTER_07, BIG_DATA_FUNDAMENTALS_CHAPTER_08, BIG_DATA_FUNDAMENTALS_CHAPTER_09, BIG_DATA_FUNDAMENTALS_CHAPTER_10],
};
