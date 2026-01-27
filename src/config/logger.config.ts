import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
  level: process.env.LOG_LEVEL || 'debug',
  format: process.env.LOG_FORMAT || 'pretty',
  toFile: process.env.LOG_TO_FILE === 'true',
  directory: process.env.LOG_DIRECTORY || 'logs',
  logRequestBody: process.env.LOG_REQUEST_BODY !== 'false',
  appName: process.env.APP_NAME || 'claude-demo',
}));
