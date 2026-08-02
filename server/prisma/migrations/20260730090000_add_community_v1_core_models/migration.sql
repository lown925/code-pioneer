-- CreateEnum
CREATE TYPE "CommunityCategoryStatus" AS ENUM ('ENABLED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CommunityPostStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "CommunityCommentStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateTable
CREATE TABLE "community_categories" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "CommunityCategoryStatus" NOT NULL DEFAULT 'ENABLED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommunityPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "favorite_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_post_images" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "object_key" TEXT,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_post_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_post_favorites" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_post_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_post_view_histories" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "view_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_post_view_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_post_likes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommunityCommentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_categories_key_key" ON "community_categories"("key");

-- CreateIndex
CREATE INDEX "community_categories_status_sort_order_idx" ON "community_categories"("status", "sort_order");

-- CreateIndex
CREATE INDEX "community_posts_category_id_status_created_at_idx" ON "community_posts"("category_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "community_posts_author_id_created_at_idx" ON "community_posts"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "community_posts_status_created_at_idx" ON "community_posts"("status", "created_at");

-- CreateIndex
CREATE INDEX "community_posts_deleted_at_idx" ON "community_posts"("deleted_at");

-- CreateIndex
CREATE INDEX "community_post_images_post_id_sort_order_idx" ON "community_post_images"("post_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "community_post_favorites_post_id_user_id_key" ON "community_post_favorites"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "community_post_favorites_user_id_created_at_idx" ON "community_post_favorites"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "community_post_favorites_post_id_idx" ON "community_post_favorites"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_post_view_histories_post_id_user_id_key" ON "community_post_view_histories"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "community_post_view_histories_user_id_last_viewed_at_idx" ON "community_post_view_histories"("user_id", "last_viewed_at");

-- CreateIndex
CREATE INDEX "community_post_view_histories_post_id_idx" ON "community_post_view_histories"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_post_likes_post_id_user_id_key" ON "community_post_likes"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "community_post_likes_user_id_created_at_idx" ON "community_post_likes"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "community_post_likes_post_id_idx" ON "community_post_likes"("post_id");

-- CreateIndex
CREATE INDEX "community_comments_post_id_created_at_idx" ON "community_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "community_comments_author_id_created_at_idx" ON "community_comments"("author_id", "created_at");

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "community_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_images" ADD CONSTRAINT "community_post_images_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_favorites" ADD CONSTRAINT "community_post_favorites_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_favorites" ADD CONSTRAINT "community_post_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_view_histories" ADD CONSTRAINT "community_post_view_histories_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_view_histories" ADD CONSTRAINT "community_post_view_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_likes" ADD CONSTRAINT "community_post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_likes" ADD CONSTRAINT "community_post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
