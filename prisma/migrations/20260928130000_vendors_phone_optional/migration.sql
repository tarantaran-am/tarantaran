-- Some vendors (often the top ones) don't list a phone, only social links.
-- AlterTable
ALTER TABLE "vendors" ALTER COLUMN "phone" DROP NOT NULL;
