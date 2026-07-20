import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('push')
export class PushController {
  constructor(private prisma: PrismaService) { }

  @Post('subscribe')
  async subscribe(@Body() body: any) {
    const {
      endpoint,
      p256dh,
      auth,
      clientId,
      token,
      subscription,
    } = body;

    let finalClientId = clientId;
    let finalEndpoint = endpoint;
    let finalP256dh = p256dh;
    let finalAuth = auth;

    // Старият формат (ClientAccess)
    if (token && subscription) {
      const client = await this.prisma.client.findUnique({
        where: {
          clientAccessToken: token,
        },
      });

      if (!client) {
        return;
      }

      finalClientId = client.id;
      finalEndpoint = subscription.endpoint;
      finalP256dh = subscription.keys.p256dh;
      finalAuth = subscription.keys.auth;
    }

    // Проверка след нормализиране
    if (!finalEndpoint || !finalP256dh || !finalAuth || !finalClientId) {
      return;
    }

    await this.prisma.pushSubscription.upsert({
      where: {
        endpoint: finalEndpoint,
      },
      update: {
        clientId: finalClientId,
        p256dh: finalP256dh,
        auth: finalAuth,
      },
      create: {
        endpoint: finalEndpoint,
        clientId: finalClientId,
        p256dh: finalP256dh,
        auth: finalAuth,
      },
    });
    return { ok: true };
  }
}