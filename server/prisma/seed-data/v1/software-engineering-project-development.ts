import type { SeedCourse } from '../types';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_01 } from './software-engineering-project-development-chapter-01';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_02 } from './software-engineering-project-development-chapter-02';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_03 } from './software-engineering-project-development-chapter-03';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_04 } from './software-engineering-project-development-chapter-04';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_05 } from './software-engineering-project-development-chapter-05';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_06 } from './software-engineering-project-development-chapter-06';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_07 } from './software-engineering-project-development-chapter-07';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_08 } from './software-engineering-project-development-chapter-08';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_09 } from './software-engineering-project-development-chapter-09';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_10 } from './software-engineering-project-development-chapter-10';
export const SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_COURSE: SeedCourse = {
  version: 'v1', key: 'software-engineering-project-development', slug: 'software-engineering-project-development', title: '软件工程与项目开发',
  summary: '从需求、设计、协作、测试和交付出发，建立可验证、可维护的软件项目开发能力。',
  description: '课程覆盖软件生命周期、需求分析、架构设计、Git 协作、重构、测试、API、CI/CD、迭代管理和完整项目实践。',
  category: 'SOFTWARE_ENGINEERING', language: 'Python', difficulty: 'INTERMEDIATE', estimatedMinutes: 1200,
  targetAudience: '希望系统掌握软件工程方法和项目开发实践的学习者。',
  learningObjectives: ['理解软件生命周期、需求、质量、成本、风险和技术债之间的关系','能够使用模块、分层、接口和契约组织可维护设计','能够运用 Git、测试、API、CI/CD 和迭代方法推进团队交付','能够从需求到发布完成可验证、可回滚的综合项目实践'],
  status: 'PUBLISHED', sortOrder: 800, battleSkillCode: 'PYTHON', chapters: [SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_01, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_02, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_03, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_04, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_05, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_06, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_07, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_08, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_09, SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_10],
};
