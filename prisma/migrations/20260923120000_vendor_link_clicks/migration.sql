-- CreateEnum
CREATE TYPE "SocialNetwork" AS ENUM ('instagram', 'facebook', 'tiktok', 'telegram', 'whatsapp', 'website');

-- CreateTable
CREATE TABLE "vendor_link_clicks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" TEXT NOT NULL,
    "network" "SocialNetwork" NOT NULL,
    "day" DATE NOT NULL,
    "visitor_hash" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_link_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendor_link_clicks_vendor_id_day_idx" ON "vendor_link_clicks"("vendor_id", "day");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_link_clicks_vendor_id_network_day_visitor_hash_key" ON "vendor_link_clicks"("vendor_id", "network", "day", "visitor_hash");

-- AddForeignKey
ALTER TABLE "vendor_link_clicks" ADD CONSTRAINT "vendor_link_clicks_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Keep visitor data out of Supabase's public API; Prisma connects as the owner and bypasses RLS.
ALTER TABLE "vendor_link_clicks" ENABLE ROW LEVEL SECURITY;
