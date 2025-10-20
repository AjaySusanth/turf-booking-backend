import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TurfService } from './turf.service';
import { CreateTurfDto } from './dto/create-turf.dto';
import { UpdateTurfDto } from './dto/update-turf.dto';

@Controller('turf')
export class TurfController {
  constructor(private readonly turfService: TurfService) {}

  @Post()
  create(@Body() createTurfDto: CreateTurfDto) {
    return this.turfService.create(createTurfDto);
  }

  @Get()
  findAll() {
    return this.turfService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.turfService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTurfDto: UpdateTurfDto) {
    return this.turfService.update(+id, updateTurfDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.turfService.remove(+id);
  }
}
