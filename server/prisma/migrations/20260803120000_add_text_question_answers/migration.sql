ALTER TYPE "QuestionType" ADD VALUE 'FILL_BLANK';

ALTER TABLE "quiz_answers"
ALTER COLUMN "selected_option_id" DROP NOT NULL,
ADD COLUMN "answer_text" TEXT,
ADD COLUMN "normalized_answer" TEXT;

ALTER TABLE "practice_answers"
ALTER COLUMN "selected_option_id" DROP NOT NULL,
ADD COLUMN "answer_text" TEXT,
ADD COLUMN "normalized_answer" TEXT;
