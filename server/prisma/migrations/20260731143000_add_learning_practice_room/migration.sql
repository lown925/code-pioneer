CREATE TYPE "PracticeAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

ALTER TABLE "courses"
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'GENERAL',
ADD COLUMN "language" TEXT;

CREATE TABLE "practice_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "requested_question_count" INTEGER NOT NULL,
    "status" "PracticeAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "practice_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "practice_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "selected_option_id" UUID NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "practice_answers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "practice_attempts_user_id_created_at_idx" ON "practice_attempts"("user_id", "created_at");
CREATE INDEX "practice_attempts_course_id_idx" ON "practice_attempts"("course_id");
CREATE UNIQUE INDEX "practice_answers_attempt_id_question_id_key" ON "practice_answers"("attempt_id", "question_id");
CREATE INDEX "practice_answers_user_id_is_correct_answered_at_idx" ON "practice_answers"("user_id", "is_correct", "answered_at");
CREATE INDEX "practice_answers_question_id_idx" ON "practice_answers"("question_id");

ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "practice_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "quiz_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
