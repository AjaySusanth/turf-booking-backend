import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../generated/prisma';
import { Roles } from '../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post('register')
  async registerOwner(
    @Req() req,
    @Body() dto: RegisterOwnerDto
  ) {
    return this.ownerService.registerOwner(req.user.userId,dto)
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.TURF_OWNER)
  @Get('me')
  async getProfile(
    @Req() req,
  ) {
    return this.ownerService.getProfile(req.user.userId)
  }
  
}
