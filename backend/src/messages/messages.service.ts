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
    console.log("MessagesService INIT");
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

    console.log('MARK COMPLETED DONE');
  }

  @Cron('* * * * *')
  async processMessages() {
    console.log("CRON TICK");

    const now = new Date();
    console.log("NOW:", now);

    const messages = await this.prisma.message.findMany({
      where: {
        status: 'pending',
        sendAt: { lte: now },
        appointmentId: { not: null }, // 🔒 защита
      },
      orderBy: {
        sendAt: 'asc', // 🔧 по-логично (старите първо)
      },
    });

    console.log("MESSAGES FOUND:", messages.length);

    for (const msg of messages as any[]) {
      console.log("PROCESSING MSG:", msg.id);

      try {
        // 🔒 duplicate защита
        const alreadySent = await this.prisma.message.findFirst({
          where: {
            appointmentId: msg.appointmentId,
            sendAt: msg.sendAt,
            status: 'sent',
          },
        });

        if (alreadySent) {
          console.log("SKIP DUPLICATE:", msg.id);
          continue;
        }

        const appointment = await this.prisma.appointment.findUnique({
          where: { id: msg.appointmentId },
          include: { client: true },
        });

        if (!appointment || !appointment.client) {
          console.log("INVALID APPOINTMENT:", msg.id);
          continue;
        }

        // 🔒 therapist
        const therapist = await this.prisma.therapist.findUnique({
          where: { id: appointment.therapistId },
        });

        // 🔧 стабилно форматиране
        const d = new Date(appointment.startTime);

        const date = d.toLocaleDateString('bg-BG');
        const time = d.toLocaleTimeString('bg-BG', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const therapistName = therapist
          ? `${therapist.firstName} ${therapist.lastName}`
          : 'Вашият терапевт';

        const clientName = appointment.client?.name || '';

        // 🔥 ЕДИНЕН PAYLOAD
        const payload = {
          title: 'Напомняне за среща',
          body: `${clientName ? clientName + ', ' : ''}${date} • ${time}\nТерапевт: ${therapistName}`,
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

        console.log("PUSH PAYLOAD:", payload);

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

        console.log("SENT:", msg.id);

      } catch (e) {
        console.log("FAILED:", msg.id, e);

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

    console.log('ARCHIVE DONE');
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

    console.log('CLEANUP MESSAGES:', result.count);
  }

  @Cron('0 3 * * *')
  async cleanup() {
    console.log("CLEANUP START");

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

    console.log("CLEANUP DONE:", {
      reminders: deletedReminders.count,
      broadcast: deletedBroadcast.count,
    });
  }
}