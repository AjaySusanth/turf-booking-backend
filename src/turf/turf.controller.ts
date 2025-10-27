import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { TurfService } from './turf.service';
import { CreateTurfDto } from './dto/create-turf.dto';
import { UpdateTurfDto } from './dto/update-turf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { UserRole } from '../../generated/prisma';
import { GetTurfQueryDto } from './dto/get-turf-query.dto';

@Controller('turf')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TurfController {
  constructor(private readonly turfService: TurfService) {}

  @Roles(UserRole.TURF_OWNER)
  @Post()
  create(
    @Req() req,
    @Body() createTurfDto: CreateTurfDto) {
    return this.turfService.create(req.user.userId,createTurfDto);
  }

  @Roles(UserRole.TURF_OWNER)
  @Get('owner')
  findAll(
    @Req() req
  ) {
    return this.turfService.findAllByOwner(req.user.userId);
  }

  @Roles(UserRole.TURF_OWNER)
  @Get('owner/:id')
  findOne(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.turfService.findOne(req.user.userId,id);
  }

  @Roles(UserRole.TURF_OWNER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTurfDto: UpdateTurfDto,
    @Req() req
  ) {
    return this.turfService.update(req.user.userId,id, updateTurfDto);
  }

  @Roles(UserRole.TURF_OWNER)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.turfService.remove(req.user.userId,id);
  }

  @Roles(UserRole.USER)
  @Get()
  async getTurfs(@Query() queryDto:GetTurfQueryDto) {
    return this.turfService.getTurfs(queryDto)
  }
}
