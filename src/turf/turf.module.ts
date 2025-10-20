import { Module } from '@nestjs/common';
import { TurfService } from './turf.service';
import { TurfController } from './turf.controller';

@Module({
  controllers: [TurfController],
  providers: [TurfService],
})
export class TurfModule {}
