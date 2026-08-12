-- CreateTable
CREATE TABLE "battle_skills" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_skills_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "user_battle_skill_ratings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "skill_code" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "highest_rating" INTEGER NOT NULL DEFAULT 1000,
    "ranked_battles" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "current_win_streak" INTEGER NOT NULL DEFAULT 0,
    "best_win_streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_battle_skill_ratings_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "quiz_questions" ADD COLUMN "battle_skill_code" TEXT;
ALTER TABLE "battle_rooms" ADD COLUMN "skill_code" TEXT;
ALTER TABLE "battle_match_queues" ADD COLUMN "skill_code" TEXT;
ALTER TABLE "battle_question_snapshots" ADD COLUMN "skill_code_snapshot" TEXT;
ALTER TABLE "battle_rating_logs" ADD COLUMN "skill_code" TEXT;

-- CreateIndex
CREATE INDEX "battle_skills_is_enabled_sort_order_idx" ON "battle_skills"("is_enabled", "sort_order");
CREATE UNIQUE INDEX "user_battle_skill_ratings_user_id_skill_code_key" ON "user_battle_skill_ratings"("user_id", "skill_code");
CREATE INDEX "user_battle_skill_rating_rank_idx" ON "user_battle_skill_ratings"("skill_code", "rating" DESC, "ranked_battles" DESC, "user_id");
CREATE INDEX "quiz_questions_battle_skill_code_is_battle_enabled_idx" ON "quiz_questions"("battle_skill_code", "is_battle_enabled");
CREATE INDEX "battle_rooms_skill_code_mode_status_idx" ON "battle_rooms"("skill_code", "mode", "status");
CREATE INDEX "battle_match_queues_skill_code_status_expires_at_idx" ON "battle_match_queues"("skill_code", "status", "expires_at");
CREATE INDEX "battle_question_snapshots_skill_code_snapshot_idx" ON "battle_question_snapshots"("skill_code_snapshot");
CREATE INDEX "battle_rating_logs_skill_code_user_id_created_at_idx" ON "battle_rating_logs"("skill_code", "user_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_battle_skill_ratings" ADD CONSTRAINT "user_battle_skill_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_battle_skill_ratings" ADD CONSTRAINT "user_battle_skill_ratings_skill_code_fkey" FOREIGN KEY ("skill_code") REFERENCES "battle_skills"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_battle_skill_code_fkey" FOREIGN KEY ("battle_skill_code") REFERENCES "battle_skills"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "battle_rooms" ADD CONSTRAINT "battle_rooms_skill_code_fkey" FOREIGN KEY ("skill_code") REFERENCES "battle_skills"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "battle_match_queues" ADD CONSTRAINT "battle_match_queues_skill_code_fkey" FOREIGN KEY ("skill_code") REFERENCES "battle_skills"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "battle_question_snapshots" ADD CONSTRAINT "battle_question_snapshots_skill_code_snapshot_fkey" FOREIGN KEY ("skill_code_snapshot") REFERENCES "battle_skills"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "battle_rating_logs" ADD CONSTRAINT "battle_rating_logs_skill_code_fkey" FOREIGN KEY ("skill_code") REFERENCES "battle_skills"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
