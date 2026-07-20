import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { SmsService } from './sms.service';
import { PushService } from './push.service';

// 🔴 CRITICAL: cancel = status cancelled (no delete)

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private pushService: PushService,
  ) {
  }

  @Cron('*/5 * * * *')
  async markCompleted() {
    const now = new Date();

    await this.prisma.appointment.updateMany({
      where: {
        startTime: { lt: now },
        status: 'scheduled',
      },
      data: {
        status: 'completed',
      },
    });
  }

  @Cron('0 * * * * *')
  async processMessages() {
    const now = new Date();
    let messages = [];

    try {
      messages = await this.prisma.message.findMany({
        where: {
          status: 'pending',
          sendAt: { lte: now },
          appointmentId: { not: null },

          // 🔥 НОВО
          appointment: {
            status: { not: 'cancelled' },
          },
        },
        orderBy: {
          sendAt: 'asc',
        },
      });
    } catch (e) {
      return; // 🔥 СПИРАМЕ текущия cron, чакаме следващия
    }
    for (const msg of messages as any[]) {
      try {
        if (msg.status === 'sent') continue;
        const appointment = await this.prisma.appointment.findUnique({
          where: { id: msg.appointmentId },
          include: {
            client: true,
            therapist: true, // 🔥 маха още 1 заявка
          },
        });

        if (!appointment || !appointment.client) {
          continue;
        }

        const therapist = await this.prisma.therapist.findUnique({
          where: { id: appointment.therapistId },
        });

        const therapistName = therapist
          ? `${therapist.firstName} ${therapist.lastName}`
          : 'Вашият терапевт';

        // 🔧 стабилно форматиране
        const d = new Date(appointment.startTime);

        const date = d.toLocaleDateString('bg-BG');
        const time = d.toLocaleTimeString('bg-BG', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const clientName = appointment.client?.name || '';

        let title = 'Известие';
        let body = `${clientName ? clientName + ', ' : ''}${date} • ${time}\nТерапевт: ${therapistName}`;
        switch (msg.type) {
          case 'appointment_created':
            title = '📅 Нова среща';
            body =
              `${clientName ? clientName + ', ' : ''}` +
              `Имате нова среща.\n` +
              `${date} • ${time}\n` +
              `Терапевт: ${therapistName}`;
            break;

          case 'appointment_updated':
            title = '🔄 Срещата е променена';
            body =
              `${clientName ? clientName + ', ' : ''}` +
              `Срещата беше променена.\n` +
              `${date} • ${time}\n` +
              `Терапевт: ${therapistName}`;
            break;

          case 'appointment_cancelled':
            title = '❌ Срещата е отменена';
            body =
              `${clientName ? clientName + ', ' : ''}` +
              `Срещата беше отменена.\n` +
              `${date} • ${time}`;
            break;

          case 'reminder_72h':
          case 'reminder_24h':
          case 'reminder_1h':
            title = '⏰ Напомняне за среща';
            body =
              `${clientName ? clientName + ', ' : ''}` +
              `${date} • ${time}\n` +
              `Терапевт: ${therapistName}`;
            break;
        }

        // 🔥 ЕДИНЕН PAYLOAD
        const payload = {
          title,
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/badge.png',
          tag: `appointment-${appointment.id}`,
          data: {
            appointmentId: appointment.id,
            url: `/appointments/${appointment.id}`,
            therapistName,
            date,
            time,
          },
        };

        // 🔥 PUSH
        await this.pushService.sendToClient(msg.clientId, payload);

        // 🔥 SMS (по-добър текст)
        const client = await this.prisma.client.findUnique({
          where: { id: msg.clientId },
        });

        if (client?.phone && process.env.SMS_ENABLED === 'true') {
          await this.smsService.sendSms(
            client.phone,
            `${date} • ${time}\nТерапевт: ${therapistName}`
          );
        }

        // 🔒 mark sent
        await this.prisma.message.update({
          where: { id: msg.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        });

      } catch (e) {
        await this.prisma.message.update({
          where: { id: msg.id },
          data: { status: 'failed' },
        });
      }
    }
  }

  @Cron('0 3 * * *')
  async archiveOldAppointments() {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);

    await this.prisma.appointment.updateMany({
      where: {
        startTime: { lt: cutoff },
        status: 'completed',
      },
      data: {
        status: 'archived',
      },
    });
  }

  @Cron('0 4 * * *')
  async cleanupMessages() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const result = await this.prisma.message.deleteMany({
      where: {
        status: 'sent',
        sentAt: { lt: cutoff },
      },
    });
  }

  @Cron('0 3 * * *')
  async cleanup() {
    const now = new Date();

    // 🟢 1. reminders (7 дни)
    const reminderCutoff = new Date(now);
    reminderCutoff.setDate(reminderCutoff.getDate() - 7);

    const deletedReminders = await this.prisma.message.deleteMany({
      where: {
        type: 'reminder',
        status: 'sent',
        sentAt: { lt: reminderCutoff },
      },
    });

    // 🟢 2. broadcast (3 месеца)
    const broadcastCutoff = new Date(now);
    broadcastCutoff.setMonth(broadcastCutoff.getMonth() - 3);

    const deletedBroadcast = await this.prisma.message.deleteMany({
      where: {
        type: 'broadcast',
        sentAt: { lt: broadcastCutoff },
      },
    });
  }
}