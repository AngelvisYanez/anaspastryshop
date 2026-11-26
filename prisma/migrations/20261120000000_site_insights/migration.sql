CREATE TYPE "SiteInsightKind" AS ENUM ('PAGE_VIEW', 'SECTION_VIEW', 'CLICK');

CREATE TABLE "SiteInsightEvent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" VARCHAR(160) NOT NULL,
    "kind" "SiteInsightKind" NOT NULL,
    "mobile" BOOLEAN NOT NULL,
    "section" VARCHAR(48),
    "cell" INTEGER,

    CONSTRAINT "SiteInsightEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SiteInsightEvent_createdAt_idx" ON "SiteInsightEvent"("createdAt");
CREATE INDEX "SiteInsightEvent_path_mobile_createdAt_idx" ON "SiteInsightEvent"("path", "mobile", "createdAt");
