import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Req,
    UseGuards,
    Param,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { UpdateServicesDto } from './dto/update-services.dto';
import { UpdateWorkingHoursDto } from "./dto/update-working-hours.dto";

@UseGuards(JwtAuthGuard)
@Controller("settings")
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get("me")
    getMe(@Req() req) {
        return this.settingsService.getMe(req.user.userId);
    }

    @Get("practice")
    getPractice(@Req() req) {
        return this.settingsService.getPractice(req.user.userId);
    }

    @Put("me")
    updateMe(
        @Req() req,
        @Body() body: UpdateSettingsDto,
    ) {
        return this.settingsService.updateMe(
            req.user.userId,
            body,
        );
    }

    @Post("locations")
    createLocation(@Req() req) {
        return this.settingsService.createLocation(
            req.user.userId,
        );
    }

    @Put("locations/:id")
    updateLocation(
        @Req() req,
        @Param("id") id: string,
        @Body() body: UpdateLocationDto,
    ) {
        return this.settingsService.updateLocation(
            req.user.userId,
            Number(id),
            body,
        );
    }

    @Put('services')
    @UseGuards(JwtAuthGuard)
    updateServices(
        @Req() req,
        @Body() dto: UpdateServicesDto,
    ) {
        return this.settingsService.updateServices(
            req.user.userId,
            dto,
        );
    }

    @Put("working-hours")
    updateWorkingHours(
        @Req() req,
        @Body() dto: UpdateWorkingHoursDto,
    ) {
        return this.settingsService.updateWorkingHours(
            req.user.userId,
            dto,
        );
    }
}