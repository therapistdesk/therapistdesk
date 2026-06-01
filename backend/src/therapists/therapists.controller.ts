import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { TherapistsService } from './therapists.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('therapists')
export class TherapistsController {
  constructor(private service: TherapistsService) {}

@Post('me')
create(@Req() req, @Body() body) {
  return this.service.createProfile(req.user.userId, body);
}

  @Post('location')
addLocation(@Body() body) {
  return this.service.addLocation(1, body); // временно userId=1
}

@Get('me')
get(@Req() req) {
  return this.service.getMyProfile(req.user.userId);
}
}