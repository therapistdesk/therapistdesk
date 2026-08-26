import {
    IsInt,
    IsObject,
    IsOptional,
    IsString,
} from "class-validator";

export class UpdateWorkingHoursIntervalDto {
    @IsOptional()
    @IsInt()
    id?: number;

    @IsString()
    start: string;

    @IsString()
    end: string;

    @IsString()
    type: string;
}

export class UpdateWorkingHoursDto {
    @IsInt()
    locationId: number;

    @IsObject()
    workingHours: {
        [day: string]: UpdateWorkingHoursIntervalDto[];
    };
}