import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) { }

  @Get()
  findAll(@Req() req) {
    return this.clientsService.findAll(req);
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
}