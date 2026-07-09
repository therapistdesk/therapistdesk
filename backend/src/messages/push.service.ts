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

    // webpush.setVapidDetails(
    //   process.env.VAPID_SUBJECT || 'mailto:test@test.com',
    //   publicKey,
    //   privateKey,
    // );
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:test@test.com',
      publicKey,
      privateKey,
    );

    const subs = await this.prisma.pushSubscription.findMany({
      where: { clientId },
    });

    console.log(
      "SUBSCRIPTIONS:",
      subs.map(s => ({
        id: s.id,
        clientId: s.clientId,
        endpoint: s.endpoint.slice(-20),
      }))
    );

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
      } catch (err: any) {

        if (err?.statusCode === 404 || err?.statusCode === 410) {
          console.log("REMOVE EXPIRED SUBSCRIPTION:", sub.endpoint);

          await this.prisma.pushSubscription.delete({
            where: {
              endpoint: sub.endpoint,
            },
          });

          continue;
        }
        console.error("PUSH ERROR:", err);
      }
    }
  }
}