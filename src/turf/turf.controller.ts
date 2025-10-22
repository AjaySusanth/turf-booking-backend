import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { TurfService } from './turf.service';
import { CreateTurfDto } from './dto/create-turf.dto';
import { UpdateTurfDto } from './dto/update-turf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { UserRole } from '../../generated/prisma';

@Controller('turf')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TURF_OWNER)
export class TurfController {
  constructor(private readonly turfService: TurfService) {}

  @Post()
  create(
    @Req() req,
    @Body() createTurfDto: CreateTurfDto) {
    return this.turfService.create(req.user.userId,createTurfDto);
  }

  @Get()
  findAll(
    @Req() req
  ) {
    return this.turfService.findAllByOwner(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.turfService.findOne(req.user.userId,id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTurfDto: UpdateTurfDto,
    @Req() req
  ) {
    return this.turfService.update(req.user.userId,id, updateTurfDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.turfService.remove(req.user.userId,id);
  }
}
