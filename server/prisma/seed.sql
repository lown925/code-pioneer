WITH target_course AS (
  SELECT id
  FROM courses
  WHERE slug = 'python-basic'
  LIMIT 1
),
target_chapters AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY sort_order ASC, id ASC) AS rn
  FROM course_chapters
  WHERE course_id = (SELECT id FROM target_course)
    AND status = 'PUBLISHED'::"ChapterStatus"
    AND deleted_at IS NULL
)
INSERT INTO quizzes (
  id,
  chapter_id,
  title,
  description,
  pass_score_percent,
  status,
  created_at,
  updated_at
)
SELECT
  v.id,
  tc.id,
  v.title,
  v.description,
  60,
  'PUBLISHED'::"QuizStatus",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM target_chapters tc
JOIN (
  VALUES
    (
      1,
      'f9e0fffd-7d46-4a8b-8de2-0b0ea3fd1001'::uuid,
      'Python Basics Quiz 1',
      'Check your understanding of what Python is and where it is used.'
    ),
    (
      2,
      'f9e0fffd-7d46-4a8b-8de2-0b0ea3fd1002'::uuid,
      'Python Basics Quiz 2',
      'Check your understanding of basic Python syntax and output.'
    )
) AS v(rn, id, title, description)
  ON v.rn = tc.rn
ON CONFLICT (chapter_id) DO NOTHING;

WITH target_course AS (
  SELECT id
  FROM courses
  WHERE slug = 'python-basic'
  LIMIT 1
),
target_chapters AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY sort_order ASC, id ASC) AS rn
  FROM course_chapters
  WHERE course_id = (SELECT id FROM target_course)
    AND status = 'PUBLISHED'::"ChapterStatus"
    AND deleted_at IS NULL
),
target_quizzes AS (
  SELECT q.id, tc.rn
  FROM quizzes q
  JOIN target_chapters tc ON tc.id = q.chapter_id
)
INSERT INTO quiz_questions (
  id,
  quiz_id,
  type,
  content,
  explanation,
  score,
  sort_order,
  created_at,
  updated_at
)
SELECT
  qd.id,
  tq.id,
  qd.type,
  qd.content,
  qd.explanation,
  20,
  qd.sort_order,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM target_quizzes tq
JOIN (
  VALUES
    (
      1,
      1,
      '07e2cb13-c25a-4862-b12f-a4d00c5f1001'::uuid,
      'SINGLE_CHOICE'::"QuestionType",
      'Which statement best describes Python?',
      'Python is a high-level, general-purpose programming language.'
    ),
    (
      1,
      2,
      '07e2cb13-c25a-4862-b12f-a4d00c5f1002'::uuid,
      'TRUE_FALSE'::"QuestionType",
      'Python programs can run on multiple operating systems.',
      'Python is cross-platform and commonly runs on Windows, macOS, and Linux.'
    ),
    (
      1,
      3,
      '07e2cb13-c25a-4862-b12f-a4d00c5f1003'::uuid,
      'SINGLE_CHOICE'::"QuestionType",
      'Which field is a common use case of Python for beginners?',
      'Python is frequently used in automation, scripting, data processing, and web development.'
    ),
    (
      2,
      1,
      '07e2cb13-c25a-4862-b12f-a4d00c5f2001'::uuid,
      'SINGLE_CHOICE'::"QuestionType",
      'Which function is commonly used to print text in Python?',
      'The built-in print function writes text to standard output.'
    ),
    (
      2,
      2,
      '07e2cb13-c25a-4862-b12f-a4d00c5f2002'::uuid,
      'TRUE_FALSE'::"QuestionType",
      'Python is case-sensitive when reading variable names.',
      'Python treats Name and name as different identifiers.'
    ),
    (
      2,
      3,
      '07e2cb13-c25a-4862-b12f-a4d00c5f2003'::uuid,
      'SINGLE_CHOICE'::"QuestionType",
      'Which value is a valid Python string literal?',
      'Text wrapped in matching quotes is a Python string literal.'
    )
) AS qd(quiz_order, sort_order, id, type, content, explanation)
  ON qd.quiz_order = tq.rn
WHERE NOT EXISTS (
  SELECT 1
  FROM quiz_questions existing
  WHERE existing.quiz_id = tq.id
    AND existing.sort_order = qd.sort_order
);

WITH target_questions AS (
  SELECT
    qq.id,
    qq.sort_order,
    tc.rn AS quiz_order
  FROM quiz_questions qq
  JOIN quizzes q ON q.id = qq.quiz_id
  JOIN (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY sort_order ASC, id ASC) AS rn
    FROM course_chapters
    WHERE course_id = (
      SELECT id
      FROM courses
      WHERE slug = 'python-basic'
      LIMIT 1
    )
      AND status = 'PUBLISHED'::"ChapterStatus"
      AND deleted_at IS NULL
  ) tc ON tc.id = q.chapter_id
)
INSERT INTO quiz_options (
  id,
  question_id,
  content,
  is_correct,
  sort_order,
  created_at,
  updated_at
)
SELECT
  od.id,
  tq.id,
  od.content,
  od.is_correct,
  od.sort_order,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM target_questions tq
JOIN (
  VALUES
    (
      1,
      1,
      1,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f11001'::uuid,
      'A high-level, general-purpose programming language',
      true
    ),
    (
      1,
      1,
      2,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f11002'::uuid,
      'A database management system',
      false
    ),
    (
      1,
      1,
      3,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f11003'::uuid,
      'A hardware design language',
      false
    ),
    (
      1,
      2,
      1,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f12001'::uuid,
      'TRUE',
      true
    ),
    (
      1,
      2,
      2,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f12002'::uuid,
      'FALSE',
      false
    ),
    (
      1,
      3,
      1,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f13001'::uuid,
      'Automation and scripting',
      true
    ),
    (
      1,
      3,
      2,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f13002'::uuid,
      'Only embedded chip manufacturing',
      false
    ),
    (
      1,
      3,
      3,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f13003'::uuid,
      'Only mobile app store publishing',
      false
    ),
    (
      2,
      1,
      1,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f21001'::uuid,
      'print()',
      true
    ),
    (
      2,
      1,
      2,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f21002'::uuid,
      'echo()',
      false
    ),
    (
      2,
      1,
      3,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f21003'::uuid,
      'writeLine()',
      false
    ),
    (
      2,
      2,
      1,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f22001'::uuid,
      'TRUE',
      true
    ),
    (
      2,
      2,
      2,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f22002'::uuid,
      'FALSE',
      false
    ),
    (
      2,
      3,
      1,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f23001'::uuid,
      '"hello"',
      true
    ),
    (
      2,
      3,
      2,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f23002'::uuid,
      '123',
      false
    ),
    (
      2,
      3,
      3,
      '6c3d6cb0-1673-4af4-b57b-1d42f6f23003'::uuid,
      'True and False together',
      false
    )
) AS od(quiz_order, question_order, sort_order, id, content, is_correct)
  ON od.quiz_order = tq.quiz_order
 AND od.question_order = tq.sort_order
WHERE NOT EXISTS (
  SELECT 1
  FROM quiz_options existing
  WHERE existing.question_id = tq.id
    AND existing.sort_order = od.sort_order
);
