import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscr.dto';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {}
