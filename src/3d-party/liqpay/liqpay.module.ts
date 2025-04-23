import { forwardRef, Module } from '@nestjs/common';
import { LiqpayService } from './liqpay.service';
import { LiqpayController } from './liqpay.controller';
import { ConfigModule } from '@nestjs/config';
import { Subscription } from '@/pricing-plans/entities/subscription.entity';
import { UserAuthCommonModule } from '@/UserAuthCommon/UserAuthCommonModule';
import { PlanModule } from '@/pricing-plans/plan.module';

@Module({
  imports: [
    ConfigModule,
    Subscription,
    forwardRef(() => UserAuthCommonModule),
    forwardRef(() => PlanModule),
  ],
  controllers: [LiqpayController],
  providers: [LiqpayService],
  exports: [LiqpayService],
})
export class LiqpayModule {}
