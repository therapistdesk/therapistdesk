import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @Type(() => Number)
  @IsNumber()
  clientId: number = 0;

  // @IsDateString()
  // startTime: string = '';

  // @IsDateString()
  // endTime: string = '';

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}