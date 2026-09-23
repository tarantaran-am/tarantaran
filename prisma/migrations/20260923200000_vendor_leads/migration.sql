-- CreateTable
CREATE TABLE "vendor_leads" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "event_date" DATE,
    "message" TEXT,
    "contact_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "contact_telegram" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendor_leads_vendor_id_created_at_idx" ON "vendor_leads"("vendor_id", "created_at");

-- AddForeignKey
ALTER TABLE "vendor_leads" ADD CONSTRAINT "vendor_leads_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Leads hold names and phone numbers: keep them out of Supabase's public API; Prisma connects as the owner and bypasses RLS.
ALTER TABLE "vendor_leads" ENABLE ROW LEVEL SECURITY;
