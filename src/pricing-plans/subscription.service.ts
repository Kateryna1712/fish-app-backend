import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscr.dto';
import { PaymentIntentDto } from 'src/3d-party/stripe/dto/payment-intent.dto';
import { Plan } from './entities/plan.entity';
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
  }
}
