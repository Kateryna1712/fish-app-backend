import { Module } from '@nestjs/common';
import { LiqpayService } from './liqpay.service';
import { LiqpayController } from './liqpay.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [LiqpayController],
  providers: [LiqpayService],
  exports: [LiqpayService],
})
export class LiqpayModule {}
