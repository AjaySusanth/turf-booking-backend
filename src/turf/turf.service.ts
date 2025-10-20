import { Injectable } from '@nestjs/common';
import { CreateTurfDto } from './dto/create-turf.dto';
import { UpdateTurfDto } from './dto/update-turf.dto';

@Injectable()
export class TurfService {
  create(createTurfDto: CreateTurfDto) {
    return 'This action adds a new turf';
  }

  findAll() {
    return `This action returns all turf`;
  }

  findOne(id: number) {
    return `This action returns a #${id} turf`;
  }

  update(id: number, updateTurfDto: UpdateTurfDto) {
    return `This action updates a #${id} turf`;
  }

  remove(id: number) {
    return `This action removes a #${id} turf`;
  }
}
