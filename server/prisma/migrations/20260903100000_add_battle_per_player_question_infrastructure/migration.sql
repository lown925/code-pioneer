-- P9-2B: additive per-player Battle question ownership and local ordering.
ALTER TABLE "battle_participants"
  ADD COLUMN "professional_track_key" TEXT;

ALTER TABLE "battle_question_snapshots"
  ADD COLUMN "owner_participant_id" UUID,
  ADD COLUMN "participant_order_index" INTEGER;

ALTER TABLE "battle_question_snapshots"
  ADD CONSTRAINT "battle_question_snapshots_owner_participant_id_fkey"
  FOREIGN KEY ("owner_participant_id") REFERENCES "battle_participants"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "battle_participants_professional_track_key_idx"
  ON "battle_participants"("professional_track_key");

CREATE INDEX "battle_question_snapshots_owner_participant_id_participant_order_index_idx"
  ON "battle_question_snapshots"("owner_participant_id", "participant_order_index");
