-- CreateEnum
CREATE TYPE "ContentBlockType" AS ENUM ('TEXT', 'HEADING', 'IMAGE', 'CODE', 'TIP', 'WARNING', 'EXAMPLE', 'QUESTION');

-- CreateTable
CREATE TABLE "chapter_content_blocks" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "type" "ContentBlockType" NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chapter_content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chapter_content_blocks_chapter_id_sort_order_idx" ON "chapter_content_blocks"("chapter_id", "sort_order");

-- CreateIndex
CREATE INDEX "chapter_content_blocks_chapter_id_idx" ON "chapter_content_blocks"("chapter_id");

-- AddForeignKey
ALTER TABLE "chapter_content_blocks" ADD CONSTRAINT "chapter_content_blocks_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "course_chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
