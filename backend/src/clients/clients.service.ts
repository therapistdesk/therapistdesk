import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsPrismaService } from './clients.prisma.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ClientsService {
  constructor(
    private prismaService: ClientsPrismaService,
    private prisma: PrismaService,
  ) { }

  async findAll(req: any) {
    const userId = req.user.userId;

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    // return this.prisma.therapistClient.findMany({
    //   where: {
    //     therapistId: therapist.id,
    //   },
    //   include: {
    //     client: true,
    //   },
    //   orderBy: {
    //     id: 'desc',
    //   },
    // });
    return this.prisma.client.findMany({
      where: {
        therapistId: therapist.id,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }


  async createClient(dto: any, userId: number) {
    const token = randomUUID();

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!therapist) {
      throw new Error("Therapist not found");
    }

    // 1. създаваме client
    const client = await this.prisma.client.create({
      data: {
        name: dto.name,
        phone: dto.phone || null,
        email: dto.email || null,
        notes: dto.notes || null,
        country: dto.country || null,
        city: dto.city || null,
        clientAccessToken: token,
        therapistId: therapist.id,
      },
    });

    // // 2. създаваме връзката (ВАЖНО)
    // await this.prisma.therapistClient.create({
    //   data: {
    //     therapistId: therapist.id,
    //     clientId: client.id,
    //   },
    // });

    return client;
  }

  async updateClient(userId: number, id: number, name: string) {
    return this.prismaService.updateClient(userId, id, name);
  }

  async deleteClient(id: number, userId: number) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!therapist) {
      throw new Error('Therapist not found');
    }

    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client || client.therapistId !== therapist.id) {
      throw new Error('Unauthorized');
    }

    console.log("DELETE CLIENT:", id);

    // 🔥 взимаме всички срещи
    const appointments = await this.prisma.appointment.findMany({
      where: { clientId: id },
    });

    if (appointments.length === 0) {
      // ✔ няма срещи → трием
      return this.prisma.client.delete({
        where: { id },
      });
    }

    const hasActive = appointments.some(a => a.status !== 'cancelled');

    if (hasActive) {
      throw new Error('Client has active appointments');
    }

    const hasClientCancelled = appointments.some(
      a => a.status === 'cancelled' && a.cancelledBy === 'client'
    );

    if (hasClientCancelled) {
      throw new Error('Client has cancelled appointments (by client)');
    }

    // ✔ тук значи: има САМО cancelled от therapist

    await this.prisma.appointment.deleteMany({
      where: { clientId: id },
    });

    await this.prisma.pushSubscription.deleteMany({
      where: { clientId: id },
    });

    await this.prisma.message.deleteMany({
      where: { clientId: id },
    });

    return this.prisma.client.delete({
      where: { id },
    });
  }

  async getClientAccess(token: string) {
    if (!token) {
      throw new BadRequestException('Token required');
    }

    const client = await this.prisma.client.findUnique({
      where: { clientAccessToken: token }, // ✅ тук
      include: {
        appointments: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    await this.prisma.appointment.updateMany({
      where: {
        clientId: client.id,
        seenAt: null,
      },
      data: {
        seenAt: new Date(),
      },
    });

    const updatedClient = await this.prisma.client.findUnique({
      where: { clientAccessToken: token },
      include: {
        appointments: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Invalid token');
    }

    return {
      id: client.id,
      name: client.name,
      appointments: client.appointments,
    };
  }

  async updateReminder(id: number, minutes: number, userId: number) {
    return this.prismaService.updateReminderOffsets(id, [minutes], userId);
  }

  async updateReminderOffsets(
    id: number,
    offsets: number[],
    userId: number,
  ) {
    return this.prismaService.updateReminderOffsets(id, offsets, userId);
  }
}