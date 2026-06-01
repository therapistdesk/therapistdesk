import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsPrismaService {
  constructor(private prisma: PrismaService) {}
  
  async create(userId: number, data: any) {
    console.log("CREATE RECEIVED:", data.startTime, typeof data.startTime);
    return this.prisma.appointment.create({
      data: {
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        therapistId: userId,
        clientId: data.clientId,
        status: 'scheduled',
      },
    });
  }
}