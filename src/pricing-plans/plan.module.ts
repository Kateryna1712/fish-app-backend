import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { AuthGuardModule } from 'src/shared/auth-guard/auth-guard.module';
import { SubscriptionLiqpay } from './entities/payment-liqpay.entity';
import { LiqpayModule } from 'src/3d-party/liqpay/liqpay.module';
import { SubscriptionLiqpayService } from './subscription-liqpay.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionLiqpay, Plan]),
    AuthGuardModule,
    LiqpayModule,
  ],
  controllers: [PlanController, SubscriptionController],
  providers: [PlanService, SubscriptionService, SubscriptionLiqpayService],
  exports: [PlanService, SubscriptionService],
})
export class PlanModule {}
