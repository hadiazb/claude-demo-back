import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { INJECTION_TOKENS } from '@shared/constants';
import { RedisCacheAdapter } from './infrastructure/adapters';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisCacheAdapter,
    {
      provide: INJECTION_TOKENS.CACHE,
      useExisting: RedisCacheAdapter,
    },
  ],
  exports: [INJECTION_TOKENS.CACHE, RedisCacheAdapter],
})
export class CacheModule {}
