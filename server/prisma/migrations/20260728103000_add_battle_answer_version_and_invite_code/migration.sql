-- AlterTable
ALTER TABLE "battle_answers"
ADD COLUMN "answer_version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "battle_invitations"
ADD COLUMN "invite_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "battle_invitations_invite_code_key"
ON "battle_invitations"("invite_code");
