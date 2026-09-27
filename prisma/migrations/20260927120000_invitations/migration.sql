-- Wedding invitations and guests' answers to them.
-- CreateEnum
CREATE TYPE "InvitationTemplate" AS ENUM ('classic', 'minimal', 'photo');

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "slug" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "template" "InvitationTemplate" NOT NULL,
    "language" TEXT NOT NULL,
    "partner_one" TEXT NOT NULL,
    "partner_two" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "venue_name" TEXT NOT NULL,
    "venue_address" TEXT,
    "map_url" TEXT,
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "dress_code" TEXT,
    "message" TEXT,
    "photo_url" TEXT,
    "rsvp_deadline" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rsvps" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "invitation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attending" BOOLEAN NOT NULL,
    "guests" INTEGER NOT NULL,
    "comment" TEXT,
    "visitor_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_slug_key" ON "invitations"("slug");

-- CreateIndex
CREATE INDEX "invitations_account_id_idx" ON "invitations"("account_id");

-- CreateIndex
CREATE INDEX "invitations_starts_at_idx" ON "invitations"("starts_at");

-- CreateIndex
CREATE INDEX "rsvps_invitation_id_created_at_idx" ON "rsvps"("invitation_id", "created_at");

-- CreateIndex
CREATE INDEX "rsvps_visitor_hash_created_at_idx" ON "rsvps"("visitor_hash", "created_at");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Read through Prisma only; RLS without policies keeps them closed to the Supabase Data API.
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rsvps" ENABLE ROW LEVEL SECURITY;
