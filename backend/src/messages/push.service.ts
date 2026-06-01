import { Injectable } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushService {
    constructor(private prisma: PrismaService) {
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;

        if (!publicKey || !privateKey) {
            console.log('PUSH DISABLED (no VAPID keys)');
            return;
        }

        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:test@test.com',
            publicKey,
            privateKey,
        );
    }

async sendToClient(clientId: number, payload: any) {
  console.log("SEND PUSH → clientId:", clientId);

  const subs = await this.prisma.pushSubscription.findMany();

  console.log("SUBS COUNT:", subs.length);

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      );
    } catch (err) {
      console.log("PUSH ERROR:", err);
    }
  }
}
}