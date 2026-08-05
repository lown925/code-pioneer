import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const CHAPTER_SOURCE_PATH = resolve(
  process.cwd(),
  '..',
  'docs',
  'python-basic-chapter-12-formal.md',
);

const LESSON_KEYS = [
  'understand-files-and-open',
  'read-text-files',
  'write-and-append-text',
  'manage-files-paths-and-errors',
  'convert-json-strings',
  'persist-structured-json-data',
] as const;

const QUESTION_KEYS = [
  'open-file-function',
  'read-mode-name',
  'open-learning-file-read-mode',
  'read-entire-file-content',
  'read-one-line-method',
  'read-all-lines-as-list',
  'append-mode-preserves-content',
  'overwrite-write-mode',
  'append-battle-history',
  'with-auto-closes-file',
  'missing-file-exception',
  'catch-file-not-found',
  'dictionary-to-json-string',
  'parse-json-string',
  'serialize-player-json-text',
  'read-json-file-object',
  'write-json-file-function',
  'load-player-json-file',
] as const;

export const PYTHON_BASIC_CHAPTER_12 = parsePythonChapterSource(
  readFileSync(CHAPTER_SOURCE_PATH, 'utf8'),
  {
    chapterNumber: 12,
    chapterOrdinal: '十二',
    chapterKey: 'python-file-operations-and-json',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '文件操作与 JSON 章节测验',
    quizDescription:
      '检验你是否掌握文本文件读写、with 与文件异常，以及 JSON 字符串和文件操作。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
