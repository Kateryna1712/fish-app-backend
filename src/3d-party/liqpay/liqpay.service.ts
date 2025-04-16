import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PayLiqpayDto } from './dto/pay-liqpay.dto';
import { ConfigService } from '@nestjs/config';

import * as crypto from 'crypto';

@Injectable()
export class LiqpayService {
  private readonly logger = new Logger(LiqpayService.name);
  private liqpayPublicKey: string;
  private liqpayPrivateKey: string;

  constructor(private configService: ConfigService) {
    this.liqpayPublicKey = this.configService.get('LIQPAY_PUBLIC');
    this.liqpayPrivateKey = this.configService.get('LIQPAY_PRIVATE');

    this.logger.log('LiqpayService initialized ');
  }
  async paySubscr(paySubscrDto: PayLiqpayDto) {
    const data = {
      public_key: this.liqpayPublicKey,
      version: '3',
      action: 'pay',
      amount: paySubscrDto.amount,
      currency: 'UAH',
      description: 'Підписка на сервіс',
      order_id: paySubscrDto.planId,
      server_url: `${this.configService.get('DOMAIN')}/liqpay/callback`,
      result_url: 'yourapp://payment-success',
      subscribe: '1', // save card
      subscribe_date_start: '2025-03-25 17:01:22',
      subscribe_periodicity: 'month',
      sandbox: '1', // 1 for test, 0 for prod
      info: 'bebraemail',
    };
    console.log('-=-=-=-=-=-data', data);

    const dataStr = Buffer.from(JSON.stringify(data)).toString('base64');
    console.log('-=-=-=-=-=-dataStr', dataStr);
    const signature = this.getSignature(dataStr);

    return {
      data: dataStr,
      signature,
      pay_url: `https://www.liqpay.ua/api/3/checkout?data=${dataStr}&signature=${signature}`,
    };
  }

  async callback(body: { data: string; signature: string }) {
    console.log('-=-=-=-=-=-callbackLiqpayDto', body);

    const { data, signature } = body;

    const calculatedSignature = this.getSignature(data);

    if (calculatedSignature !== signature) {
      throw new UnauthorizedException('Invalid signature');
    }

    const decodedData = JSON.parse(
      Buffer.from(data, 'base64').toString('utf-8'),
    );
    console.log('✅ decoded LiqPay data:', decodedData);

    return { status: 'ok' };
  }

  private getSignature(data: string): string {
    return crypto
      .createHash('sha1')
      .update(this.liqpayPrivateKey + data + this.liqpayPrivateKey)
      .digest('base64');
  }
}
