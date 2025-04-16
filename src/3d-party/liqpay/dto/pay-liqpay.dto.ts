import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, IsUUID } from 'class-validator';

export class PayLiqpayDto {
  @ApiProperty()
  @IsUUID()
  planId: string;

  @IsString()
  currency: string;

  @ApiProperty()
  @IsNumber()
  amount: number;
}
