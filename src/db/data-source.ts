import 'reflect-metadata';
import { Invitation } from '@/invite-friend/entities/invite-friend.entity';
import { Place } from '@/place/entities/place.entity';
import { SubscriptionLiqpay } from '@/pricing-plans/entities/payment-liqpay.entity';
import { Plan } from '@/pricing-plans/entities/plan.entity';
import { Auth } from '@/UserAuthCommon/auth/entities/auth.entity';
import { Otp } from '@/UserAuthCommon/auth/entities/otp.entity';
import { OtpPassw } from '@/UserAuthCommon/auth/entities/otpPassw.entity';
import { DataSource } from 'typeorm';
import { User } from '@/UserAuthCommon/user/entities/user.entity';
import 'dotenv/config';
import { Subscription } from '@/pricing-plans/entities/subscription.entity';
import { Migration1744823175098 } from './migrations/1744823175098-migration';

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as never,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
  entities: [
    User,
    Auth,
    Subscription,
    SubscriptionLiqpay,
    Plan,
    Otp,
    OtpPassw,
    Invitation,
    Place,
  ],
  migrations: [Migration1744823175098],
  subscribers: [],
});
