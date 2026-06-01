/*
  Warnings:

  - Added the required column `country` to the `TherapistLocation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TherapistLocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "therapistId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    CONSTRAINT "TherapistLocation_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TherapistLocation" ("address", "city", "id", "name", "therapistId") SELECT "address", "city", "id", "name", "therapistId" FROM "TherapistLocation";
DROP TABLE "TherapistLocation";
ALTER TABLE "new_TherapistLocation" RENAME TO "TherapistLocation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
