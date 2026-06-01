import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TherapistsModule } from './therapists/therapists.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { MessagesService } from './messages/messages.service';
import { SmsService } from './messages/sms.service';
import { PushService } from './messages/push.service';
import { PushController } from './messages/push.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TherapistsModule,
    ClientsModule,
    AppointmentsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PushController],
  providers: [MessagesService, SmsService, PushService],
})
export class AppModule {}