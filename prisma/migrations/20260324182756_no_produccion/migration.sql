/*
  Warnings:

  - You are about to drop the column `comprobante` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Taller` table. All the data in the column will be lost.
  - Added the required column `amountPaid` to the `Inscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `Inscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Inscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "price" REAL NOT NULL,
    "totalHours" INTEGER NOT NULL,
    "totalClasses" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'Español',
    "level" TEXT NOT NULL,
    "content" TEXT,
    "modules" TEXT,
    "instructorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Curso_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "phoneNumber" TEXT,
    "receiptImage" TEXT,
    "amountPaid" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tallerId" TEXT,
    "cursoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscription_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "Taller" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inscription_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Inscription" ("createdAt", "id", "status", "tallerId", "userId") SELECT "createdAt", "id", "status", "tallerId", "userId" FROM "Inscription";
DROP TABLE "Inscription";
ALTER TABLE "new_Inscription" RENAME TO "Inscription";
CREATE TABLE "new_Taller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "slots" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "agenda" TEXT,
    "includes" TEXT,
    "instructorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Taller_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Taller" ("agenda", "category", "createdAt", "date", "description", "id", "image", "includes", "instructorId", "location", "price", "slots", "time", "title") SELECT "agenda", "category", "createdAt", "date", "description", "id", "image", "includes", "instructorId", "location", "price", "slots", "time", "title" FROM "Taller";
DROP TABLE "Taller";
ALTER TABLE "new_Taller" RENAME TO "Taller";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
