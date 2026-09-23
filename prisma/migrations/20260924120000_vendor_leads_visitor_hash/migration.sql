-- Rate-limit lead submissions per visitor.
-- AlterTable
ALTER TABLE "vendor_leads" ADD COLUMN     "visitor_hash" TEXT;

-- CreateIndex
CREATE INDEX "vendor_leads_visitor_hash_created_at_idx" ON "vendor_leads"("visitor_hash", "created_at");
