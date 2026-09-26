-- Couples and vendors who signed up with Google through Supabase Auth.
-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('couple', 'vendor');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "AccountRole" NOT NULL,
    "locale" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- The site reads this table through Prisma only. RLS without policies keeps it closed to the
-- Supabase Data API, where the publishable key alone would otherwise be enough to read it.
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
