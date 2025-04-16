import { ApiProperty } from '@nestjs/swagger';

export class CallbackLiqpayDto {
  @ApiProperty()
  data: string;

  @ApiProperty()
  signature: string;
}
