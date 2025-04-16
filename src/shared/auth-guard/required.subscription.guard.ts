import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequiredSubscriptionType } from './decorators/subscription.decorator';
import { SubscriptionGuardService } from './subscription-guard.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly subscrGuardService: SubscriptionGuardService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredSubscr = this.reflector.get(
      RequiredSubscriptionType,
      context.getHandler(),
    );
    if (!requiredSubscr) {
      return true;
    }
    const req = context.switchToHttp().getRequest();

    const actualySubscrType = await this.subscrGuardService.hasRequiredSubscr(
      req.userId,
      requiredSubscr,
    );

    req['subscrType'] = actualySubscrType;

    return true;
  }
}
