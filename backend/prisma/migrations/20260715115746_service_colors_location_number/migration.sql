/*
  Warnings:

  - A unique constraint covering the columns `[therapistId,number]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Made the column `color` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "number" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DEFAULT 'violet';

-- CreateIndex
CREATE UNIQUE INDEX "Location_therapistId_number_key" ON "Location"("therapistId", "number");
