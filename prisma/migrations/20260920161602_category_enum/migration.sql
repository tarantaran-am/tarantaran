-- CreateEnum
CREATE TYPE "Category" AS ENUM ('venues', 'photographers', 'videographers', 'decor', 'reels', 'stylists', 'dresses', 'cakes', 'cars', 'hosts', 'show', 'choreographers', 'catering', 'dj');

-- DropForeignKey
ALTER TABLE "vendors" DROP CONSTRAINT "vendors_category_id_fkey";

-- DropIndex
DROP INDEX "vendors_category_id_is_published_idx";

-- AlterTable
ALTER TABLE "vendors" DROP COLUMN "category_id",
ADD COLUMN     "category" "Category" NOT NULL;

-- DropTable
DROP TABLE "categories";

-- CreateIndex
CREATE INDEX "vendors_category_is_published_idx" ON "vendors"("category", "is_published");

