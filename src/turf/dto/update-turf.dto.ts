import { PartialType } from '@nestjs/mapped-types';
import { CreateTurfDto } from './create-turf.dto';

export class UpdateTurfDto extends PartialType(CreateTurfDto) {}
