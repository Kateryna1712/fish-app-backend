export const CORS_HOSTS = {
  development: 'http://localhost:3000',
  staging: ['', ''],
  production: ['', '', ''],
};

const CLIENT_HOSTS = {
  development: 'http://localhost:3000',
  staging: '',
  production: '',
};

export const CLIENT_HOST = CLIENT_HOSTS[process.env.NODE_ENV];

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: true,
  maxAge: 1000 * 60 * 60 * 24,
};
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  maxAge: 1000 * 60 * 60 * 24,
  sameSite: true,
};
