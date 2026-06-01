import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

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
      let sent = (a.remindersSent || '')
        .split(',')
        .filter(Boolean)
        .map(Number);

      const offsets = (a.client?.reminderOffsets || '60')
        .toString()
        .split(',')
        .map(Number);

      for (const minutes of offsets) {
        if (sent.includes(minutes)) continue;

        const reminderTime = new Date(a.startTime);
        reminderTime.setMinutes(reminderTime.getMinutes() - minutes);

        if (now >= reminderTime && now <= new Date(a.startTime)) {
          await this.emailService.sendReminder(
            'd_dichev@yahoo.com',
            'Appointment Reminder',
            `Reminder (${minutes} min): ${a.client?.name} at ${a.startTime}`,
          );

          sent.push(minutes);
        }
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