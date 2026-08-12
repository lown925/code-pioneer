import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = [
  'single-branch-if-statements',
  'if-else-branches',
  'elif-multiple-branches',
  'indentation-and-code-blocks',
  'combine-multiple-conditions',
  'nested-conditionals',
] as const;

const QUESTION_KEYS = [
  'check-quiz-pass-with-if',
  'if-colon-symbol',
  'check-course-progress-complete',
  'if-else-score-output',
  'else-keyword',
  'banned-player-else-message',
  'elif-score-output',
  'elif-condition-order',
  'rating-silver-elif-condition',
  'unindented-statement-execution',
  'recommended-indentation-spaces',
  'print-progress-updated',
  'ranked-battle-combined-condition',
  'join-room-and-operator',
  'author-or-admin-delete-condition',
  'nested-login-rating-output',
  'nested-if-purpose',
  'nested-quiz-passed-condition',
] as const;

export const PYTHON_BASIC_CHAPTER_05 = parsePythonChapterSource(
  readSeedDocument('python-basic-chapter-05.md'),
  {
    chapterNumber: 5,
    chapterOrdinal: '五',
    chapterKey: 'python-conditional-statements',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '条件判断章节测验',
    quizDescription:
      '检验你是否掌握 if、elif、else、缩进、多条件判断和嵌套条件。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
