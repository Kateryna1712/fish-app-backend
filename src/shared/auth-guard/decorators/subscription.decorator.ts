import { Reflector } from '@nestjs/core';

export const RequiredSubscriptionType = Reflector.createDecorator<string[]>();
