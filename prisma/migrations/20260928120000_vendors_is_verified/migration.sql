-- Vendors the admin has personally contacted and agreed the listing with.
-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;
