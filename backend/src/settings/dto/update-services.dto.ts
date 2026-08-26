import { IsArray } from 'class-validator';

export class UpdateServicesDto {
  @IsArray()
  categories: any[];
}