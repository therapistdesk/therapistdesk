import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";

export enum Gender {
    male = "male",
    female = "female",
}

export class UpdateSettingsDto {
    @IsString()
    @MaxLength(100)
    firstName: string;

    @IsString()
    @MaxLength(100)
    lastName: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    bio?: string;
}