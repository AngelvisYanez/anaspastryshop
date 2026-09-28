/*
  Warnings:

  - You are about to drop the `LiveStream` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Webinar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WebinarSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LiveStream" DROP CONSTRAINT "LiveStream_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "Webinar" DROP CONSTRAINT "Webinar_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "WebinarSession" DROP CONSTRAINT "WebinarSession_webinarId_fkey";

-- DropTable
DROP TABLE "LiveStream";

-- DropTable
DROP TABLE "Webinar";

-- DropTable
DROP TABLE "WebinarSession";
