-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('NOT_STARTED', 'LEARNING', 'COMPLETED');

-- CreateTable
CREATE TABLE "course_learning_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "status" "LearningStatus" NOT NULL DEFAULT 'LEARNING',
    "completed_chapter_count" INTEGER NOT NULL DEFAULT 0,
    "total_chapter_count_snapshot" INTEGER NOT NULL DEFAULT 0,
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "last_chapter_id" UUID,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_learned_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_learning_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_learning_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "status" "LearningStatus" NOT NULL DEFAULT 'LEARNING',
    "first_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_learned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "quiz_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapter_learning_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_learning_records_user_id_course_id_key" ON "course_learning_records"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "chapter_learning_records_user_id_last_learned_at_idx" ON "chapter_learning_records"("user_id", "last_learned_at");

-- CreateIndex
CREATE UNIQUE INDEX "chapter_learning_records_user_id_chapter_id_key" ON "chapter_learning_records"("user_id", "chapter_id");

-- AddForeignKey
ALTER TABLE "course_learning_records" ADD CONSTRAINT "course_learning_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_learning_records" ADD CONSTRAINT "course_learning_records_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_learning_records" ADD CONSTRAINT "course_learning_records_last_chapter_id_fkey" FOREIGN KEY ("last_chapter_id") REFERENCES "course_chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_learning_records" ADD CONSTRAINT "chapter_learning_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_learning_records" ADD CONSTRAINT "chapter_learning_records_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_learning_records" ADD CONSTRAINT "chapter_learning_records_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "course_chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
