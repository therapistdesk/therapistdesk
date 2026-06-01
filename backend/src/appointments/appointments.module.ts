import { Module } from '@nestjs/common';

// import { Appointment } from './appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PushService } from '../messages/push.service';
import { MessagesModule } from '../messages/messages.module';

// import { Client } from '../clients/client.entity';
import { AuthModule } from '../auth/auth.module';
import { AppointmentsPrismaService } from './appointments.prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    AuthModule, // 🔥 ТОВА Е КЛЮЧЪТ
    PrismaModule,
    MessagesModule,
  ],
  providers: [AppointmentsService, AppointmentsPrismaService],
  controllers: [AppointmentsController],
  
})
export class AppointmentsModule {}