/*
  Warnings:

  - A unique constraint covering the columns `[refreshTokenHash]` on the table `userSession` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."userSession_userId_refreshTokenHash_key";

-- CreateIndex
CREATE UNIQUE INDEX "userSession_refreshTokenHash_key" ON "userSession"("refreshTokenHash");
