/*
  Warnings:

  - Added the required column `profilePicturePublicId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "coverPhotoPublicId" TEXT,
ADD COLUMN     "profilePicturePublicId" TEXT NOT NULL;
