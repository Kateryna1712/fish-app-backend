import { Request } from 'express';

export interface RequestWithUserSubscr extends Request {
  subscrType: string;
}

export interface IWeatherDataHourly {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  hourly: IHourlyWeather[];
}

export interface IWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface IHourlyWeather {
  dt: number;
  date: string;
  time: string;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: IWeatherCondition[];
  pop: number;
  forecast: number;
}

export interface IDailyWeather {
  forecast: number;
  lat: number;
  lon: number;
  tz: string;
  date: string;
  units: 'metric' | 'imperial';
  cloud_cover: {
    afternoon: number;
  };
  humidity: {
    afternoon: number;
  };
  precipitation: {
    total: number;
  };
  temperature: {
    min: number;
    max: number;
    afternoon: number;
    night: number;
    evening: number;
    morning: number;
  };
  pressure: {
    afternoon: number;
  };
  wind: {
    max: {
      speed: number;
      direction: number;
    };
  };
}
