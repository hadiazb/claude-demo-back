import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { INJECTION_TOKENS } from '@shared/constants';
import { RedisCacheAdapter } from './infrastructure/adapters';
import { CacheInterceptor } from './infrastructure/interceptors';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisCacheAdapter,
    {
      provide: INJECTION_TOKENS.CACHE,
      useExisting: RedisCacheAdapter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [INJECTION_TOKENS.CACHE, RedisCacheAdapter],
})
export class CacheModule {}
