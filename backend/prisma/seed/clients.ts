import { PrismaClient, Client, Therapist } from "@prisma/client";
import { randomUUID } from "crypto";

const demoClients = [
  {
    name: "Иван Петров",
    email: "ivan@example.com",
    phone: "0888000001",
  },
  {
    name: "Мария Георгиева",
    email: "maria@example.com",
    phone: "0888000002",
  },
  {
    name: "Петър Димитров",
    email: "petar@example.com",
    phone: "0888000003",
  },
  {
    name: "Елена Стоянова",
    email: "elena@example.com",
    phone: "0888000004",
  },
  {
    name: "Георги Иванов",
    email: "georgi@example.com",
    phone: "0888000005",
  },
];

export async function seedClients(
  prisma: PrismaClient,
  therapists: Therapist[]
): Promise<Client[]> {
  console.log("\n👥 Creating demo clients...");

  const therapist = therapists[0];

  const clients: Client[] = [];

  for (const item of demoClients) {
    const client = await prisma.client.create({
      data: {
        therapistId: therapist.id,

        name: item.name,
        email: item.email,
        phone: item.phone,

        reminderOffsets: JSON.stringify([10080, 1440, 60]),

        clientAccessToken: randomUUID(),
      },
    });

    clients.push(client);
  }

  console.log(`✅ ${clients.length} demo clients created`);

  return clients;
}