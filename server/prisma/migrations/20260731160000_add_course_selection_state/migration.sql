ALTER TABLE "course_learning_records"
ADD COLUMN "is_selected" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "selected_at" TIMESTAMP(3);

UPDATE "course_learning_records"
SET "selected_at" = "created_at"
WHERE "is_selected" = true;

CREATE INDEX "course_learning_records_user_id_is_selected_last_learned_at_idx"
ON "course_learning_records"("user_id", "is_selected", "last_learned_at");
