import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  @Cron('* * * * *')
  async checkAppointments() {
    const now = new Date();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        // ако имаш такова поле
        // reminderSent: false,
      },
      include: {
        client: true,
      },
    });

    for (const a of appointments) {
      if (now >= new Date(a.startTime)) {
        continue;
      }
      let sent = (a.remindersSent || '')
        .split(',')
        .filter(Boolean)
        .map(Number);

      const offsets = (a.client?.reminderOffsets || '60')
        .toString()
        .split(',')
        .map(Number);

      const dueOffsets = offsets
        .filter((minutes) => !sent.includes(minutes))
        .filter((minutes) => {
          const reminderTime = new Date(a.startTime);
          reminderTime.setMinutes(reminderTime.getMinutes() - minutes);

          return now >= reminderTime;
        });

      if (dueOffsets.length > 0) {
        const minutes = Math.min(...dueOffsets);

        await this.emailService.sendReminder(
          'd_dichev@yahoo.com',
          'Appointment Reminder',
          `Reminder (${minutes} min): ${a.client?.name} at ${a.startTime}`,
        );

        // маркираме всички вече пропуснати напомняния като изпратени
        sent.push(...dueOffsets);
      }

      await this.prisma.appointment.update({
        where: { id: a.id },
        data: {
          remindersSent: sent.join(','),
        },
      });
    }
  }
}