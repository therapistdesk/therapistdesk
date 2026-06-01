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

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private service: AppointmentsService) { }

  @Post()
  create(@Req() req, @Body() body) {
    return this.service.create(body, req.user.userId);
  }

  @Post('recurring')
  createRecurring(@Body() body) {
    console.log("RECURRING HIT", body);
    return this.service.createRecurring(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.service.update(Number(id), dto, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Req() req,
    @Body() body: { status: 'scheduled' | 'completed' | 'cancelled' },
  ) {
    return this.service.updateStatus(Number(id), body.status, req.user.userId);
  }

  @Get()
  findForUser(@Req() req: any, @Query() query: any) {
    return this.service.findForUser(req.user.userId, query);
  }

  @Get('date')
  findByDate(@Query('date') date: string, @Req() req) {
    return this.service.findByDate(date, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.service.findOne(Number(id), req.user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.service.delete(Number(id), req.user.userId);
  }
}