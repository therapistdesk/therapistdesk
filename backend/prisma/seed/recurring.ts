import { PrismaClient } from "@prisma/client";

export async function seedRecurring(prisma: PrismaClient) {
  console.log("🔁 Creating recurring series...");

  const appointments = await prisma.appointment.findMany({
    where: {
      isCancelled: false,
    },
    orderBy: {
      startTime: "asc",
    },
    take: 6,
  });

  for (const appointment of appointments) {
    await prisma.recurringSeries.create({
      data: {
        clientId: appointment.clientId,
        therapistId: appointment.therapistId,

        startTime: appointment.startTime,
        endTime: appointment.endTime,

        frequency: "WEEKLY",
        interval: 1,

        daysOfWeek: JSON.stringify([
          appointment.startTime.getDay(),
        ]),
      },
    });
  }

  console.log("✅ Recurring series created.");
}