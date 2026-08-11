ALTER TABLE "users"
ADD COLUMN "major" TEXT,
ADD COLUMN "grade" TEXT,
ADD COLUMN "learning_direction" TEXT,
ADD COLUMN "technical_interests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "career_direction" TEXT;
