import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared/constants';
import { CachePort } from '@shared/cache/domain/ports';
import { LoggerPort } from '@shared/logging/domain/ports';

@Injectable()
export class StrapiWebhookService {
  private readonly logger: LoggerPort;

  constructor(
    @Inject(INJECTION_TOKENS.CACHE)
    private readonly cache: CachePort,
    @Inject(INJECTION_TOKENS.LOGGER)
    logger: LoggerPort,
  ) {
    this.logger = logger.setContext(StrapiWebhookService.name);
  }

  async invalidateCache(): Promise<{
    message: string;
    timestamp: string;
  }> {
    this.logger.info('Cache invalidation requested via webhook');

    await this.cache.deleteByPattern('strapi:*');

    const timestamp = new Date().toISOString();
    await this.cache.set('strapi:cache', timestamp, 2592000);

    this.logger.info('Cache invalidation completed for pattern strapi:*');

    return {
      message: 'Cache invalidated successfully',
      timestamp,
    };
  }

  async getCacheTimestamp(): Promise<{ timestamp: string | null }> {
    const timestamp = await this.cache.get<string>('strapi:cache');
    return { timestamp };
  }
}
