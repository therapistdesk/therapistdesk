import { PrismaClient } from "@prisma/client";

import { clearDatabase } from "./seed/clear";
import { seedUsers } from "./seed/users";
import { seedClients } from "./seed/clients";
import { seedAppointments } from "./seed/appointments";
import { seedNotes } from "./seed/notes";
import { seedMessages } from "./seed/messages";
import { seedRecurring } from "./seed/recurring";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting demo seed...");

    await clearDatabase(prisma);

    const therapists = await seedUsers(prisma);

    const clients = await seedClients(
        prisma,
        therapists,
    );

    await seedAppointments(
        prisma,
        therapists,
        clients,
    );

    await seedRecurring(prisma);
    await seedNotes(prisma);
    await seedMessages(prisma);

    console.log("🎉 Demo database created.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });