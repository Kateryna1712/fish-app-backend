import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';
import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import { Auth } from 'src/UserAuthCommon/auth/entities/auth.entity';
import { Subscription } from 'src/pricing-plans/entities/subscription.entity';
import { Plan } from 'src/pricing-plans/entities/plan.entity';
import { Otp } from 'src/UserAuthCommon/auth/entities/otp.entity';
import { OtpPassw } from 'src/UserAuthCommon/auth/entities/otpPassw.entity';
import { Invitation } from 'src/invite-friend/entities/invite-friend.entity';
import { Place } from 'src/place/entities/place.entity';
import { SubscriptionLiqpay } from 'src/pricing-plans/entities/payment-liqpay.entity';
import { Migration1744823175098 } from './migrations/1744823175098-migration';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      inject: [],
      useFactory: async () => {
        try {
          const dataSource = new DataSource({
            type: process.env.DB_TYPE as never,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
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
          });
          await dataSource.initialize();
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class MyTypeOrmModule {}
