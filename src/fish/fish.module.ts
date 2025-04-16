import { Module } from '@nestjs/common';
import { FishController } from './fish.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ForecastService } from './forecast.service';
import { WeatherService } from './weather.service';
import { GoogleApiService } from 'src/google-api/google-api.service';
import { AuthGuardModule } from 'src/shared/auth-guard/auth-guard.module';

@Module({
  imports: [HttpModule, ConfigModule, AuthGuardModule],
  controllers: [FishController],
  providers: [WeatherService, ForecastService, GoogleApiService],
})
export class FishModule {}
