import { IsOptional, IsString } from 'class-validator';

export class LiqpayDto {
  @IsString()
  email: string;

  @IsString()
  amount: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  card: string;

  @IsString()
  card_exp_month: string;

  @IsString()
  card_exp_year: string;

  @IsString()
  card_cvv: string;
}
