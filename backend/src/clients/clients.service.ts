import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsPrismaService } from './clients.prisma.service';
import { PrismaService } from '../prisma/prisma.service';

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

    return this.prismaService.findAll(therapist.id);
  }



  async createClient(dto: any, userId: number) {
  const therapist = await this.prisma.therapist.findUnique({
    where: { userId },
  });

  if (!therapist) {
    throw new Error("Therapist not found");
  }

  return this.prisma.client.create({
    data: {
      name: dto.name,
      phone: dto.phone || null,
      email: dto.email || null,
      notes: dto.notes || null,

      country: dto.country || null,
      city: dto.city || null,

      therapistId: therapist.id,
    },
  });
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

    return this.prisma.client.delete({
      where: {
        id,
        therapistId: therapist.id,
      },
    });
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