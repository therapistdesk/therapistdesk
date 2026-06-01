-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "therapistId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "appointmentId" INTEGER,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "sendAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TherapistSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "therapistId" INTEGER NOT NULL,
    "reminderOffsets" TEXT NOT NULL,
    "retentionMonths" INTEGER NOT NULL DEFAULT 12,
    CONSTRAINT "TherapistSettings_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Message_sendAt_status_idx" ON "Message"("sendAt", "status");

-- CreateIndex
CREATE INDEX "Message_type_idx" ON "Message"("type");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistSettings_therapistId_key" ON "TherapistSettings"("therapistId");
