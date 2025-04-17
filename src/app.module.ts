import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MyTypeOrmModule } from './db/typeorm.module';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './UserAuthCommon/auth/google/google.strategy';
import { FishModule } from './fish/fish.module';
import { GoogleApiModule } from './google-api/google-api.module';
import { UserAuthCommonModule } from './UserAuthCommon/UserAuthCommonModule';
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
    InviteFriendModule,
    PlaceModule,
    LiqpayModule,
  ],
  providers: [GoogleStrategy],
})
export class AppModule {}
