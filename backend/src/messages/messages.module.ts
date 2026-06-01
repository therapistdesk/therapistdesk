import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PushService, PrismaService],
  exports: [PushService], // 👈 КРИТИЧНО
})
export class MessagesModule {}