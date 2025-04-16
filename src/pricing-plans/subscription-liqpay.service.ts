import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { PlanService } from './plan.service';
import { SubscriptionLiqpay } from './entities/payment-liqpay.entity';
import { LiqpayService } from 'src/3d-party/liqpay/liqpay.service';

@Injectable()
export class SubscriptionLiqpayService {
  private readonly logger = new Logger(SubscriptionLiqpayService.name);
  constructor(
    @InjectRepository(SubscriptionLiqpay)
    private subscriptionRepository: Repository<SubscriptionLiqpay>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    private planService: PlanService,

    private liqpayService: LiqpayService,
  ) {}

  // async paySubscription(userId: string, payLiqpayDto: PayLiqpayDto) {
  //   let subscription = await this.subscriptionRepository.findOne({
  //     where: { user: { id: userId } },
  //     relations: ['user'],
  //   });
  //   console.log('=-=-=-=-=-=subscription', subscription);

  //   const plan = await this.planRepository.findOne({
  //     where: { id: payLiqpayDto.planId },
  //   });

  //   if (!subscription) {
  //     subscription = await this.subscriptionRepository.save({
  //       stripeCustomerId: '0',
  //       stripeSubscriptionId: '0',
  //       status: 'pending',
  //       type: plan.name,
  //       user: { id: userId },
  //       plan: { id: paymentIntentDto.planId },
  //     });
  //   }

  //   if (plan.name === 'free') {
  //     await this.subscriptionRepository.update(
  //       { id: subscription.id },
  //       {
  //         stripeCustomerId: '0',
  //         stripeSubscriptionId: '0',
  //         status: 'active',
  //         type: plan.name,
  //         user: { id: userId },
  //         plan: { id: paymentIntentDto.planId },
  //         currentPeriodStart: new Date(),
  //         currentPeriodEnd: new Date(
  //           new Date().setMonth(new Date().getMonth() + 1),
  //         ),
  //       },
  //     );
  //     return;
  //   }

  //   let stripeCustomer = await this.stripeService.getCustomerOne(
  //     subscription.user.email,
  //   );
  //   console.log('-=-=-=--=stripeCustomer', stripeCustomer);
  //   if (!stripeCustomer) {
  //     stripeCustomer = await this.stripeService.createCustomerRecord({
  //       email: subscription.user.email,
  //       name: subscription.user.name,
  //     });
  //   }

  //   const payIntent = await this.stripeService.paymentIntent(
  //     userId,
  //     subscription.user.email,
  //     paymentIntentDto.amount,
  //     paymentIntentDto.currency,
  //     stripeCustomer.id,
  //     paymentIntentDto.gateway,
  //   );
  //   console.log('-=-=-=--=payIntent', payIntent);

  //   await this.subscriptionRepository.update(
  //     {
  //       id: subscription.id,
  //     },
  //     {
  //       stripeCustomerId: stripeCustomer.id,
  //       plan: { id: paymentIntentDto.planId },
  //       status: 'pending',
  //       type: plan.name,
  //     },
  //   );

  //   return payIntent;
  // }

  // async create(createSubscrDto: CreateSubscriptionDto) {
  //   console.log(
  //     '=-=-=-=-=-=createSubscrDto  in create subscr',
  //     createSubscrDto,
  //   );
  //   const subscr = await this.subscriptionRepository.save(createSubscrDto);
  //   console.log('-==-=-=-=-created subscr', subscr);
  //   return subscr;
  // }

  // findOneById(id: string) {
  //   return this.subscriptionRepository.findOne({ where: { id } });
  // }

  // async getSubscription(userId: string) {
  //   const subscription = await this.subscriptionRepository.findOne({
  //     where: { user: { id: userId } },
  //     relations: ['plan'],
  //   });
  //   console.log('-=-=-=-=-=-subcription', subscription);
  //   return subscription;
  // }
}
