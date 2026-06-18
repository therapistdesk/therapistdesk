import { Injectable } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushService {
  constructor(private prisma: PrismaService) {
    console.log("PUSH SERVICE INIT");
  }

  async sendToClient(clientId: number, payload: any) {
    console.log("SEND PUSH → clientId:", clientId);
    console.log("PAYLOAD:", payload);

    // 🔥 Гарантирана инициализация всеки път
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    console.log("VAPID NOW:", publicKey, privateKey);

    if (!publicKey || !privateKey) {
      console.log("NO VAPID KEYS");
      return;
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:test@test.com',
      publicKey,
      privateKey,
    );

    const subs = await this.prisma.pushSubscription.findMany({
      where: { clientId },
    });

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

        console.log("PUSH SENT");
      } catch (err) {
        console.log("FULL ERROR:", err); // 🔥 пълен лог
      }
    }
  }
}