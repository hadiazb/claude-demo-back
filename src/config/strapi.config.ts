import { registerAs } from '@nestjs/config';

export default registerAs('strapi', () => ({
  apiUrl: process.env.STRAPI_MODULE_REPOSITORY || 'http://localhost:1337',
  apiToken: process.env.STRAPI_API_TOKEN || '',
  webhookSecret: process.env.STRAPI_WEBHOOK_SECRET || '',
}));
