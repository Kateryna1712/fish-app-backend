import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './user/entities/user.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserRepository } from './user/repository/user.repository';
import { Auth } from './auth/entities/auth.entity';
import { MyTypeOrmModule } from 'src/datasource/typeorm.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthRepository } from './auth/repositories/auth.repository';
import { PlanModule } from 'src/pricing-plans/plan.module';
import { AuthGuardModule } from 'src/shared/auth-guard/auth-guard.module';
import { EmailModule } from 'src/3d-party/email/email.module';
import { Otp } from './auth/entities/otp.entity';
import { OtpPassw } from './auth/entities/otpPassw.entity';
import { Place } from 'src/place/entities/place.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Auth, Otp, OtpPassw, Place]),
    JwtModule,
    MyTypeOrmModule,
    AuthGuardModule,
    PlanModule,
    EmailModule,
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, AuthRepository, UserService, UserRepository],
  exports: [UserService],
})
export class UserAuthCommonModule {}
