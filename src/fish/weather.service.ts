import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { IDailyWeather } from './interfaces/interfaces';
import * as SunCalc from 'suncalc';
import {
  IForecastData,
  IForecastDataRes,
  IRegion2,
} from './interfaces/currentForecast.interfaces';
import {
  normalizePressure,
  normalizeWindSpeed,
  normalizeWindDirection,
  normalizeTemperature,
  normalizeMoonPhase,
  normalizeTimeOfDay,
} from './utils/weather.utils';
//  https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

@Injectable()
export class WeatherService {
  private openWeatherApiUrl: string;
  private openWeatherApiUrl2: string;
  private sunrisesunsetIoUrl: string;

  private openWeatherApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.openWeatherApiUrl = this.configService.get('OPEN_WEATHER_URL');
    this.sunrisesunsetIoUrl = this.configService.get('SUNRISE_SUNSET_URL');

    this.openWeatherApiKey = this.configService.get('OPEN_WEATHER_API_KEY');
  }

  async getSunData(lat: number, lon: number) {
    try {
      const params = {
        lat: lat,
        lng: lon,
      };
      console.log(
        '-=-=-=-=-=-this.sunrisesunsetIoUrlб params',
        this.sunrisesunsetIoUrl,
        params,
      );
      const response = await firstValueFrom(
        this.httpService.get(`${this.sunrisesunsetIoUrl}`, { params }),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch sun data: ${error.message}`);
    }
  }

  async getWeatherData(lat: number, lon: number): Promise<any> {
    const params = {
      lat: lat,
      lon: lon,
      exclude: 'minutely,alerts',
      appid: this.openWeatherApiKey,
      units: 'metric',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.openWeatherApiUrl}/onecall`, { params }),
      );
      const data = response.data;

      return data;
    } catch (error) {
      console.log('-=-=-=-=-=-=-=-=-=-eerrror', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  async getRegion(lat: number, lon: number) {
    const params = {
      lat,
      lon,
      appid: this.openWeatherApiKey,
    };
    const res = await firstValueFrom(
      this.httpService.get<IRegion2[]>(
        'http://api.openweathermap.org/geo/1.0/reverse',
        {
          params,
        },
      ),
    );

    return res.data[0];
  }

  async getCurrentWeatherData(
    lat: number,
    lon: number,
    lang?: string,
    date?: string,
  ): Promise<IForecastDataRes> {
    const params = {
      lat: lat,
      lon: lon,
      exclude: 'minutely,hourly,alerts',
      appid: this.openWeatherApiKey,
      units: 'metric',
      lang: lang,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get<IForecastData>(
          `${this.openWeatherApiUrl}/onecall`,
          { params },
        ),
      );
      const data = response.data;

      // Log the incoming date and data for debugging
      console.log('Incoming date:', date);
      console.log(
        'Current date:',
        new Date(Date.now()).toISOString().split('T')[0],
      );
      console.log(
        'Daily forecast dates:',
        data.daily.map(
          (item) => new Date(item.dt * 1000).toISOString().split('T')[0],
        ),
      );

      const foundDay = data.daily.find((item) => {
        const currentDate = new Date(item.dt * 1000)
          .toISOString()
          .split('T')[0];
        return currentDate === date;
      });

      // Log the found day for debugging
      console.log('Found day:', foundDay);

      const currentDate = new Date(Date.now()).toISOString().split('T')[0];
      const finalDate = currentDate === date ? data.current : foundDay;

      // Log the final date for debugging
      console.log('Final date:', finalDate);

      if (!finalDate) {
        throw new Error(`No weather data found for date: ${date}`);
      }

      const utcTimeSunrise = finalDate.sunrise;
      const utcTimeSunset = finalDate.sunset;
      const utcTime = finalDate.dt;

      if (!utcTimeSunrise || !utcTimeSunset || !utcTime) {
        throw new Error('Missing required time data from weather response');
      }

      data.current.sunriseTime = this.convertTime2(utcTimeSunrise);
      data.current.sunsetTime = this.convertTime2(utcTimeSunset);
      finalDate.dateTime = this.convertTime2(utcTime);

      const utcTimeMoonrise = data.daily[0].moonrise;
      const utcTimeMonnset = data.daily[0].moonset;
      const utcTimeDailyDate = data.daily[0].dt;

      if (!utcTimeMoonrise || !utcTimeMonnset || !utcTimeDailyDate) {
        throw new Error(
          'Missing required moon time data from weather response',
        );
      }

      data.daily[0].moonriseTime = this.convertTime2(utcTimeMoonrise);
      data.daily[0].moonsetTime = this.convertTime2(utcTimeMonnset);
      data.daily[0].dateTime = this.convertTime2(utcTimeDailyDate);

      return { ...data, current: data.current, daily: data.daily[0] };
    } catch (error) {
      console.error('Weather data fetch error:', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  async getHourlyWeatherData(lat: number, lon: number): Promise<any> {
    const params = {
      lat: lat,
      lon: lon,
      exclude: 'current,minutely,daily,alerts',
      appid: this.openWeatherApiKey,
      units: 'metric',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.openWeatherApiUrl}/onecall`, { params }),
      );
      const data = response.data;

      data.hourly.forEach((hourItem) => {
        const { time, date } = this.convertTime(
          hourItem.dt,
          data.timezone_offset,
        );
        hourItem.date = date;
        hourItem.time = time;
      });
      return data;
    } catch (error) {
      console.log('-=-=-=-=-=-=-=-=-=-eerrror', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  async getDailyWeatherData(
    lat: number,
    lon: number,
    date: string,
  ): Promise<IDailyWeather> {
    const params = {
      lat: lat,
      lon: lon,
      date,
      appid: this.openWeatherApiKey,
      units: 'metric',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.openWeatherApiUrl}/onecall/day_summary`, {
          params,
        }),
      );
      const data = response.data;
      return data;
    } catch (error) {
      console.log('-=-=-=-=-=-=-=-=-=-eerrror', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  private convertTime(utcTime: number, timezoneOffset: number) {
    // console.log('-=-=-=-==-in convert time', utcTime, timezoneOffset);
    const dateTime = new Date((utcTime + timezoneOffset) * 1000);
    const date = dateTime.toLocaleDateString('en-GB');
    const time = dateTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { date, time };
  }

  private convertTime2(utcTime: number) {
    // console.log('-=-=-=-==-in convert time', utcTime, timezoneOffset);
    const dateTime = new Date(utcTime * 1000);
    console.log('=-=-=-=-=-dateTime', dateTime);

    // const date = dateTime.toLocaleDateString('en-GB');
    // const time = dateTime.toLocaleTimeString('en-GB', {
    //   hour: '2-digit',
    //   minute: '2-digit',
    // });

    return dateTime;
  }

  async getNavigationalTwilight(lat: number, lon: number, date: Date) {
    const times = SunCalc.getTimes(new Date(date), lat, lon);

    return {
      nauticalDawn: times.nauticalDawn,
      nauticalDusk: times.nauticalDusk,
    };
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

      const totalProbability =
        pressureScore +
        windSpeedScore +
        windDirectionScore +
        temperatureScore +
        moonPhaseScore +
        timeOfDayScore;

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
}
