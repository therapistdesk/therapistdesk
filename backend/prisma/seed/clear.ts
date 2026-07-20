import { PrismaClient } from "@prisma/client";

export async function clearDatabase(prisma: PrismaClient) {
  console.log("\n🧹 Clearing database...");

  await prisma.pushSubscription.deleteMany();

  await prisma.message.deleteMany();

  await prisma.note.deleteMany();

  await prisma.appointment.deleteMany();

  await prisma.recurringSeries.deleteMany();

  await prisma.client.deleteMany();

  await prisma.service.deleteMany();

  await prisma.location.deleteMany();

  await prisma.therapistSettings.deleteMany();

  await prisma.therapist.deleteMany();

  await prisma.user.deleteMany();

  console.log("✅ Database cleared");
}