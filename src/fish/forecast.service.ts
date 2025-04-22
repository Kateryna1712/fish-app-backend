import { Injectable } from '@nestjs/common';
import { IDailyWeather, IHourlyWeather } from './interfaces/interfaces';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  normalizePressure,
  normalizeWindSpeed,
  normalizeWindDirection,
  normalizeTemperature,
  normalizeMoonPhase,
  normalizeTimeOfDay,
} from './utils/weather.utils';

@Injectable()
export class ForecastService {
  private openWeatherApiUrl: string;
  private openWeatherApiUrl2: string;
  private sunrisesunsetIoUrl: string;

  private openWeatherApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.openWeatherApiUrl = this.configService.get('OPEN_WEATHER_URL');
    this.openWeatherApiKey = this.configService.get('OPEN_WEATHER_API_KEY');
  }

  async fishForecastCurr(
    lat: number,
    lon: number,
    lang?: string,
    date?: string,
  ): Promise<number> {
    try {
      const params = {
        lat: lat,
        lon: lon,
        exclude: 'minutely,hourly,alerts',
        appid: this.openWeatherApiKey,
        units: 'metric',
        lang: lang,
      };
      const res = await firstValueFrom(
        this.httpService.get(`${this.openWeatherApiUrl}/onecall`, {
          params,
        }),
      );

      const data = res.data;

      const foundValue = data.daily.find((item) => {
        return new Date(item.dt * 1000).toISOString().split('T')[0] === date;
      });

      const finalValue = !foundValue ? data.current : foundValue;

      console.log('finalValue=--=-==-', finalValue);

      const weights = {
        pressure: 0.3,
        windSpeed: 0.15,
        windDirection: 0.1,
        temperature: 0.2,
        moonPhase: 0.15,
        timeOfDay: 0.1,
      };

      const pressureScore =
        normalizePressure(finalValue.pressure) * weights.pressure;
      const windSpeedScore =
        normalizeWindSpeed(finalValue.wind_speed) * weights.windSpeed;
      const windDirectionScore =
        normalizeWindDirection(finalValue.wind_deg) * weights.windDirection;
      const temperatureScore =
        normalizeTemperature(finalValue.temp) * weights.temperature;
      const moonPhaseScore =
        normalizeMoonPhase(finalValue.moon_phase) * weights.moonPhase;

      // Calculate time of day score
      const currentTime = new Date();
      const sunriseTime = new Date(finalValue.sunrise * 1000);
      const sunsetTime = new Date(finalValue.sunset * 1000);

      const timeOfDayScore =
        normalizeTimeOfDay(currentTime, sunriseTime, sunsetTime) *
        weights.timeOfDay;

      const randomValue = (Math.floor(Math.random() * 6) + 1) / 100;

      const totalProbability =
        pressureScore +
        windSpeedScore +
        windDirectionScore +
        temperatureScore +
        moonPhaseScore +
        timeOfDayScore +
        randomValue;

      // Log individual scores for debugging
      console.log('Scores:', {
        pressureScore,
        windSpeedScore,
        windDirectionScore,
        temperatureScore,
        moonPhaseScore,
        timeOfDayScore,
        totalProbability,
      });

      return Math.round(totalProbability * 100);
    } catch (e) {
      console.error('Error in fishForecastCurr:', e);
      throw e;
    }
  }

  fishForecastHourly(data: IHourlyWeather): number {
    const weights = {
      pressure: 0.3,
      windSpeed: 0.15,
      windDirection: 0.1,
      temperature: 0.2,
      moonPhase: 0.15,
      timeOfDay: 0.1,
    };

    const normalizePressure = (pressure: number): number => {
      if (Math.abs(pressure - 1013) <= 2) return 1;
      if (Math.abs(pressure - 1013) <= 5) return 0.7;
      return 0;
    };

    const normalizeWindSpeed = (speed: number): number => {
      return speed >= 3 && speed <= 5 ? 1 : 0.5;
    };
    const normalizeWindDirection = (windDeg: number): number => {
      if (windDeg >= 225 && windDeg < 315) return 1.0; // Південно-західний
      if (windDeg >= 270 && windDeg < 360) return 0.8; // Західний
      if (windDeg >= 135 && windDeg < 225) return 0.6; // Південний
      if (windDeg >= 45 && windDeg < 135) return 0.4; // Східний
      return 0; // Північний та інші
    };

    const normalizeTemperature = (temp: number): number => {
      return temp >= 12 && temp <= 18 ? 1 : 0.5;
    };

    const normalizeMoonPhase = (phase: number): number => {
      return phase === 1 || phase === 0 ? 1 : 0.8;
    };

    const normalizeTimeOfDay = (time: Date): number => {
      const hour = time.getHours();

      return (hour >= 6 && hour < 9) || (hour >= 17 && hour < 20) ? 1 : 0.7;
    };

    const pressureScore = normalizePressure(data.pressure) * weights.pressure;
    const windSpeedScore =
      normalizeWindSpeed(data.wind_speed) * weights.windSpeed;
    const windDirectionScore =
      normalizeWindDirection(data.wind_deg) * weights.windDirection;
    const temperatureScore =
      normalizeTemperature(data.temp) * weights.temperature;

    ///moonoahse hardcoded
    const moonPhaseScore = normalizeMoonPhase(1) * weights.moonPhase;

    const timeOfDayScore =
      normalizeTimeOfDay(new Date(data.time)) * weights.timeOfDay;

    const totalProbability =
      pressureScore +
      windSpeedScore +
      windDirectionScore +
      temperatureScore +
      moonPhaseScore +
      timeOfDayScore;
    return Math.round(totalProbability * 100);
  }

  fishForecastDaily(data: IDailyWeather): number {
    const weights = {
      pressure: 0.3,
      windSpeed: 0.15,
      windDirection: 0.1,
      temperature: 0.2,
      moonPhase: 0.15,
      timeOfDay: 0.1,
    };

    const normalizePressure = (pressure: number): number => {
      if (Math.abs(pressure - 1013) <= 2) return 1;
      if (Math.abs(pressure - 1013) <= 5) return 0.7;
      return 0;
    };

    const normalizeWindSpeed = (speed: number): number => {
      return speed >= 3 && speed <= 5 ? 1 : 0.5;
    };
    const normalizeWindDirection = (windDeg: number): number => {
      if (windDeg >= 225 && windDeg < 315) return 1.0; // Південно-західний
      if (windDeg >= 270 && windDeg < 360) return 0.8; // Західний
      if (windDeg >= 135 && windDeg < 225) return 0.6; // Південний
      if (windDeg >= 45 && windDeg < 135) return 0.4; // Східний
      return 0; // Північний та інші
    };

    const normalizeTemperature = (temp: number): number => {
      return temp >= 12 && temp <= 18 ? 1 : 0.5;
    };

    const normalizeMoonPhase = (phase: number): number => {
      return phase === 1 || phase === 0 ? 1 : 0.8;
    };

    const pressureScore =
      normalizePressure(data.pressure.afternoon) * weights.pressure;
    const windSpeedScore =
      normalizeWindSpeed(data.wind.max.speed) * weights.windSpeed;
    const windDirectionScore =
      normalizeWindDirection(data.wind.max.direction) * weights.windDirection;
    const temperatureScore =
      normalizeTemperature(data.temperature.morning) * weights.temperature;

    ///moonpahse hardcoded
    const moonPhaseScore = normalizeMoonPhase(1) * weights.moonPhase;

    const timeOfDayScore = 0.7 * weights.timeOfDay;

    const totalProbability =
      pressureScore +
      windSpeedScore +
      windDirectionScore +
      temperatureScore +
      moonPhaseScore +
      timeOfDayScore;
    return Math.round(totalProbability * 100);
  }

  generateDateArray(startDate: string, daysCount: number) {
    const dates = [];
    const start = new Date(startDate);

    // Validate the date
    if (isNaN(start.getTime())) {
      throw new Error('Invalid date format');
    }

    for (let i = 0; i < daysCount; i++) {
      const newDate = new Date(start);
      newDate.setDate(start.getDate() + i);
      dates.push(newDate.toISOString().split('T')[0]);
    }

    return dates;
  }

  swapDateElements = (dateString: string) => {
    const parts = dateString.split('-');
    [parts[1], parts[2]] = [parts[2], parts[1]];
    return parts.join('-');
  };
}
