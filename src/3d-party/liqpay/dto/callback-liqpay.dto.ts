import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, IsUUID } from 'class-validator';

export class CallbackLiqpayDto {
  @ApiProperty()
  data: string;

  @ApiProperty()
  signature: string;
}
