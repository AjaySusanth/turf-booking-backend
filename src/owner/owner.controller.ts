import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterOwnerDto } from './dto/register-owner.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async registerOwner(
    @Req() req,
    @Body() dto: RegisterOwnerDto
  ) {
    return this.ownerService.registerOwner(req.user.userId,dto)
  }
}
