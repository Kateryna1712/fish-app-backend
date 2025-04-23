import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';

import { SubscriptionService } from './subscription.service';

import { PaymentIntentDto } from 'src/3d-party/stripe/dto/payment-intent.dto';
import { RequestWithUser } from 'src/UserAuthCommon/user/interfaces/user.interfaces';
import { AuthGuard } from 'src/shared/auth-guard/auth.guard';
import { SubscriptionLiqpayService } from './subscription-liqpay.service';

@Controller('subscr')
export class SubscriptionController {
  constructor(
    private readonly subscrService: SubscriptionService,
    private readonly subscriptionLiqpayService: SubscriptionLiqpayService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('pay-intent')
  async paySubscription(
    @Req() request: RequestWithUser,
    @Body() paymentIntentDto: PaymentIntentDto,
  ) {
    return this.subscrService.paySubscription(request.userId, paymentIntentDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getSubscription(@Req() request: RequestWithUser) {
    return this.subscrService.getSubscription(request.userId);
  }
}
