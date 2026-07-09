import {
  PrismaClient,
  Therapist,
  Client,
} from "@prisma/client";

const HOURS = [9, 10, 11, 13, 14, 15, 16, 17];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomHour() {
  return randomItem(HOURS);
}

function randomStatus(past: boolean): string {
  if (past) {
    return Math.random() < 0.95
      ? "completed"
      : "cancelled";
  }

  const r = Math.random();

  if (r < 0.60) return "confirmed";
  if (r < 0.90) return "scheduled";

  return "cancelled";
}

function randomBusinessDate(daysFromToday: number) {
  const date = new Date();

  while (true) {
    date.setDate(date.getDate() + daysFromToday);

    const day = date.getDay();

    if (day !== 0 && day !== 6) break;

    daysFromToday += daysFromToday >= 0 ? 1 : -1;
  }

  date.setHours(randomHour(), 0, 0, 0);

  return date;
}

async function createAppointment(
  prisma: PrismaClient,
  therapist: Therapist,
  client: Client,
  start: Date,
  status: string,
) {
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      clientId: client.id,

      startTime: start,
      endTime: end,

      status,
    },
  });
}

export async function seedAppointments(
  prisma: PrismaClient,
  therapists: Therapist[],
  clients: Client[],
) {
  console.log("📅 Creating appointments...");

  for (const therapist of therapists) {
    const therapistClients = clients.filter(
      (c) => c.therapistId === therapist.id,
    );

    for (const client of therapistClients) {
      // ---------- Past appointments ----------

      for (let i = 0; i < 3; i++) {
        const start = randomBusinessDate(
          -Math.floor(Math.random() * 120) - 5,
        );

        await createAppointment(
          prisma,
          therapist,
          client,
          start,
          randomStatus(true),
        );
      }

      // ---------- Future appointments ----------

      for (let i = 0; i < 2; i++) {
        const start = randomBusinessDate(
          Math.floor(Math.random() * 90) + 1,
        );

        await createAppointment(
          prisma,
          therapist,
          client,
          start,
          randomStatus(false),
        );
      }
    }
  }

  console.log("✅ Appointments created.");
}