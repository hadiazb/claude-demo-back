import { registerAs } from '@nestjs/config';

/**
 * Email configuration factory.
 * Registers the 'email' namespace configuration using NestJS ConfigModule.
 */
export default registerAs('email', () => ({
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  loginUrl: process.env.APP_LOGIN_URL || 'http://localhost:3000/login',
}));
