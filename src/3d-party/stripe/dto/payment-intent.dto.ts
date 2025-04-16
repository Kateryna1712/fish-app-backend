import { IsNumber, IsString, IsUUID } from 'class-validator';

export class PaymentIntentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  gateway: string;

  @IsUUID()
  planId: string;

  //   @IsString()
  //   paymentMethodId: string;
}
