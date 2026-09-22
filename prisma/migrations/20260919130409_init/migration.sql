-- CreateEnum
CREATE TYPE "Marz" AS ENUM ('yerevan', 'aragatsotn', 'ararat', 'armavir', 'gegharkunik', 'kotayk', 'lori', 'shirak', 'syunik', 'tavush', 'vayots_dzor');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name_hy" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_plural_hy" TEXT NOT NULL,
    "name_plural_ru" TEXT NOT NULL,
    "name_plural_en" TEXT NOT NULL,
    "description_hy" TEXT NOT NULL,
    "description_ru" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name_hy" TEXT,
    "name_ru" TEXT NOT NULL,
    "name_en" TEXT,
    "description_hy" TEXT,
    "description_ru" TEXT NOT NULL,
    "description_en" TEXT,
    "category_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "marz" "Marz" DEFAULT 'yerevan',
    "instagram" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" TEXT NOT NULL,
    "blob_url" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- CreateIndex
CREATE INDEX "vendors_category_id_is_published_idx" ON "vendors"("category_id", "is_published");

-- CreateIndex
CREATE INDEX "vendors_marz_idx" ON "vendors"("marz");

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
