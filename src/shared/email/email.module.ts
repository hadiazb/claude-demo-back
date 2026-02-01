import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResendEmailAdapter } from './infrastructure/adapters/resend-email.adapter';
import { INJECTION_TOKENS } from '@shared/constants';

/**
 * Email module providing email sending capabilities.
 * Uses Resend as the email provider.
 *
 * @Global - Makes the module available throughout the application
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: INJECTION_TOKENS.EMAIL,
      useClass: ResendEmailAdapter,
    },
  ],
  exports: [INJECTION_TOKENS.EMAIL],
})
export class EmailModule {}
