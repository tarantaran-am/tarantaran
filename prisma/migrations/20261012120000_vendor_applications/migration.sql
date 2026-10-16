-- Vendors' requests for a card in the catalog, approved or rejected in the admin.
-- CreateEnum
CREATE TYPE "VendorApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "vendor_applications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "marzes" "Marz"[],
    "description" TEXT NOT NULL,
    "phone" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "tiktok" TEXT,
    "telegram" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "status" "VendorApplicationStatus" NOT NULL DEFAULT 'pending',
    "admin_message" TEXT,
    "vendor_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_applications_account_id_key" ON "vendor_applications"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_applications_vendor_id_key" ON "vendor_applications"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_applications_status_updated_at_idx" ON "vendor_applications"("status", "updated_at");

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Read through Prisma only; RLS without policies keeps it closed to the Supabase Data API.
ALTER TABLE "vendor_applications" ENABLE ROW LEVEL SECURITY;
