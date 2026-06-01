import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService], // 👈 МНОГО ВАЖНО
})
export class EmailModule {}