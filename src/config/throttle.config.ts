import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  default: {
    ttl: parseInt(process.env.THROTTLE_DEFAULT_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_DEFAULT_LIMIT || '200', 10),
  },
  login: {
    ttl: parseInt(process.env.THROTTLE_LOGIN_TTL || '300000', 10),
    limit: parseInt(process.env.THROTTLE_LOGIN_LIMIT || '10', 10),
  },
  register: {
    ttl: parseInt(process.env.THROTTLE_REGISTER_TTL || '600000', 10),
    limit: parseInt(process.env.THROTTLE_REGISTER_LIMIT || '10', 10),
  },
  refresh: {
    ttl: parseInt(process.env.THROTTLE_REFRESH_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_REFRESH_LIMIT || '30', 10),
  },
  strapi: {
    ttl: parseInt(process.env.THROTTLE_STRAPI_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_STRAPI_LIMIT || '500', 10),
  },
}));
