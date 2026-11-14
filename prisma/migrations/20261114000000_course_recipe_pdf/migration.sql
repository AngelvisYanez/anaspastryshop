ALTER TABLE "Curso" ADD COLUMN "recipePdfId" TEXT;

CREATE TABLE "CourseRecipePdf" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseRecipePdf_pkey" PRIMARY KEY ("id")
);
