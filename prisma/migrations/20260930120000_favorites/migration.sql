-- Vendors couples saved with the heart.
-- CreateTable
CREATE TABLE "favorites" (
    "account_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("account_id","vendor_id")
);

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

