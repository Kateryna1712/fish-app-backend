import { registerAs } from '@nestjs/config';
// import { AppConfig, DatabaseConfig } from '../config.interface';

export enum ConfigKey {
  App = 'APP',
  Db = 'DB',
}

export enum Environment {
  Local = 'local',
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Testing = 'testing',
}

const APPConfig = registerAs(
  ConfigKey.App, () => ({
    env:
      Environment[process.env.NODE_ENV as keyof typeof Environment] ||
      'development',
    port: Number(process.env.APP_PORT),
    appName: process.env.APP_NAME,
  }),
);

const DBConfig = registerAs(
  ConfigKey.Db, () => ({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
  }),
);

export const configurations = [APPConfig, DBConfig];