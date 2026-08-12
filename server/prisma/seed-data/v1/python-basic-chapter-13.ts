import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'understand-exceptions',
  'handle-errors-with-try-except',
  'handle-specific-exception-types',
  'use-else-and-finally',
  'raise-exceptions',
  'write-reliable-exception-handling',
] as const;

const QUESTION_KEYS = [
  'identify-value-error',
  'exception-term',
  'trigger-zero-division-error',
  'try-except-value-error-output',
  'except-block-name',
  'catch-invalid-question-count',
  'identify-index-error',
  'missing-dictionary-key-error',
  'catch-zero-division-error',
  'try-else-block',
  'finally-block-name',
  'always-run-finally',
  'raise-keyword',
  'exception-object-variable',
  'raise-invalid-question-count',
  'specific-exception-handling',
  'bare-except-term',
  'catch-value-error-as-error',
] as const;

export const PYTHON_BASIC_CHAPTER_13 = parsePythonChapterSource(
  readSeedDocument('python-basic-chapter-13-formal.md'),
  {
    chapterNumber: 13,
    chapterOrdinal: '十三',
    chapterKey: 'python-exception-handling',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '异常处理章节测验',
    quizDescription:
      '检验你是否掌握常见异常类型、try、except、else、finally、raise 和清晰可靠的异常处理。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
