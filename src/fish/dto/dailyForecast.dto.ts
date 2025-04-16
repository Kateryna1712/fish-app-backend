import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DailyForecastDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lon: number;

  //date in format YYYY-MM-DD
  @ApiProperty()
  @IsString()
  date: string;
}
