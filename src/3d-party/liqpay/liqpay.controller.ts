import { Controller, Post, Body } from '@nestjs/common';
import { LiqpayService } from './liqpay.service';
import { PayLiqpayDto } from './dto/pay-liqpay.dto';

@Controller('liqpay')
export class LiqpayController {
  constructor(private readonly liqpayService: LiqpayService) {}

  @Post()
  paySubscr(@Body() paysubscrDto: PayLiqpayDto) {
    return this.liqpayService.paySubscr(paysubscrDto);
  }

  @Post('callback')
  callback(@Body() body: { data: string; signature: string }) {
    return this.liqpayService.callback(body);
  }
}
