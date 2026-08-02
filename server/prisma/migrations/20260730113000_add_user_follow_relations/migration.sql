-- CreateTable
CREATE TABLE "user_follows" (
    "id" UUID NOT NULL,
    "follower_user_id" UUID NOT NULL,
    "followed_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_follows_follower_user_id_followed_user_id_key" ON "user_follows"("follower_user_id", "followed_user_id");

-- CreateIndex
CREATE INDEX "user_follows_follower_user_id_created_at_idx" ON "user_follows"("follower_user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_follows_followed_user_id_created_at_idx" ON "user_follows"("followed_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_user_id_fkey" FOREIGN KEY ("follower_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followed_user_id_fkey" FOREIGN KEY ("followed_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
