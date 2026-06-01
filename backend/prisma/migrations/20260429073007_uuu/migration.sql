/*
  Warnings:

  - You are about to drop the column `address` on the `Client` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "country" TEXT,
    "city" TEXT,
    "reminderMinutesBefore" INTEGER,
    "reminderOffsets" TEXT,
    "therapistId" INTEGER NOT NULL,
    CONSTRAINT "Client_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("email", "id", "name", "notes", "phone", "reminderMinutesBefore", "reminderOffsets", "therapistId") SELECT "email", "id", "name", "notes", "phone", "reminderMinutesBefore", "reminderOffsets", "therapistId" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
