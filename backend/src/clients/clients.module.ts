import { Module, forwardRef } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Client } from './client.entity';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TherapistsModule } from '../therapists/therapists.module';
import { AuthModule } from '../auth/auth.module';
// import { Therapist } from '../therapists/therapist.entity';
import { ClientsPrismaService } from './clients.prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Client, Therapist]),
    forwardRef(() => TherapistsModule),
    AuthModule,
    PrismaModule,
],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsPrismaService],
  exports: [ClientsService],
})
export class ClientsModule {}