import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() body: any) {
    const content = body.content;
    const appointmentId = Number(body.appointmentId);

    return this.notesService.create(content, appointmentId);
  }

  @Get(':appointmentId')
  find(@Param('appointmentId') appointmentId: string) {
    return this.notesService.findByAppointment(Number(appointmentId));
  }

  @Get()
  findAll() {
    return this.notesService.findAll();
  }
}