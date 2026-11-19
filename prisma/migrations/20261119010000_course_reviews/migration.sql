ALTER TABLE "User" ADD COLUMN "courseReviewsReadAt" TIMESTAMP(3);

CREATE TABLE "CourseModuleCompletion" (
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    CONSTRAINT "CourseModuleCompletion_pkey" PRIMARY KEY ("userId", "moduleId"),
    CONSTRAINT "CourseModuleCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseModuleCompletion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CourseModuleCompletion_moduleId_idx" ON "CourseModuleCompletion"("moduleId");

CREATE TABLE "CourseReview" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CourseReview_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CourseReview_cursoId_userId_key" ON "CourseReview"("cursoId", "userId");
CREATE INDEX "CourseReview_cursoId_createdAt_idx" ON "CourseReview"("cursoId", "createdAt");
CREATE INDEX "CourseReview_createdAt_idx" ON "CourseReview"("createdAt");
CREATE INDEX "CourseReview_userId_idx" ON "CourseReview"("userId");
