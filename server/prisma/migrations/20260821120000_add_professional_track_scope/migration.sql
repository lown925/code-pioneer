-- P8-3: nullable scope columns preserve legacy rooms, queues, and rating logs.
ALTER TABLE "battle_rooms" ADD COLUMN "professional_track_key" TEXT;
ALTER TABLE "battle_match_queues" ADD COLUMN "professional_track_key" TEXT;
ALTER TABLE "battle_rating_logs" ADD COLUMN "professional_track_key" TEXT;

CREATE TABLE "user_battle_track_ratings" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "track_key" TEXT NOT NULL,
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
  CONSTRAINT "user_battle_track_ratings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_battle_track_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "user_battle_track_ratings_user_id_track_key_key" ON "user_battle_track_ratings"("user_id", "track_key");
CREATE INDEX "user_battle_track_rating_rank_idx" ON "user_battle_track_ratings"("track_key", "rating" DESC, "ranked_battles" DESC, "user_id");
CREATE INDEX "battle_rooms_professional_track_key_mode_status_idx" ON "battle_rooms"("professional_track_key", "mode", "status");
CREATE INDEX "battle_match_queues_professional_track_key_status_expires_at_idx" ON "battle_match_queues"("professional_track_key", "status", "expires_at");
CREATE INDEX "battle_rating_logs_professional_track_key_user_id_created_at_idx" ON "battle_rating_logs"("professional_track_key", "user_id", "created_at");
