import { registerAs } from '@nestjs/config';

/**
 * JWT configuration factory.
 * Registers the 'jwt' namespace configuration using NestJS ConfigModule.
 *
 * @returns Configuration object containing JWT authentication settings
 * @property accessSecret - Secret key for signing access tokens. Defaults to 'access-secret-key'
 * @property refreshSecret - Secret key for signing refresh tokens. Defaults to 'refresh-secret-key'
 * @property accessExpiresIn - Access token expiration time. Defaults to '15m' (15 minutes)
 * @property refreshExpiresIn - Refresh token expiration time. Defaults to '7d' (7 days)
 */
export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
