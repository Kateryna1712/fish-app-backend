import { IsEnum, IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  stripeSubscriptionId: string;

  @IsString()
  stripeCustomerId: string;

  @IsEnum(['active', 'inactive', 'canceled'])
  status: 'active' | 'inactive' | 'canceled';

  @IsUUID()
  planId: string;

  @IsString()
  type: string;

  currentPeriodStart: Date;

  currentPeriodEnd: Date;
}
