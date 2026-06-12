/*
  Warnings:

  - A unique constraint covering the columns `[clientAccessToken]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN "clientAccessToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientAccessToken_key" ON "Client"("clientAccessToken");
