/*
  Warnings:

  - A unique constraint covering the columns `[socialWallet]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socialWallet" VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "User_socialWallet_key" ON "User"("socialWallet");
