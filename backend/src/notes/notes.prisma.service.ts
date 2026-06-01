import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesPrismaService {
  constructor(public prisma: PrismaService) {}

  async findAll() {
    return this.prisma.note.findMany({
      include: {
        appointment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}