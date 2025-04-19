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
}
