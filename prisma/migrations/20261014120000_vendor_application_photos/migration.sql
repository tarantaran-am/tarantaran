-- An extra category and photos of work in vendors' applications.
-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN     "extra_category" "Category",
ADD COLUMN     "photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];

