import {
    IsBoolean,
    IsOptional,
    IsString,
} from "class-validator";

export class UpdateLocationDto {
    @IsString()
    name: string;

    @IsString()
    country: string;

    @IsString()
    city: string;

    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}