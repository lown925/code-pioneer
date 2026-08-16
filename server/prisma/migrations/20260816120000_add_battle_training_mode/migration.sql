-- AlterEnum
ALTER TYPE "BattleMode" ADD VALUE 'TRAINING';

-- AlterTable
ALTER TABLE "battle_profiles" ADD COLUMN "training_battles" INTEGER NOT NULL DEFAULT 0;
