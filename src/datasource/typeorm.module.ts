import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';
import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import { Auth } from 'src/UserAuthCommon/auth/entities/auth.entity';
import path from 'path';
import { Subscription } from 'src/pricing-plans/entities/subscription.entity';
import { Plan } from 'src/pricing-plans/entities/plan.entity';
import { Otp } from 'src/UserAuthCommon/auth/entities/otp.entity';
import { OtpPassw } from 'src/UserAuthCommon/auth/entities/otpPassw.entity';
import { Invitation } from 'src/invite-friend/entities/invite-friend.entity';
import { Place } from 'src/place/entities/place.entity';
import { SubscriptionLiqpay } from 'src/pricing-plans/entities/payment-liqpay.entity';

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
            type: 'postgres',
            url: process.env.DB_URL,
            synchronize: true,
            // logging: true,
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
