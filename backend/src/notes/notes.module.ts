import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
// import { Appointment } from '../appointments/appointment.entity';
// import { AuthModule } from '../auth/auth.module';
import { NotesPrismaService } from './notes.prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Note, Appointment]),
    PrismaModule, // 👈 добавяш ТУК
  ],
  providers: [NotesService, NotesPrismaService],
  controllers: [NotesController],
})
export class NotesModule {}