import { Injectable } from '@nestjs/common';
import { NotesPrismaService } from './notes.prisma.service';

@Injectable()
export class NotesService {
  constructor(private prismaService: NotesPrismaService) {}

  async create(content: string, appointmentId: number) {
    return this.prismaService.prisma.note.create({
      data: {
        content,
        appointment: {
          connect: { id: appointmentId },
        },
      },
    });
  }

  async findByAppointment(appointmentId: number) {
    return this.prismaService.prisma.note.findMany({
      where: {
        appointment: {
          id: appointmentId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAll() {
    return this.prismaService.findAll();
  }
}