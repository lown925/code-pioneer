import type { SeedCourse } from '../types';
import { SPARK_DATA_PROCESSING_CHAPTER_01 } from './spark-data-processing-chapter-01';
import { SPARK_DATA_PROCESSING_CHAPTER_02 } from './spark-data-processing-chapter-02';
import { SPARK_DATA_PROCESSING_CHAPTER_03 } from './spark-data-processing-chapter-03';
import { SPARK_DATA_PROCESSING_CHAPTER_04 } from './spark-data-processing-chapter-04';
import { SPARK_DATA_PROCESSING_CHAPTER_05 } from './spark-data-processing-chapter-05';
import { SPARK_DATA_PROCESSING_CHAPTER_06 } from './spark-data-processing-chapter-06';
import { SPARK_DATA_PROCESSING_CHAPTER_07 } from './spark-data-processing-chapter-07';
import { SPARK_DATA_PROCESSING_CHAPTER_08 } from './spark-data-processing-chapter-08';
import { SPARK_DATA_PROCESSING_CHAPTER_09 } from './spark-data-processing-chapter-09';
import { SPARK_DATA_PROCESSING_CHAPTER_10 } from './spark-data-processing-chapter-10';

export const SPARK_DATA_PROCESSING_COURSE: SeedCourse = {
  version: 'v1', key: 'spark-data-processing', slug: 'spark-data-processing', title: 'Spark 数据处理',
  summary: '从 Spark 执行模型、RDD 与 DataFrame 到流处理和性能优化，建立分布式数据处理实践能力。',
  description: '课程覆盖 Spark 架构、RDD、Pair RDD、DataFrame、Spark SQL、数据源、执行计划、资源管理、Structured Streaming 和综合项目。',
  category: 'BIG_DATA', language: 'Python', difficulty: 'INTERMEDIATE', estimatedMinutes: 1200,
  targetAudience: '已具备 Python 与大数据基础，希望掌握 PySpark 数据处理、性能分析和批流项目实践的学习者。',
  learningObjectives: ['理解 Spark 应用架构、惰性执行、Stage、Task 与 Shuffle 机制','能够使用 RDD、DataFrame 和 Spark SQL 完成数据转换、聚合与关联','能够分析分区、缓存、资源配置、数据倾斜和执行计划','能够设计包含离线 ETL、实时计算、质量校验和稳定性保障的 Spark 项目'],
  status: 'PUBLISHED', sortOrder: 1000, battleSkillCode: 'PYTHON', chapters: [SPARK_DATA_PROCESSING_CHAPTER_01, SPARK_DATA_PROCESSING_CHAPTER_02, SPARK_DATA_PROCESSING_CHAPTER_03, SPARK_DATA_PROCESSING_CHAPTER_04, SPARK_DATA_PROCESSING_CHAPTER_05, SPARK_DATA_PROCESSING_CHAPTER_06, SPARK_DATA_PROCESSING_CHAPTER_07, SPARK_DATA_PROCESSING_CHAPTER_08, SPARK_DATA_PROCESSING_CHAPTER_09, SPARK_DATA_PROCESSING_CHAPTER_10],
};
