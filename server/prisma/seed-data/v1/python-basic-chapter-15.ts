import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const CHAPTER_SOURCE_PATH = resolve(
  process.cwd(),
  '..',
  'docs',
  'python-basic-chapter-15-regenerated.md',
);

const LESSON_KEYS = [
  'analyze-requirements-and-data',
  'design-project-classes',
  'implement-learning-records',
  'implement-battle-records-and-statistics',
  'persist-json-data',
  'build-menu-and-finish-project',
] as const;

const QUESTION_KEYS = [
  'analyze-project-requirements',
  'task-decomposition-term',
  'add-battle-records-field',
  'battle-record-class',
  'learning-record-collection',
  'append-battle-record',
  'missing-learning-record-return',
  'completed-progress-value',
  'calculate-average-progress',
  'avoid-zero-division-win-rate',
  'draw-result-value',
  'calculate-win-rate',
  'serialize-custom-object',
  'to-dict-method',
  'dump-user-dictionary',
  'menu-loop-structure',
  'main-module-name',
  'break-menu-loop',
] as const;

export const PYTHON_BASIC_CHAPTER_15 = parsePythonChapterSource(
  readFileSync(CHAPTER_SOURCE_PATH, 'utf8'),
  {
    chapterNumber: 15,
    chapterOrdinal: '十五',
    chapterKey: 'python-basics-capstone-project',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: 'Python 基础综合实战章节测验',
    quizDescription:
      '检验你是否能够综合运用数据结构、函数、类、文件、JSON、异常处理和菜单循环完成基础项目。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
