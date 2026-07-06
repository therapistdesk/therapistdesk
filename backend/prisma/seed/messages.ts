import { PrismaClient } from "@prisma/client";

const MESSAGES = [
  {
    type: "reminder_24h",
    content: "Reminder: You have an appointment tomorrow.",
  },
  {
    type: "reminder_1h",
    content: "Reminder: Your appointment starts in one hour.",
  },
  {
    type: "confirmation",
    content: "Appointment confirmed.",
  },
  {
    type: "cancellation",
    content: "Appointment cancelled.",
  },
];

function randomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export async function seedMessages(prisma: PrismaClient) {
  console.log("💬 Creating messages...");

  const appointments = await prisma.appointment.findMany();

  for (const appointment of appointments) {
    // около 80% от срещите имат съобщение
    if (Math.random() > 0.8) continue;

    const msg = randomMessage();

    await prisma.message.create({
      data: {
        therapistId: appointment.therapistId,
        clientId: appointment.clientId,
        appointmentId: appointment.id,

        type: msg.type,
        content: msg.content,

        sendAt: appointment.startTime,
        sentAt: appointment.startTime,

        status: "sent",
      },
    });
  }

  console.log("✅ Messages created.");
}