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
      console.log('-=-=-=-=-=-getSunData', error);
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

      // console.log('-=-=-=-=-=-=-=-=-weathre reeeessssponse', response);

      // console.log('-=-=-=-=-=-=-=-=-weathre data', data);

      // const today = data.daily[0];
      // const weatherDetails = {
      //   temperature: data.temp.day,
      //   windSpeed: data.wind_speed,
      //   windDirection: data.wind_deg,
      //   moonPhase: data.moon_phase,
      //   sunrise: data.sunrise,
      //   sunset: today.sunset,
      // };
      // console.log('-=-=-=-=-=-weatherDetails', weatherDetails);

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

      const utcTimeSunrise = data.current.sunrise;
      const utcTimeSunset = data.current.sunset;

      const utcTime = data.current.dt;

      const timezoneOffset = data.timezone_offset;

      // const sunrise = new Date((utcTimeSunrise + timezoneOffset) * 1000);
      // const sunset = new Date((utcTimeSunset + timezoneOffset) * 1000);

      // const time = new Date((utcTime + timezoneOffset) * 1000);

      data.current.sunriseTime = this.convertTime2(
        utcTimeSunrise,
        timezoneOffset,
      );
      data.current.sunsetTime = this.convertTime2(
        utcTimeSunset,
        timezoneOffset,
      );
      data.current.dateTime = this.convertTime2(utcTime, timezoneOffset);
      console.log('-=-=-=-=-=-=-=-date current', data.current.dateTime);

      const utcTimeMoonrise = data.daily[0].moonrise;
      const utcTimeMonnset = data.daily[0].moonset;
      const utcTimeDailyDate = data.daily[0].dt;

      data.daily[0].moonriseTime = this.convertTime2(
        utcTimeMoonrise,
        timezoneOffset,
      );

      data.daily[0].moonsetTime = this.convertTime2(
        utcTimeMonnset,
        timezoneOffset,
      );
      data.daily[0].dateTime = this.convertTime2(
        utcTimeDailyDate,
        timezoneOffset,
      );

      return { ...data, current: data.current, daily: data.daily[0] };
    } catch (error) {
      console.log('-=-=-=-=-=-=-=-=-=-eerrror', error);
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

      // console.log('-=-=-=-=-=-=-=dayli data', data);

      return data;
    } catch (error) {
      console.log('-=-=-=-=-=-=-=-=-=-eerrror', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  private convertTime(utcTime: number, timezoneOffset: number) {
    // console.log('-=-=-=-==-in convert time', utcTime, timezoneOffset);
    const dateTime = new Date((utcTime + timezoneOffset) * 1000);
    console.log('=-=-=-=-=-dateTime', dateTime);
    const date = dateTime.toLocaleDateString('en-GB');
    const time = dateTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { date, time };
  }

  private convertTime2(utcTime: number, timezoneOffset: number) {
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
}
