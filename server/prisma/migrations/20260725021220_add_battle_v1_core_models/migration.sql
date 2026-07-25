-- CreateEnum
CREATE TYPE "BattleMode" AS ENUM ('RANKED', 'FRIEND');

-- CreateEnum
CREATE TYPE "BattleRoomStatus" AS ENUM ('WAITING', 'READY', 'COUNTDOWN', 'IN_PROGRESS', 'SETTLING', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BattleParticipantStatus" AS ENUM ('JOINED', 'READY', 'PLAYING', 'SUBMITTED', 'FORFEITED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BattleResult" AS ENUM ('WIN', 'LOSS', 'DRAW', 'NONE');

-- CreateEnum
CREATE TYPE "BattleQuestionType" AS ENUM ('SINGLE_CHOICE', 'CODE_FILL');

-- CreateEnum
CREATE TYPE "BattleQuestionPresentation" AS ENUM ('TEXT_CHOICE', 'CODE_READING', 'CODE_PURPOSE', 'OUTPUT_PREDICTION', 'BUG_FIX', 'CODE_COMPLETION_CHOICE', 'CODE_SNIPPET_CHOICE', 'INPUT_CODE_FILL');

-- CreateEnum
CREATE TYPE "BattleQuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "BattleMatchQueueStatus" AS ENUM ('SEARCHING', 'MATCHED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BattleInvitationStatus" AS ENUM ('ACTIVE', 'ACCEPTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BattleEndReason" AS ENUM ('NORMAL', 'USER_FORFEIT', 'MATCH_TIMEOUT', 'SYSTEM_CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BattleRatingReason" AS ENUM ('BATTLE_RESULT', 'ADMIN_ADJUSTMENT', 'INITIALIZATION');

-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'CODE_FILL';

-- AlterTable
ALTER TABLE "quiz_options" ADD COLUMN     "content_blocks" JSONB;

-- AlterTable
ALTER TABLE "quiz_questions" ADD COLUMN     "accepted_answers" JSONB,
ADD COLUMN     "answer_normalization" JSONB,
ADD COLUMN     "battle_difficulty" "BattleQuestionDifficulty",
ADD COLUMN     "battle_presentation" "BattleQuestionPresentation",
ADD COLUMN     "case_sensitive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "explanation_blocks" JSONB,
ADD COLUMN     "is_battle_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "knowledge_tags" JSONB,
ADD COLUMN     "programming_language" TEXT,
ADD COLUMN     "stem_blocks" JSONB;

-- CreateTable
CREATE TABLE "battle_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "highest_rating" INTEGER NOT NULL DEFAULT 1000,
    "total_battles" INTEGER NOT NULL DEFAULT 0,
    "ranked_battles" INTEGER NOT NULL DEFAULT 0,
    "friend_battles" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "current_win_streak" INTEGER NOT NULL DEFAULT 0,
    "best_win_streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_rooms" (
    "id" UUID NOT NULL,
    "mode" "BattleMode" NOT NULL,
    "status" "BattleRoomStatus" NOT NULL DEFAULT 'WAITING',
    "question_count" INTEGER NOT NULL DEFAULT 20,
    "duration_seconds" INTEGER NOT NULL DEFAULT 180,
    "correct_score" INTEGER NOT NULL DEFAULT 2,
    "wrong_score" INTEGER NOT NULL DEFAULT -1,
    "unanswered_score" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" UUID,
    "started_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "end_reason" "BattleEndReason",
    "winner_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_participants" (
    "id" UUID NOT NULL,
    "battle_room_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "BattleParticipantStatus" NOT NULL DEFAULT 'JOINED',
    "result" "BattleResult" NOT NULL DEFAULT 'NONE',
    "seat" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "unanswered_count" INTEGER NOT NULL DEFAULT 0,
    "rating_before" INTEGER,
    "rating_delta" INTEGER NOT NULL DEFAULT 0,
    "rating_after" INTEGER,
    "ready_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "forfeited_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_question_snapshots" (
    "id" UUID NOT NULL,
    "battle_room_id" UUID NOT NULL,
    "source_quiz_question_id" UUID,
    "order_index" INTEGER NOT NULL,
    "question_type" "BattleQuestionType" NOT NULL,
    "presentation" "BattleQuestionPresentation" NOT NULL,
    "difficulty" "BattleQuestionDifficulty",
    "stem_snapshot" JSONB NOT NULL,
    "options_snapshot" JSONB NOT NULL,
    "correct_answer_snapshot" JSONB NOT NULL,
    "explanation_snapshot" JSONB,
    "accepted_answers_snapshot" JSONB,
    "answer_normalization_snapshot" JSONB,
    "knowledge_tags_snapshot" JSONB,
    "programming_language" TEXT,
    "course_id_snapshot" UUID,
    "chapter_id_snapshot" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_question_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_answers" (
    "id" UUID NOT NULL,
    "battle_room_id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "battle_question_snapshot_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "client_request_id" TEXT NOT NULL,
    "answer_payload" JSONB NOT NULL,
    "normalized_answer" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "score_delta" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "time_spent_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_invitations" (
    "id" UUID NOT NULL,
    "battle_room_id" UUID NOT NULL,
    "inviter_user_id" UUID NOT NULL,
    "invitee_user_id" UUID,
    "token" TEXT NOT NULL,
    "status" "BattleInvitationStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_rating_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "battle_room_id" UUID,
    "participant_id" UUID,
    "reason" "BattleRatingReason" NOT NULL,
    "rating_before" INTEGER NOT NULL,
    "rating_delta" INTEGER NOT NULL,
    "rating_after" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_rating_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_match_queues" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "BattleMatchQueueStatus" NOT NULL DEFAULT 'CANCELLED',
    "rating_snapshot" INTEGER NOT NULL,
    "matched_battle_room_id" UUID,
    "search_started_at" TIMESTAMP(3),
    "matched_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_match_queues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "battle_profiles_user_id_key" ON "battle_profiles"("user_id");

-- CreateIndex
CREATE INDEX "battle_rooms_status_idx" ON "battle_rooms"("status");

-- CreateIndex
CREATE INDEX "battle_rooms_mode_status_idx" ON "battle_rooms"("mode", "status");

-- CreateIndex
CREATE INDEX "battle_rooms_created_at_idx" ON "battle_rooms"("created_at");

-- CreateIndex
CREATE INDEX "battle_rooms_expires_at_idx" ON "battle_rooms"("expires_at");

-- CreateIndex
CREATE INDEX "battle_participants_user_id_idx" ON "battle_participants"("user_id");

-- CreateIndex
CREATE INDEX "battle_participants_battle_room_id_idx" ON "battle_participants"("battle_room_id");

-- CreateIndex
CREATE INDEX "battle_participants_status_idx" ON "battle_participants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "battle_participants_battle_room_id_user_id_key" ON "battle_participants"("battle_room_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_participants_battle_room_id_seat_key" ON "battle_participants"("battle_room_id", "seat");

-- CreateIndex
CREATE INDEX "battle_question_snapshots_battle_room_id_idx" ON "battle_question_snapshots"("battle_room_id");

-- CreateIndex
CREATE INDEX "battle_question_snapshots_source_quiz_question_id_idx" ON "battle_question_snapshots"("source_quiz_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_question_snapshots_battle_room_id_order_index_key" ON "battle_question_snapshots"("battle_room_id", "order_index");

-- CreateIndex
CREATE INDEX "battle_answers_user_id_idx" ON "battle_answers"("user_id");

-- CreateIndex
CREATE INDEX "battle_answers_battle_room_id_idx" ON "battle_answers"("battle_room_id");

-- CreateIndex
CREATE INDEX "battle_answers_participant_id_idx" ON "battle_answers"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_answers_participant_id_battle_question_snapshot_id_key" ON "battle_answers"("participant_id", "battle_question_snapshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_answers_participant_id_client_request_id_key" ON "battle_answers"("participant_id", "client_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_invitations_battle_room_id_key" ON "battle_invitations"("battle_room_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_invitations_token_key" ON "battle_invitations"("token");

-- CreateIndex
CREATE INDEX "battle_invitations_status_idx" ON "battle_invitations"("status");

-- CreateIndex
CREATE INDEX "battle_invitations_expires_at_idx" ON "battle_invitations"("expires_at");

-- CreateIndex
CREATE INDEX "battle_rating_logs_user_id_created_at_idx" ON "battle_rating_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "battle_rating_logs_battle_room_id_idx" ON "battle_rating_logs"("battle_room_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_rating_logs_battle_room_id_user_id_reason_key" ON "battle_rating_logs"("battle_room_id", "user_id", "reason");

-- CreateIndex
CREATE UNIQUE INDEX "battle_match_queues_user_id_key" ON "battle_match_queues"("user_id");

-- CreateIndex
CREATE INDEX "battle_match_queues_status_idx" ON "battle_match_queues"("status");

-- CreateIndex
CREATE INDEX "battle_match_queues_expires_at_idx" ON "battle_match_queues"("expires_at");

-- CreateIndex
CREATE INDEX "quiz_questions_is_battle_enabled_idx" ON "quiz_questions"("is_battle_enabled");

-- AddForeignKey
ALTER TABLE "battle_profiles" ADD CONSTRAINT "battle_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_rooms" ADD CONSTRAINT "battle_rooms_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_rooms" ADD CONSTRAINT "battle_rooms_winner_user_id_fkey" FOREIGN KEY ("winner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_participants" ADD CONSTRAINT "battle_participants_battle_room_id_fkey" FOREIGN KEY ("battle_room_id") REFERENCES "battle_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_participants" ADD CONSTRAINT "battle_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_question_snapshots" ADD CONSTRAINT "battle_question_snapshots_battle_room_id_fkey" FOREIGN KEY ("battle_room_id") REFERENCES "battle_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_question_snapshots" ADD CONSTRAINT "battle_question_snapshots_source_quiz_question_id_fkey" FOREIGN KEY ("source_quiz_question_id") REFERENCES "quiz_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_answers" ADD CONSTRAINT "battle_answers_battle_room_id_fkey" FOREIGN KEY ("battle_room_id") REFERENCES "battle_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_answers" ADD CONSTRAINT "battle_answers_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "battle_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_answers" ADD CONSTRAINT "battle_answers_battle_question_snapshot_id_fkey" FOREIGN KEY ("battle_question_snapshot_id") REFERENCES "battle_question_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_answers" ADD CONSTRAINT "battle_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_invitations" ADD CONSTRAINT "battle_invitations_battle_room_id_fkey" FOREIGN KEY ("battle_room_id") REFERENCES "battle_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_invitations" ADD CONSTRAINT "battle_invitations_inviter_user_id_fkey" FOREIGN KEY ("inviter_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_invitations" ADD CONSTRAINT "battle_invitations_invitee_user_id_fkey" FOREIGN KEY ("invitee_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_rating_logs" ADD CONSTRAINT "battle_rating_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_rating_logs" ADD CONSTRAINT "battle_rating_logs_battle_room_id_fkey" FOREIGN KEY ("battle_room_id") REFERENCES "battle_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_rating_logs" ADD CONSTRAINT "battle_rating_logs_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "battle_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_match_queues" ADD CONSTRAINT "battle_match_queues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_match_queues" ADD CONSTRAINT "battle_match_queues_matched_battle_room_id_fkey" FOREIGN KEY ("matched_battle_room_id") REFERENCES "battle_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
