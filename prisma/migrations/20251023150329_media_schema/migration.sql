/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `TurfImage` table. All the data in the column will be lost.
  - Added the required column `url` to the `TurfImage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'UPLOADED', 'FAILED', 'DELETED');

-- AlterTable
ALTER TABLE "TurfImage" DROP COLUMN "imageUrl",
ADD COLUMN     "format" TEXT,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT,
    "publicId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "format" TEXT,
    "size" INTEGER,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "sortOrder" INTEGER,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_entityType_entityId_idx" ON "Media"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Media_entityId_isPrimary_idx" ON "Media"("entityId", "isPrimary");
