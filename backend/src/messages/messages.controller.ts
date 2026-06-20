import { Controller, Get, Req, UseGuards, Patch, Param, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private prisma: PrismaService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMessages(@Req() req) {
    const userId = req.user.userId;

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!therapist) return [];

    return this.prisma.message.findMany({
      where: {
        therapistId: therapist.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        appointment: true,
      },
    });
  }

  // ✅ FIX: mark as read endpoint
  // @UseGuards(JwtAuthGuard)
  @Patch('access/:token/:id/read')
  async markAsReadByToken(
    @Param('token') token: string,
    @Param('id') id: string,
  ) {
    const client = await this.prisma.client.findUnique({
      where: { clientAccessToken: token },
    });

    if (!client) {
      throw new UnauthorizedException();
    }

    return this.prisma.message.updateMany({
      where: {
        id: Number(id),
        clientId: client.id, // 🔒 защита
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  @Get('client/:id')
  async getClientMessages(@Param('id') id: string) {
    return this.prisma.message.findMany({
      where: {
        clientId: Number(id),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        appointment: true,
      },
    });
  }

  @Get('access/:token')
  async getMessagesByToken(@Param('token') token: string) {
    // 1. намираме клиента
    console.log("TOKEN:", token);
    const client = await this.prisma.client.findUnique({
      where: { clientAccessToken: token },
    });
    console.log("CLIENT:", client);

    if (!client) {
      return [];
    }

    // 2. връщаме неговите съобщения
    return this.prisma.message.findMany({
      where: {
        clientId: client.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        appointment: true,
      },
    });
  }

  @Get('access/:token/appointments')
  async getAppointmentsByToken(@Param('token') token: string) {
    const client = await this.prisma.client.findUnique({
      where: { clientAccessToken: token },
    });

    if (!client) return [];

    return this.prisma.appointment.findMany({
      where: {
        clientId: client.id,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

}