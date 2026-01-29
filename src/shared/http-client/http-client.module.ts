import { Module, Global } from '@nestjs/common';
import { AxiosHttpClientAdapter } from './infrastructure/adapters/axios-http-client.adapter';
import { INJECTION_TOKENS } from '../constants/injection-tokens';
import { LoggingModule } from '../logging/logging.module';

/**
 * Global module providing HTTP client functionality.
 * Exports the HttpClientPort for dependency injection across the application.
 * Includes retry logic, timeout handling, request ID propagation, and logging.
 */
@Global()
@Module({
  imports: [LoggingModule],
  providers: [
    {
      provide: INJECTION_TOKENS.HTTP_CLIENT,
      useClass: AxiosHttpClientAdapter,
    },
  ],
  exports: [INJECTION_TOKENS.HTTP_CLIENT],
})
export class HttpClientModule {}
