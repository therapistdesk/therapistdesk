import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Module({
  providers: [RemindersService, PrismaService, EmailService],
})
export class RemindersModule {}