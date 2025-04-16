import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscr.dto';
import { PaymentIntentDto } from 'src/3d-party/stripe/dto/payment-intent.dto';
import { StripeService } from 'src/3d-party/stripe/stripe.service';
import { Plan } from './entities/plan.entity';
import Stripe from 'stripe';
import { PlanService } from './plan.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    private planService: PlanService,

    private stripeService: StripeService,
  ) {}
  async create(createSubscrDto: CreateSubscriptionDto) {
    console.log(
      '=-=-=-=-=-=createSubscrDto  in create subscr',
      createSubscrDto,
    );
    const subscr = await this.subscriptionRepository.save(createSubscrDto);
    console.log('-==-=-=-=-created subscr', subscr);
    return subscr;
  }

  async findAll() {
    return this.subscriptionRepository.find();
  }

  findOneById(id: string) {
    return this.subscriptionRepository.findOne({ where: { id } });
  }

  update(id: number, updatePlanDto: UpdatePlanDto) {
    return `This action updates a #${id} Plan`;
  }

  remove(id: number) {
    return `This action removes a #${id} Plan`;
  }

  async getSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
      relations: ['plan'],
    });
    console.log('-=-=-=-=-=-subcription', subscription);
    return subscription;
  }

  async paySubscription(userId: string, paymentIntentDto: PaymentIntentDto) {
    let subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    console.log('=-=-=-=-=-=subscription', subscription);

    const plan = await this.planRepository.findOne({
      where: { id: paymentIntentDto.planId },
    });

    if (!subscription) {
      subscription = await this.subscriptionRepository.save({
        stripeCustomerId: '0',
        stripeSubscriptionId: '0',
        status: 'pending',
        type: plan.name,
        user: { id: userId },
        plan: { id: paymentIntentDto.planId },
      });
    }

    if (plan.name === 'free') {
      await this.subscriptionRepository.update(
        { id: subscription.id },
        {
          stripeCustomerId: '0',
          stripeSubscriptionId: '0',
          status: 'active',
          type: plan.name,
          user: { id: userId },
          plan: { id: paymentIntentDto.planId },
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            new Date().setMonth(new Date().getMonth() + 1),
          ),
        },
      );
      return;
    }

    let stripeCustomer = await this.stripeService.getCustomerOne(
      subscription.user.email,
    );
    console.log('-=-=-=--=stripeCustomer', stripeCustomer);
    if (!stripeCustomer) {
      stripeCustomer = await this.stripeService.createCustomerRecord({
        email: subscription.user.email,
        name: subscription.user.name,
      });
    }

    const payIntent = await this.stripeService.paymentIntent(
      userId,
      subscription.user.email,
      paymentIntentDto.amount,
      paymentIntentDto.currency,
      stripeCustomer.id,
      paymentIntentDto.gateway,
    );
    console.log('-=-=-=--=payIntent', payIntent);

    await this.subscriptionRepository.update(
      {
        id: subscription.id,
      },
      {
        stripeCustomerId: stripeCustomer.id,
        plan: { id: paymentIntentDto.planId },
        status: 'pending',
        type: plan.name,
      },
    );

    return payIntent;
  }

  async webhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.canceled':
        const paymentIntentCanceled = event.data.object;
        console.log('-=-=-=-=-payment_intent.canceled', paymentIntentCanceled);
        // Then define and call a function to handle the event payment_intent.canceled

        await this.subscriptionRepository.update(
          { user: { id: paymentIntentCanceled.metadata.userId } },
          { status: 'canceled' },
        );
        break;
      case 'payment_intent.created':
        const paymentIntentCreated = event.data.object;
        console.log('-=-=-=-=-paymentIntentCreated', paymentIntentCreated);

        // Then define and call a function to handle the event payment_intent.created
        break;
      case 'payment_intent.payment_failed':
        const paymentIntentPaymentFailed = event.data.object;
        console.log(
          '-=-=-=-=-paymentIntentPaymentFailed',
          paymentIntentPaymentFailed,
        );
        await this.subscriptionRepository.update(
          { user: { id: paymentIntentPaymentFailed.metadata.userId } },
          { status: 'failed' },
        );

        // Then define and call a function to handle the event payment_intent.payment_failed
        break;
      case 'payment_intent.processing':
        const paymentIntentProcessing = event.data.object;
        console.log(
          '-=-=-=-=-paymentIntentProcessing',
          paymentIntentProcessing,
        );

        // Then define and call a function to handle the event payment_intent.processing
        break;
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
        console.log(
          '-=-=-=-=-paymentIntentSucceeded metadata',
          paymentIntentSucceeded.metadata,
        );
        await this.subscriptionRepository.update(
          { user: { id: paymentIntentSucceeded.metadata.userId } },
          {
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
              new Date().setMonth(new Date().getMonth() + 1),
            ),
          },
        );
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        this.logger.log(`Unhandled event type ${event?.type}`);
    }
  }
}
