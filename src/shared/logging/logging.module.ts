import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared/constants';
import { HttpExceptionFilter } from '@shared/infrastructure/filters';
import { ResponseInterceptor } from '@shared/infrastructure/interceptors';
import { AsyncContextService } from './infrastructure/context';
import { WinstonLoggerAdapter } from './infrastructure/adapters';
import { RequestIdMiddleware } from './infrastructure/middleware';

@Global()
@Module({
  providers: [
    AsyncContextService,
    WinstonLoggerAdapter,
    {
      provide: INJECTION_TOKENS.LOGGER,
      useExisting: WinstonLoggerAdapter,
    },
    HttpExceptionFilter,
    ResponseInterceptor,
  ],
  exports: [
    INJECTION_TOKENS.LOGGER,
    AsyncContextService,
    WinstonLoggerAdapter,
    HttpExceptionFilter,
    ResponseInterceptor,
  ],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
