import { PrismaClient } from "@prisma/client";

const NOTES = [
  "Client reported improved mood since the previous session.",
  "Discussed work-related stress and coping strategies.",
  "Explored family dynamics and communication patterns.",
  "Practiced grounding and breathing exercises.",
  "Client completed the assigned homework successfully.",
  "Identified recurring negative thoughts.",
  "Focused on emotional regulation techniques.",
  "Discussed recent conflict with partner.",
  "Reviewed progress toward therapy goals.",
  "Explored childhood experiences related to current concerns.",
  "Client appeared motivated and engaged.",
  "Discussed sleep quality and daily routine.",
  "Worked on identifying cognitive distortions.",
  "Client reported lower anxiety levels this week.",
  "Explored self-esteem and self-compassion.",
  "Discussed boundary setting in relationships.",
  "Reviewed coping skills for stressful situations.",
  "Focused on recognizing emotional triggers.",
  "Client expressed optimism about recent progress.",
  "Planned goals for the next session.",
];

function randomNote() {
  return NOTES[Math.floor(Math.random() * NOTES.length)];
}

export async function seedNotes(prisma: PrismaClient) {
  console.log("📝 Creating notes...");

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "completed",
    },
  });

  for (const appointment of appointments) {
    // около 70% от приключилите срещи имат бележка
    if (Math.random() > 0.7) continue;

    await prisma.note.create({
      data: {
        appointmentId: appointment.id,
        content: randomNote(),
      },
    });
  }

  console.log("✅ Notes created.");
}