export interface IForecastData {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: ICurrentWeather;
  daily: IDailyWeather[];
  region: IRegion2;
  forecast: number;
}

export interface IForecastDataRes {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: ICurrentWeather;
  daily: IDailyWeather;
  region: IRegion2;
  forecast: number;
}

export interface IRegion {
  city: string;
  state: string;
  country: string;
}

export interface IRegion2 {
  name: string;
  local_names: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface ICurrentWeather {
  dt: number;
  dateTime: Date;
  sunriseTime: Date;
  sunsetTime: Date;
  sunrise: number;
  sunset: number;
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
  weather: IWeather[];
}

export interface IDailyWeather {
  dt: number;
  dateTime: Date;
  sunrise: number;
  sunset: number;
  moonriseTime: Date;
  moonsetTime: Date;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary: string;
  temp: ITemperature;
  feels_like: IFeelsLike;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: IWeather[];
  clouds: number;
  pop: number;
  uvi: number;
}

export interface ITemperature {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface IFeelsLike {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export interface IWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}
