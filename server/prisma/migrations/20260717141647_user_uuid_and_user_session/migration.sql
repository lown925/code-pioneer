-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('NORMAL', 'DISABLED', 'DELETED');

-- Remove early temporary test users before replacing the temporary User table.
DELETE FROM "code_pioneer"."User";

-- DropTable
DROP TABLE "code_pioneer"."User";

-- CreateTable
CREATE TABLE "code_pioneer"."users" (
    "id" UUID NOT NULL,
    "open_id" TEXT NOT NULL,
    "union_id" TEXT,
    "nickname" TEXT,
    "avatar_url" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'NORMAL',
    "experience" INTEGER NOT NULL DEFAULT 0,
    "battle_rating" INTEGER NOT NULL DEFAULT 1000,
    "continuous_learning_days" INTEGER NOT NULL DEFAULT 0,
    "last_learning_date" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "disabled_reason" TEXT,
    "disabled_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_pioneer"."user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT,
    "device_info" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_open_id_key" ON "code_pioneer"."users"("open_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_union_id_key" ON "code_pioneer"."users"("union_id");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "code_pioneer"."users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "code_pioneer"."users"("created_at");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "code_pioneer"."users"("last_login_at");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "code_pioneer"."user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "code_pioneer"."user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "user_sessions_revoked_at_idx" ON "code_pioneer"."user_sessions"("revoked_at");

-- AddForeignKey
ALTER TABLE "code_pioneer"."user_sessions"
ADD CONSTRAINT "user_sessions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "code_pioneer"."users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
