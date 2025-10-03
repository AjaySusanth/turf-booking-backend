/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `userSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "userSession_userId_key" ON "userSession"("userId");
