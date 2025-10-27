/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,id]` on the table `Turf` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Turf_createdAt_id_key" ON "Turf"("createdAt", "id");
