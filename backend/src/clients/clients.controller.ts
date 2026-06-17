import {
  Controller,
  Get,
  Query,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(
    private prisma: PrismaService,
    private clientsService: ClientsService,
  ) { }

  @Get()
  findAll(@Req() req) {
    return this.clientsService.findAll(req);
  }

  @Get('access')
  @Public()
  async access(@Query('token') token: string) {
    return this.clientsService.getClientAccess(token);
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.clientsService.createClient(body, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() body: any) {
    return this.clientsService.updateClient(
      req.user.userId,
      Number(id),
      body.name,
    );
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string, @Req() req: any) {
    console.log("REQ.USER:", req.user); // 👈 добави това

    return this.clientsService.deleteClient(Number(id), req.user.userId);
  }

  // 🔥 НОВО: reminder
  @Patch(':id/reminders')
  updateReminderOffsets(
    @Param('id') id: string,
    @Body() body: { offsets: number[] },
    @Req() req,
  ) {
    return this.clientsService.updateReminderOffsets(
      Number(id),
      body.offsets,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/alias')
  async updateAlias(
    @Param('id') clientId: string,
    @Body() body: { alias: string },
    @Req() req
  ) {
    console.log("REQ USER:", req.user); // 👈 DEBUG

    const userId = req.user.userId || req.user.sub;

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    // return this.prisma.therapistClient.update({
    //   where: {
    //     therapistId_clientId: {
    //       therapistId: therapist.id,
    //       clientId: Number(clientId),
    //     },
    //   },
    //   data: {
    //     alias: body.alias,
    //   },
    // });
    return this.prisma.client.update({
      where: {
        id: Number(clientId),
      },
      data: {
        alias: body.alias,
      },
    });
  }
}