import { Controller, Post, Body, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('push')
export class PushController {
    constructor(private prisma: PrismaService) { }

    @Post('subscribe')
    async subscribe(@Body() body: any) {
        const { token, subscription } = body;

        // 🔥 игнорирай празни заявки
        if (!token || !subscription) {
            console.log("SKIP INVALID SUBSCRIBE CALL");
            return;
        }

        const client = await this.prisma.client.findUnique({
            where: { clientAccessToken: token },
        });

        if (!client) {
            console.log("CLIENT NOT FOUND");
            return;
        }

        await this.prisma.pushSubscription.upsert({
            where: {
                endpoint_clientId: {
                    endpoint: subscription.endpoint,
                    clientId: client.id,
                },
            },
            update: {
                keys: subscription.keys,
            },
            create: {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                clientId: client.id,
            },
        });

        console.log("SUBSCRIPTION SAVED");

        return { ok: true };
    }

}