-- Rate-limit "email me a sign-in link" requests per visitor and per address.
-- CreateTable
CREATE TABLE "auth_email_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "visitor_hash" TEXT NOT NULL,
    "email_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_email_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_email_requests_visitor_hash_created_at_idx" ON "auth_email_requests"("visitor_hash", "created_at");

-- CreateIndex
CREATE INDEX "auth_email_requests_email_hash_created_at_idx" ON "auth_email_requests"("email_hash", "created_at");

-- Read through Prisma only; RLS without policies keeps it closed to the Supabase Data API.
ALTER TABLE "auth_email_requests" ENABLE ROW LEVEL SECURITY;
