import { registerAs } from '@nestjs/config';
import { version } from '../../package.json';

/**
 * Application configuration factory.
 * Registers the 'app' namespace configuration using NestJS ConfigModule.
 *
 * @returns Configuration object containing application settings
 * @property port - Server port number. Defaults to 3000 if PORT env var is not set
 * @property nodeEnv - Current environment (development, production, test). Defaults to 'development'
 * @property apiVersion - API version prefix for routes. Defaults to 'v1'
 * @property corsOrigin - Allowed CORS origin. Defaults to '*' (all origins)
 * @property appVersion - Application version from package.json
 */
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  appVersion: version,
}));
