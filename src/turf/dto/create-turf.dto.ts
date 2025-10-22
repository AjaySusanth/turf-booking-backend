import { IsString, IsOptional, IsLatitude, IsLongitude, IsArray, ArrayNotEmpty, IsBoolean } from 'class-validator';
import { Sport } from '../../../generated/prisma';

export class CreateTurfDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  location: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  pincode: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsArray()
  @ArrayNotEmpty()
  sports: Sport[]; // ['FOOTBALL', 'CRICKET', ...]

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
