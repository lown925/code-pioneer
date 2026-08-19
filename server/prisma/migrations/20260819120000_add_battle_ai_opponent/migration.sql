-- AlterEnum
ALTER TYPE "BattleMode" ADD VALUE 'AI';

-- CreateTable
CREATE TABLE "battle_ai_opponents" (
    "id" UUID NOT NULL,
    "battle_room_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "strategy_version" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "answer_plan" JSONB NOT NULL,
    "planned_submitted_offset_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_ai_opponents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "battle_ai_opponents_battle_room_id_key" ON "battle_ai_opponents"("battle_room_id");
CREATE INDEX "battle_ai_opponents_strategy_version_idx" ON "battle_ai_opponents"("strategy_version");

-- AddForeignKey
ALTER TABLE "battle_ai_opponents" ADD CONSTRAINT "battle_ai_opponents_battle_room_id_fkey" FOREIGN KEY ("battle_room_id") REFERENCES "battle_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
