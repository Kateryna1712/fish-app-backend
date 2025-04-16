import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import { AuthGuardModule } from 'src/shared/auth-guard/auth-guard.module';
import { PlanModule } from 'src/pricing-plans/plan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, User]),
    AuthGuardModule,
    PlanModule,
  ],
  controllers: [PlaceController],
  providers: [PlaceService],
})
export class PlaceModule {}
