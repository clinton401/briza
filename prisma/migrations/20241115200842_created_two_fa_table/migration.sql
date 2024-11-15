/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropTable
DROP TABLE "Account";

-- CreateTable
CREATE TABLE "TwoFA" (
    "id" TEXT NOT NULL,
    "token" CHAR(6) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TwoFA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwoFA_token_key" ON "TwoFA"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFA_userId_key" ON "TwoFA"("userId");

-- CreateIndex
CREATE INDEX "TwoFA_id_token_idx" ON "TwoFA"("id", "token");

-- AddForeignKey
ALTER TABLE "TwoFA" ADD CONSTRAINT "TwoFA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
