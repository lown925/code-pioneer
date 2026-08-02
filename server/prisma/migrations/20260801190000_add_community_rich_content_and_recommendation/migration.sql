ALTER TABLE "community_posts"
ADD COLUMN "content_blocks" JSONB,
ADD COLUMN "recommendation_score" INTEGER NOT NULL DEFAULT 0;

UPDATE "community_posts"
SET "recommendation_score" =
  FLOOR(EXTRACT(EPOCH FROM "created_at") / 21600)::INTEGER
  + ("like_count" * 3)
  + ("favorite_count" * 4)
  + ("comment_count" * 2);

CREATE INDEX "community_posts_status_recommendation_score_created_at_idx"
ON "community_posts"("status", "recommendation_score", "created_at");

CREATE INDEX "community_posts_status_like_count_created_at_idx"
ON "community_posts"("status", "like_count", "created_at");

CREATE INDEX "community_posts_status_favorite_count_created_at_idx"
ON "community_posts"("status", "favorite_count", "created_at");

CREATE INDEX "community_posts_status_comment_count_created_at_idx"
ON "community_posts"("status", "comment_count", "created_at");
