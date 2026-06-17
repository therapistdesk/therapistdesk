import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) { }

  @Post()
  create(@Req() req, @Body() body) {
    return this.appointmentsService.create(body, req.user.userId);
  }

  @Post('recurring')
  createRecurring(@Req() req, @Body() body) {
    return this.appointmentsService.createRecurring(body, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.update(Number(id), dto);
  }

  // 🔥 THERAPIST (authenticated)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Req() req,
    @Body() body: { status: 'scheduled' | 'completed' | 'cancelled' },
  ) {
    return this.appointmentsService.updateStatus(
      Number(id),
      body.status,
      undefined,
      undefined,
      req.user.userId,
    );
  }

  // 🔥 CLIENT (public via token)
  @Public()
  @Patch(':id/status/public')
  updateStatusPublic(
    @Param('id') id: string,
    @Query('token') token: string,
    @Body() body: { status: 'confirmed' | 'cancelled'; reason?: string },
  ) {
    return this.appointmentsService.updateStatus(
      Number(id),
      token,
      body.status,
      body.reason,
    );
  }

  @Public()
  @Patch(':id/seen')
  markSeen(
    @Param('id') id: string,
    @Query('token') token: string,
  ) {
    return this.appointmentsService.markSeen(Number(id), token);
  }

  @Get()
  findForUser(@Req() req: any, @Query() query: any) {
    return this.appointmentsService.findForUser(req.user.userId, query);
  }

  @Get('date')
  findByDate(@Query('date') date: string, @Req() req) {
    return this.appointmentsService.findByDate(date, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.appointmentsService.findOne(Number(id), req.user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.appointmentsService.delete(Number(id), req.user.userId);
  }
}