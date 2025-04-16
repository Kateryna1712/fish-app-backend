import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeocodingDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lon: number;
}
