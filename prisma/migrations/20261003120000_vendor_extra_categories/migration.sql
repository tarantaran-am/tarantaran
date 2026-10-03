-- A vendor can be listed in more categories than the one its page lives under (a photo and video studio).
ALTER TABLE "vendors" ADD COLUMN "extra_categories" "Category"[] NOT NULL DEFAULT '{}';

CREATE INDEX "vendors_extra_categories_idx" ON "vendors" USING GIN ("extra_categories");
