import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MyTypeOrmModule } from './datasource/typeorm.module';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './UserAuthCommon/auth/google/google.strategy';
import { FishModule } from './fish/fish.module';
import { GoogleApiModule } from './google-api/google-api.module';
import { UserAuthCommonModule } from './UserAuthCommon/UserAuthCommonModule';
import { StripeModule } from './3d-party/stripe/stripe.module';
import { PlanModule } from './pricing-plans/plan.module';
import { InviteFriendModule } from './invite-friend/invite-friend.module';
import { PlaceModule } from './place/place.module';
import { LiqpayModule } from './3d-party/liqpay/liqpay.module';

@Module({
  imports: [
    MyTypeOrmModule,
    ConfigModule.forRoot({
      envFilePath: '.env.dev',
      isGlobal: true,
    }),

    JwtModule.register({}),
    UserAuthCommonModule,
    FishModule,
    GoogleApiModule,
    PlanModule,
    StripeModule.forRootAsync(),
    InviteFriendModule,
    PlaceModule,
    LiqpayModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy],
})
export class AppModule {}
