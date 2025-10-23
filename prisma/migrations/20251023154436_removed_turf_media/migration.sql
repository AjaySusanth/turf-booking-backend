/*
  Warnings:

  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TurfImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TurfImage" DROP CONSTRAINT "TurfImage_turfId_fkey";

-- DropTable
DROP TABLE "public"."Media";

-- DropTable
DROP TABLE "public"."TurfImage";

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "format" TEXT,
    "size" INTEGER,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "sortOrder" INTEGER,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_entityType_entityId_idx" ON "media"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "media_entityId_isPrimary_idx" ON "media"("entityId", "isPrimary");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Turf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
