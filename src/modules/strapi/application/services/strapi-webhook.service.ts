import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared/constants';
import { CachePort } from '@shared/cache/domain/ports';
import { LoggerPort } from '@shared/logging/domain/ports';
import { StrapiWebhookPayloadDto } from '@strapi/application/dto';

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

  async invalidateCache(payload: StrapiWebhookPayloadDto): Promise<{
    message: string;
    timestamp: string;
    event: string;
    model: string;
  }> {
    this.logger.info('Cache invalidation requested', undefined, {
      event: payload.event,
      model: payload.model,
    });

    await this.cache.deleteByPattern('strapi:*');

    const timestamp = new Date().toISOString();
    await this.cache.set('strapi:cache', timestamp, 2592000);

    this.logger.info('Cache invalidation completed for pattern strapi:*');

    return {
      message: 'Cache invalidated successfully',
      timestamp,
      event: payload.event,
      model: payload.model,
    };
  }

  async getCacheTimestamp(): Promise<{ timestamp: string | null }> {
    const timestamp = await this.cache.get<string>('strapi:cache');
    return { timestamp };
  }
}
