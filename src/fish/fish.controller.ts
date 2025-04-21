import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ForecastService } from './forecast.service';
import { GetCurWeatherDto } from './dto/getCurWeather.dto';
import { DailyForecastDto } from './dto/dailyForecast.dto';
import { GoogleApiService } from 'src/google-api/google-api.service';
import { RequestWithUserSubscr } from './interfaces/interfaces';
import { SubscriptionGuard } from 'src/shared/auth-guard/required.subscription.guard';
import { RequiredSubscriptionType } from 'src/shared/auth-guard/decorators/subscription.decorator';
import { AuthGuard } from 'src/shared/auth-guard/auth.guard';
import { GeocodingDto } from 'src/google-api/dto/geocoding.dto';
import { AstroTimesDto } from './dto/astroTimes.dto';

@Controller('fish')
export class FishController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly forecastService: ForecastService,
    private readonly googleApiService: GoogleApiService,
  ) {}

  @Get('weather')
  async getWeather() {
    return this.weatherService.getWeatherData(0, 0);
  }

  // @Get('weather2')
  // async getWeather2() {
  //   return this.weatherService.getWeather2(49.832603, 24.027996);
  // }

  @Get('region')
  async getLocationRegion(@Query() geocodingDto: GeocodingDto) {
    return this.weatherService.getRegion(geocodingDto.lat, geocodingDto.lon);

    //mock region
    // return mockRegionData;
  }

  @Get('sun')
  async getSunData(@Query() geocodingDto: GeocodingDto) {
    return this.weatherService.getSunData(geocodingDto.lat, geocodingDto.lon);
  }

  @UseGuards(AuthGuard)
  @Get('navigational-twilight')
  async getNavigationalTwilight(@Query() astroTimesDto: AstroTimesDto) {
    return this.weatherService.getNavigationalTwilight(
      astroTimesDto.lat,
      astroTimesDto.lon,
      astroTimesDto.date,
    );
  }

  @Get('forecast-current')
  async getCurrForecast(@Query() getCurWeatherDto: GetCurWeatherDto) {
    const data = await this.weatherService.getCurrentWeatherData(
      getCurWeatherDto.lat,
      getCurWeatherDto.lon,
      getCurWeatherDto.lang,
      getCurWeatherDto.date,
    );

    data.forecast = await this.forecastService.fishForecastCurr(
      getCurWeatherDto.lat,
      getCurWeatherDto.lon,
      getCurWeatherDto.lang,
      getCurWeatherDto.date,
    );

    data.region = await this.weatherService.getRegion(
      getCurWeatherDto.lat,
      getCurWeatherDto.lon,
    );

    return data;
  }

  @UseGuards(AuthGuard, SubscriptionGuard)
  @RequiredSubscriptionType(['free', 'pro'])
  @Get('forecast-hourly')
  async getHourlyForecast(
    @Req() req: RequestWithUserSubscr,
    @Query() getCurWeatherDto: GetCurWeatherDto,
  ) {
    const data = await this.weatherService.getHourlyWeatherData(
      getCurWeatherDto.lat,
      getCurWeatherDto.lon,
    );

    if (req.subscrType === 'free') {
      data.hourly = data.hourly.slice(0, 24);
    }
    data.hourly.forEach((element) => {
      const forecast = this.forecastService.fishForecastHourly(element);
      element.forecast = forecast;
    });
    return data;

    // return mockForecast;
  }

  @UseGuards(AuthGuard, SubscriptionGuard)
  @RequiredSubscriptionType(['free', 'pro'])
  @Get('forecast-daily')
  async getDailyForecast(
    @Req() req: RequestWithUserSubscr,
    @Query() dailyForecastDto: DailyForecastDto,
  ) {
    let datesArr: string[];
    if (req.subscrType === 'pro') {
      datesArr = this.forecastService.generateDateArray(
        dailyForecastDto.date,
        15,
      );
    } else if (req.subscrType === 'free') {
      datesArr = this.forecastService.generateDateArray(
        dailyForecastDto.date,
        3,
      );
    }
    const weatherArrPromises = datesArr.map((date) => {
      return this.weatherService.getDailyWeatherData(
        dailyForecastDto.lat,
        dailyForecastDto.lon,
        date,
      );
    });

    const data = await Promise.all(weatherArrPromises);

    if (req.subscrType === 'pro') {
      data.forEach((element) => {
        const forecast = this.forecastService.fishForecastDaily(element);
        element.date = this.forecastService.swapDateElements(element.date);
        element.forecast = forecast;
      });
    }
    return data;
    // return mockForecastDaily;
  }

  @UseGuards(AuthGuard, SubscriptionGuard)
  @RequiredSubscriptionType(['free', 'pro'])
  @Get('main-weather')
  async getWeatherForTenDays(
    @Req() req: RequestWithUserSubscr,
    @Query() dailyForecastDto: DailyForecastDto,
  ) {
    let datesArr: string[];

    datesArr = this.forecastService.generateDateArray(
      dailyForecastDto.date,
      10,
    );

    const data = await this.weatherService.getDailyWeatherData(
      dailyForecastDto.lat,
      dailyForecastDto.lon,
      dailyForecastDto.date,
    );
    return [{ ...data }];
  }

  @UseGuards(AuthGuard, SubscriptionGuard)
  @RequiredSubscriptionType(['free', 'pro'])
  @Get('main-activity')
  async getFishActivity(
    @Req() req: RequestWithUserSubscr,
    @Query() dailyForecastDto: DailyForecastDto,
  ) {
    const subscription = req.subscrType;

    if (subscription === 'free') {
      const weatherData = await this.weatherService.getHourlyWeatherData(
        dailyForecastDto.lat,
        dailyForecastDto.lon,
      );

      weatherData.hourly.forEach((element) => {
        const forecast = this.forecastService.fishForecastHourly(element);
        element.forecast = forecast;
      });

      const highestForecast = Math.max(
        ...weatherData.hourly.map((e) => e.forecast),
      );
      const threshold = highestForecast * 0.7;

      const bestTimes = weatherData.hourly
        .filter((element) => element.forecast >= threshold)
        .map((element) => ({
          date: new Date(element.dt * 1000).toISOString().split('T')[0],
          time: new Date(element.dt * 1000)
            .toISOString()
            .split('T')[1]
            .split('.')[0],
          forecast: element.forecast,
        }));

      const groupedBestTimes = [];
      let currentPeriod = null;

      bestTimes.forEach((time, index) => {
        if (!currentPeriod) {
          currentPeriod = {
            date: time.date,
            start: time.time,
            end: time.time,
            highestForecast: time.forecast,
            lowestForecast: time.forecast,
          };
        } else {
          const prevTime: any = new Date(
            `1970-01-01T${bestTimes[index - 1].time}Z`,
          );
          const currTime: any = new Date(`1970-01-01T${time.time}Z`);
          const diff = (currTime - prevTime) / (1000 * 60 * 60);

          if (diff <= 3 && time.date === currentPeriod.date) {
            currentPeriod.end = time.time;
            currentPeriod.highestForecast = Math.max(
              currentPeriod.highestForecast,
              time.forecast,
            );
            currentPeriod.lowestForecast = Math.min(
              currentPeriod.lowestForecast,
              time.forecast,
            );
          } else {
            groupedBestTimes.push(currentPeriod);
            currentPeriod = {
              date: time.date,
              start: time.time,
              end: time.time,
              highestForecast: time.forecast,
              lowestForecast: time.forecast,
            };
          }
        }
      });

      if (currentPeriod) {
        groupedBestTimes.push(currentPeriod);
      }

      const filteredWeatherData = weatherData.hourly.filter((hourData) => {
        const date = new Date(hourData.dt * 1000);
        const hours = date.getUTCHours();
        return hours % 3 === 0;
      });

      const count = filteredWeatherData.length;

      return { groupedBestTimes, count, filteredWeatherData };
    } else if (subscription === 'pro') {
      const datesArr = this.forecastService.generateDateArray(
        dailyForecastDto.date,
        10,
      );

      const weatherArrPromises = datesArr.map((date) => {
        return this.weatherService.getDailyWeatherData(
          dailyForecastDto.lat,
          dailyForecastDto.lon,
          date,
        );
      });

      const data = await Promise.all(weatherArrPromises);

      data.forEach((element) => {
        const forecast = this.forecastService.fishForecastDaily(element);
        element.date = this.forecastService.swapDateElements(element.date);
        element.forecast = forecast;
      });

      const highestForecast = Math.max(...data.map((e) => e.forecast));
      const threshold = highestForecast * 0.7;

      const bestDays = data
        .filter((element) => element.forecast >= threshold)
        .map((element) => ({
          date: element.date,
          forecast: element.forecast,
        }));

      const groupedBestDays = [];
      let currentPeriod = null;

      bestDays.forEach((day) => {
        if (!currentPeriod) {
          currentPeriod = {
            date: day.date,
            highestForecast: day.forecast,
            lowestForecast: day.forecast,
          };
        } else {
          currentPeriod.highestForecast = Math.max(
            currentPeriod.highestForecast,
            day.forecast,
          );
          currentPeriod.lowestForecast = Math.min(
            currentPeriod.lowestForecast,
            day.forecast,
          );
          groupedBestDays.push(currentPeriod);
          currentPeriod = {
            date: day.date,
            highestForecast: day.forecast,
            lowestForecast: day.forecast,
          };
        }
      });

      if (currentPeriod) {
        groupedBestDays.push(currentPeriod);
      }
      data.forEach((element) => {
        const date = element.date;
        const forecast = element.forecast;
        const bar = '█'.repeat(Math.round(forecast / 2)); // Scale the forecast value for the bar length
      });

      return { groupedBestDays, data };
    }

    // return mainFishMock;
  }
}
