import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as LiqPay from 'liqpayjs-sdk';
import 'dotenv/config';
import { LiqpayDto } from './dto/liqpay-dto';
import { UserRepository } from '@/UserAuthCommon/user/repository/user.repository';
import { PlanService } from '@/pricing-plans/plan.service';
import { Subscription } from '@/pricing-plans/entities/subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LiqpayService {
  private readonly logger = new Logger(LiqpayService.name);
  private liqpayPublicKey: string;
  private liqpayPrivateKey: string;
  private readonly liqpay: LiqPay;

  constructor(
    private configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly planService: PlanService,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {
    this.liqpayPublicKey = this.configService.get('LIQPAY_PUBLIC');
    this.liqpayPrivateKey = this.configService.get('LIQPAY_PRIVATE');

    this.liqpay = new LiqPay(
      process.env.LIQPAY_PUBLIC,
      process.env.LIQPAY_PRIVATE,
    );
  }

  async test(dto: LiqpayDto) {
    const foundUser = await this.userRepository.findOneByEmail(dto.email);

    const plan = await this.planService.findOneByName(dto.plan_type);

    if (!plan) {
      throw new HttpException(
        'Free plan not found in database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (plan.name === foundUser.subscriptions[0].type) {
      return { err_description: 'Subscription is the same as current' };
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const self = this;

    return new Promise((resolve) => {
      this.liqpay.api(
        'request',
        {
          action: 'subscribe',
          version: '3',
          amount: String(plan.price),
          currency: plan.currency,
          description: dto.description,
          order_id: formattedDate,
          subscribe: '1',
          subscribe_date_start: formattedDate,
          subscribe_periodicity: 'month',
          card: dto.card,
          card_exp_month: dto.card_exp_month,
          card_exp_year: dto.card_exp_year,
          card_cvv: dto.card_cvv,
        },
        function (response) {
          self.subscriptionRepository.update(foundUser.subscriptions[0].id, {
            type: plan.name,
            plan: { id: plan.id },
          });
          resolve(response);
        },
      );
    });
  }
}
