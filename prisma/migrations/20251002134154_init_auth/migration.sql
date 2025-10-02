/*
  Warnings:

  - Added the required column `name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'USER';

