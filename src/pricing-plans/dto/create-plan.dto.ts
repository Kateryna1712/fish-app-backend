import { IsNumber, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  stripePlanId: string;

  @IsNumber()
  price: number;

  @IsString()
  stripePriceId: string;

  @IsString()
  permission: string;

  @IsString()
  description: string;

  @IsString()
  currency: string;
}
