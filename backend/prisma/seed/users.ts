import { PrismaClient, Therapist } from "@prisma/client";
import bcrypt from "bcrypt";

export async function seedUsers(
  prisma: PrismaClient
): Promise<Therapist[]> {
  console.log("\n👨‍⚕️ Creating demo therapist...");

  const password = await bcrypt.hash("12345678", 10);

  const user = await prisma.user.create({
    data: {
      email: "demo@therapistdesk.com",
      password,
      isVerified: true,
    },
  });

  const therapist = await prisma.therapist.create({
    data: {
      userId: user.id,

      firstName: "Demo",
      lastName: "Therapist",

      phone: "0888123456",

      gender: "male",

      settings: {
        create: {
          reminderOffsets: JSON.stringify([10080, 1440, 60]),
          retentionMonths: 12,
        },
      },

      locations: {
        create: {
          name: "Main Office",
          country: "Bulgaria",
          city: "Sofia",
          address: "Demo Street 1",
        },
      },
    },
  });

  console.log("✅ Demo therapist created");

  return [therapist];
}