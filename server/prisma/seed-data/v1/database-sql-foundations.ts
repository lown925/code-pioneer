import type { SeedCourse } from '../types';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_01 } from './database-sql-foundations-chapter-01';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_02 } from './database-sql-foundations-chapter-02';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_03 } from './database-sql-foundations-chapter-03';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_04 } from './database-sql-foundations-chapter-04';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_05 } from './database-sql-foundations-chapter-05';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_06 } from './database-sql-foundations-chapter-06';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_07 } from './database-sql-foundations-chapter-07';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_08 } from './database-sql-foundations-chapter-08';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_09 } from './database-sql-foundations-chapter-09';
import { DATABASE_SQL_FOUNDATIONS_CHAPTER_10 } from './database-sql-foundations-chapter-10';

export const DATABASE_SQL_FOUNDATIONS_COURSE: SeedCourse = {
  version: 'v1',
  key: 'database-sql-foundations',
  slug: 'database-sql-foundations',
  title: '数据库与 SQL 基础',
  summary: '从关系型数据库和 SQL 查询开始，建立数据建模、查询分析与事务实践能力。',
  description:
    '课程覆盖数据类型、过滤、聚合、连接、子查询、写入、事务、约束、索引、窗口函数和查询优化，使用通用 SQL 示例进行练习。',
  category: 'DATABASE',
  language: 'SQL',
  difficulty: 'BEGINNER',
  estimatedMinutes: 1200,
  targetAudience: '希望掌握数据库与 SQL 基础查询、设计和排错方法的初学者。',
  learningObjectives: [
    '理解关系型数据库、表、行、列、主键与外键的基本概念',
    '能够使用 SELECT、过滤、排序、聚合和连接完成常见查询',
    '能够阅读并拆解子查询、集合、CTE 和窗口函数',
    '能够安全执行 INSERT、UPDATE、DELETE 与事务操作',
    '能够使用约束、索引和 EXPLAIN 改进数据设计与查询性能',
  ],
  status: 'PUBLISHED',
  sortOrder: 500,
  battleSkillCode: 'PYTHON',
  chapters: [
    DATABASE_SQL_FOUNDATIONS_CHAPTER_01,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_02,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_03,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_04,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_05,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_06,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_07,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_08,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_09,
    DATABASE_SQL_FOUNDATIONS_CHAPTER_10,
  ],
};

