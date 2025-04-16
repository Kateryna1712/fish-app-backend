import { Module } from '@nestjs/common';
import { GoogleApiService } from './google-api.service';
import { GoogleApiController } from './google-api.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [GoogleApiController],
  providers: [GoogleApiService],
  exports: [GoogleApiService],
})
export class GoogleApiModule {}
