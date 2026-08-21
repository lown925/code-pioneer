import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'linux-directory-tree',
  'pwd-working-directory',
  'ls-directory-content',
  'cd-directory-switching',
  'absolute-relative-paths',
  'safe-path-navigation',
] as const;

const QUESTION_KEYS = [
  'linux-directory-tree-concept',
  'linux-directory-tree-battle-medium',
  'linux-directory-tree-battle-hard',
  'pwd-working-directory-concept',
  'pwd-working-directory-battle-medium',
  'pwd-working-directory-battle-hard',
  'ls-directory-content-concept',
  'ls-directory-content-battle-medium',
  'ls-directory-content-battle-hard',
  'cd-directory-switching-concept',
  'cd-directory-switching-battle-medium',
  'cd-directory-switching-battle-hard',
  'absolute-relative-paths-concept',
  'absolute-relative-paths-battle-medium',
  'absolute-relative-paths-battle-hard',
  'safe-path-navigation-concept',
  'safe-path-navigation-battle-medium',
  'safe-path-navigation-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_02 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-02.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 2,
    chapterOrdinal: '二',
    chapterKey: 'linux-fundamentals-chapter-02',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '文件系统与目录导航章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
