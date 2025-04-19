import { Injectable } from '@nestjs/common';
import { IDailyWeather, IHourlyWeather } from './interfaces/interfaces';
import { IForecastDataRes } from './interfaces/currentForecast.interfaces';

@Injectable()
export class ForecastService {
  constructor() {}

  fishForecastCurr(data: IForecastDataRes): number {
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
      return phase === 1 || phase === 0 || phase === 0.5 ? 1 : 0.5;
    };

    const normalizeTimeOfDay = (
      time: Date,
      sunrise: Date,
      sunset: Date,
    ): number => {
      const hour = time.getHours();

      if (time >= sunrise && time <= sunset) {
        return (hour >= 6 && hour < 9) || (hour >= 17 && hour < 20) ? 1 : 0.5;
      } else {
        return 0.4; // Ніч
      }
    };

    const pressureScore =
      normalizePressure(data.current.pressure) * weights.pressure;
    const windSpeedScore =
      normalizeWindSpeed(data.current.wind_speed) * weights.windSpeed;
    const windDirectionScore =
      normalizeWindDirection(data.current.wind_deg) * weights.windDirection;
    const temperatureScore =
      normalizeTemperature(data.current.temp) * weights.temperature;

    ///moonoahse hardcoded
    const moonPhaseScore =
      normalizeMoonPhase(data.daily.moon_phase) * weights.moonPhase;

    const timeOfDayScore =
      normalizeTimeOfDay(
        data.current.dateTime,
        data.current.sunriseTime,
        data.current.sunriseTime,
      ) * weights.timeOfDay;

    const totalProbability =
      pressureScore +
      windSpeedScore +
      windDirectionScore +
      temperatureScore +
      moonPhaseScore +
      timeOfDayScore;

    return Math.round(totalProbability * 100);
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
