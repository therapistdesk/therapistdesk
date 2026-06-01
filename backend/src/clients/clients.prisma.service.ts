import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsPrismaService {
  constructor(private prisma: PrismaService) { }

async findAll(therapistId: number) {
  return this.prisma.client.findMany({
    where: {
      therapistId,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

create(data: any) {
  return this.prisma.client.create({
    data,
  });
}

  async updateClient(userId: number, id: number, name: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return this.prisma.client.update({
      where: { id },
      data: { name },
    });
  }

  async deleteClient(userId: number, id: number) {
    const client = await this.prisma.client.findFirst({
      where: { id, },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }

  async updateReminderOffsets(
    id: number,
    offsets: number[],
    userId: number,
  ) {
    const client = await this.prisma.client.findFirst({
      where: { id, },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        reminderOffsets: offsets.join(','),
      },
    });
  }
}