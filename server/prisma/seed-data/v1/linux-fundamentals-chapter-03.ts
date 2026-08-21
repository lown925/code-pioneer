import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'touch-and-mkdir',
  'cp-copy-files',
  'mv-move-rename',
  'rm-delete-safety',
  'wildcards-batch-matching',
  'file-organization-practice',
] as const;

const QUESTION_KEYS = [
  'touch-and-mkdir-concept',
  'touch-and-mkdir-battle-medium',
  'touch-and-mkdir-battle-hard',
  'cp-copy-files-concept',
  'cp-copy-files-battle-medium',
  'cp-copy-files-battle-hard',
  'mv-move-rename-concept',
  'mv-move-rename-battle-medium',
  'mv-move-rename-battle-hard',
  'rm-delete-safety-concept',
  'rm-delete-safety-battle-medium',
  'rm-delete-safety-battle-hard',
  'wildcards-batch-matching-concept',
  'wildcards-batch-matching-battle-medium',
  'wildcards-batch-matching-battle-hard',
  'file-organization-practice-concept',
  'file-organization-practice-battle-medium',
  'file-organization-practice-battle-hard',
] as const;

export const LINUX_FUNDAMENTALS_CHAPTER_03 = parsePythonChapterSource(
  readSeedDocument('linux-fundamentals-chapter-03.md', [
    'docs',
    '开发文档',
    'linux-fundamentals-complete-10-chapters',
  ]),
  {
    chapterNumber: 3,
    chapterOrdinal: '三',
    chapterKey: 'linux-fundamentals-chapter-03',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '文件与目录操作章节测验',
    quizDescription:
      '检验本章 Linux 基础与常用命令知识。提交后可查看每题答案与解析。',
    passScorePercent: 70,
    programmingLanguage: 'bash',
  },
);
