/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `EmailVerification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.
  - Made the column `expiresAt` on table `EmailVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expiresAt` on table `PasswordReset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EmailVerification" ALTER COLUMN "expiresAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "PasswordReset" ALTER COLUMN "expiresAt" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_userId_key" ON "EmailVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_userId_key" ON "PasswordReset"("userId");
