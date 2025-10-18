/*
  Warnings:

  - You are about to drop the `event_outbox` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."event_outbox";

-- CreateTable
CREATE TABLE "eventOutBox" (
    "id" TEXT NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "eventOutBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventOutBox_status_createdAt_idx" ON "eventOutBox"("status", "createdAt");
