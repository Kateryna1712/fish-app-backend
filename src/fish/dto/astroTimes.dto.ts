import { IsNumber, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GeocodingDto } from 'src/google-api/dto/geocoding.dto';

export class AstroTimesDto extends GeocodingDto {
  @ApiProperty()
  @IsDate()
  date: Date;
}
