import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCurWeatherDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lon: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lang?: string;

  date?: Date;
}
