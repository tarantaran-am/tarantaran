ALTER TABLE "vendors" ADD COLUMN "marzes" "Marz"[] NOT NULL DEFAULT '{}';

UPDATE "vendors" SET "marzes" = ARRAY["marz"]::"Marz"[] WHERE "marz" IS NOT NULL;

DROP INDEX "vendors_marz_idx";

ALTER TABLE "vendors" DROP COLUMN "marz";

ALTER TABLE "vendors" ALTER COLUMN "marzes" DROP DEFAULT;

CREATE INDEX "vendors_marzes_idx" ON "vendors" USING GIN ("marzes");
