-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK', 'X', 'WHATSAPP', 'VIBER', 'TELEGRAM', 'SIGNAL', 'CALENDLY', 'ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER');

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "currency" SET DEFAULT 'Euro';

-- AlterTable
ALTER TABLE "Therapist" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "TherapistSettings" ADD COLUMN     "dateFormat" TEXT NOT NULL DEFAULT 'DD.MM.YYYY',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'bg',
ADD COLUMN     "timeFormat" TEXT NOT NULL DEFAULT '24',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Europe/Sofia';

-- CreateTable
CREATE TABLE "TherapistLink" (
    "id" SERIAL NOT NULL,
    "therapistId" INTEGER NOT NULL,
    "type" "LinkType" NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TherapistLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TherapistLink_therapistId_idx" ON "TherapistLink"("therapistId");

-- AddForeignKey
ALTER TABLE "TherapistLink" ADD CONSTRAINT "TherapistLink_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
