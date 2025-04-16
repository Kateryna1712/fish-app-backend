import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  RawBodyRequest,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { SubscriptionService } from './subscription.service';

import { PaymentIntentDto } from 'src/3d-party/stripe/dto/payment-intent.dto';
import { RequestWithUser } from 'src/UserAuthCommon/user/interfaces/user.interfaces';
import { AuthGuard } from 'src/shared/auth-guard/auth.guard';
import { StripeService } from 'src/3d-party/stripe/stripe.service';
import { PayLiqpayDto } from 'src/3d-party/liqpay/dto/pay-liqpay.dto';
import { SubscriptionLiqpayService } from './subscription-liqpay.service';

@Controller('subscr')
export class SubscriptionController {
  constructor(
    private readonly subscrService: SubscriptionService,
    private readonly subscriptionLiqpayService: SubscriptionLiqpayService,

    private readonly stripeService: StripeService,
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
  @Post('pay-liqpay')
  async paySubscriptionLiqpay(
    @Req() request: RequestWithUser,
    @Body() payLiqpayDto: PayLiqpayDto,
  ) {
    // return this.subscriptionLiqpayService.paySubscription(
    //   request.userId,
    //   payLiqpayDto,
    // );
  }

  @UseGuards(AuthGuard)
  @Get()
  async getSubscription(@Req() request: RequestWithUser) {
    return this.subscrService.getSubscription(request.userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('stripe-webhook')
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const event = this.stripeService.verifySignature(
      req.rawBody,
      req.headers['stripe-signature'],
    );
    console.log('-=-=-=-=-event', event);

    return this.subscrService.webhook(event);
  }
}

// stripe listen --forward-to localhost:8080/api/v1/subsrc/stripe-webhook
