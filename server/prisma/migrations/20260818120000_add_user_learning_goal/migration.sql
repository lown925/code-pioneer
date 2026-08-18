-- CreateEnum
CREATE TYPE "LearningGoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "user_learning_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "target_date" DATE NOT NULL,
    "status" "LearningGoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_learning_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_learning_goals_user_id_status_idx" ON "user_learning_goals"("user_id", "status");
CREATE INDEX "user_learning_goals_course_id_idx" ON "user_learning_goals"("course_id");
CREATE UNIQUE INDEX "user_learning_goals_one_active_per_user_key"
ON "user_learning_goals"("user_id")
WHERE "status" = 'ACTIVE';

-- AddForeignKey
ALTER TABLE "user_learning_goals" ADD CONSTRAINT "user_learning_goals_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_learning_goals" ADD CONSTRAINT "user_learning_goals_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
