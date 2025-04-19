import { Injectable } from '@nestjs/common';
import { GeocodingDto } from './dto/geocoding.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleApiService {
  private googleUrl: string;
  private googleAPIKey: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.googleUrl = this.configService.get('GOOGLE_API_URL');
    this.googleAPIKey = this.configService.get('GOOGLE_API_KEY');
  }
  async getLocationRegion(geocodingDto: GeocodingDto) {
    const lat = geocodingDto.lat.toFixed(2);
    const lon = geocodingDto.lon.toFixed(2);
    const params = {
      latlng: `${lat},${lon}`,
      location_type: 'ROOFTOP',
      //   result_type: 'street_address',
      key: this.googleAPIKey,
    };

    const response = await firstValueFrom(
      this.httpService.get(`${this.googleUrl}/json`, { params }),
    );
    const resData = this.extractLocationDetails(response.data);
    return resData;
  }

  private extractLocationDetails(data) {
    const result = data.results[0];
    let city = '';
    let state = '';
    let country = '';

    result.address_components.forEach((component) => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.long_name;
      }
    });

    return { city, state, country };
  }
}
