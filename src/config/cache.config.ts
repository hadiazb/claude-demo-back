import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  url: process.env.REDIS_URL || undefined,
  defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),
  keyPrefix: process.env.CACHE_KEY_PREFIX || 'app:',
}));
