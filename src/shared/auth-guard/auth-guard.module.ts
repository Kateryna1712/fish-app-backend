import { Module } from '@nestjs/common';
import { AuthGuardService } from './auth-guard.service';
import { JwtModule } from '@nestjs/jwt';
import { SubscriptionGuardService } from './subscription-guard.service';

@Module({
  imports: [JwtModule],
  providers: [AuthGuardService, SubscriptionGuardService],
  exports: [AuthGuardService, SubscriptionGuardService, JwtModule],
})
export class AuthGuardModule {}
