import { Controller, Get, Query } from '@nestjs/common';
import { GoogleApiService } from './google-api.service';
import { GeocodingDto } from './dto/geocoding.dto';

@Controller('google-api')
export class GoogleApiController {
  constructor(private readonly googleServiceService: GoogleApiService) {}

  @Get('region')
  async getLocationRegion(@Query() geocodingDto: GeocodingDto) {
    return this.googleServiceService.getLocationRegion(geocodingDto);
  }
}
