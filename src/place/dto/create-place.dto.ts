import { IsNumber, IsString } from 'class-validator';

export class CreatePlaceDto {
  @IsString()
  title: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;
}
