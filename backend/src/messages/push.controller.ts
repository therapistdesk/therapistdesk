import { Controller, Post, Body, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('push')
export class PushController {
    constructor(private prisma: PrismaService) { }

    @Post('subscribe')
    async subscribe(@Body() body: any, @Req() req: any) {
        const userId = 1; // тестово

        const therapist = await this.prisma.therapist.findUnique({
            where: { userId },
        });

        if (!therapist) return { ok: false };

        const clientId = body.clientId;

        if (!clientId) {
            console.log("NO CLIENT ID");
            return { ok: false };
        }

        if (!body?.endpoint || !body?.p256dh || !body?.auth) {
            console.log("INVALID SUB DATA");
            return { ok: false };
        }

        console.log("SAVING SUB FOR CLIENT:", clientId);

        await this.prisma.pushSubscription.upsert({
            where: { endpoint: body.endpoint },
            update: {},
            create: {
                clientId: clientId,
                endpoint: body.endpoint,
                p256dh: body.p256dh,
                auth: body.auth,
            },
        });

        return { ok: true };
    }
}