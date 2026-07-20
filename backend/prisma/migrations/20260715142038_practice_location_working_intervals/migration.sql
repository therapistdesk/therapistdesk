/*
  Warnings:

  - The primary key for the `ServiceLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `locationId` on the `ServiceLocation` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `practiceLocationId` to the `ServiceLocation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkingIntervalType" AS ENUM ('work', 'break');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceLocation" DROP CONSTRAINT "ServiceLocation_locationId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "practiceLocationId" INTEGER,
ADD COLUMN     "serviceId" INTEGER;

-- AlterTable
ALTER TABLE "ServiceLocation" DROP CONSTRAINT "ServiceLocation_pkey",
DROP COLUMN "locationId",
ADD COLUMN     "practiceLocationId" INTEGER NOT NULL,
ADD CONSTRAINT "ServiceLocation_pkey" PRIMARY KEY ("serviceId", "practiceLocationId");

-- DropTable
DROP TABLE "Location";

-- CreateTable
CREATE TABLE "PracticeLocation" (
    "id" SERIAL NOT NULL,
    "therapistId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "number" INTEGER NOT NULL,

    CONSTRAINT "PracticeLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingInterval" (
    "id" SERIAL NOT NULL,
    "practiceLocationId" INTEGER NOT NULL,
    "day" "WeekDay" NOT NULL,
    "startMinutes" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,
    "type" "WorkingIntervalType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkingInterval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeLocation_therapistId_number_key" ON "PracticeLocation"("therapistId", "number");

-- CreateIndex
CREATE INDEX "WorkingInterval_practiceLocationId_day_idx" ON "WorkingInterval"("practiceLocationId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingInterval_practiceLocationId_day_sortOrder_key" ON "WorkingInterval"("practiceLocationId", "day", "sortOrder");

-- AddForeignKey
ALTER TABLE "PracticeLocation" ADD CONSTRAINT "PracticeLocation_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingInterval" ADD CONSTRAINT "WorkingInterval_practiceLocationId_fkey" FOREIGN KEY ("practiceLocationId") REFERENCES "PracticeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_practiceLocationId_fkey" FOREIGN KEY ("practiceLocationId") REFERENCES "PracticeLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLocation" ADD CONSTRAINT "ServiceLocation_practiceLocationId_fkey" FOREIGN KEY ("practiceLocationId") REFERENCES "PracticeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
