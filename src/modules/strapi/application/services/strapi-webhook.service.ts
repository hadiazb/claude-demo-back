import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared/constants';
import { CachePort } from '@shared/cache/domain/ports';
import { LoggerPort } from '@shared/logging/domain/ports';

/**
 * Application service for handling Strapi webhook operations.
 * Manages cache invalidation triggered by Strapi content changes
 * and provides cache timestamp tracking for frontend synchronization.
 */
@Injectable()
export class StrapiWebhookService {
  /** Logger instance scoped to the StrapiWebhookService context */
  private readonly logger: LoggerPort;

  /**
   * Creates a new StrapiWebhookService instance.
   * @param cache - The cache port for Redis operations
   * @param logger - The logger port for recording webhook events
   */
  constructor(
    @Inject(INJECTION_TOKENS.CACHE)
    private readonly cache: CachePort,
    @Inject(INJECTION_TOKENS.LOGGER)
    logger: LoggerPort,
  ) {
    this.logger = logger.setContext(StrapiWebhookService.name);
  }

  /**
   * Invalidates all Strapi-related cache entries and records the invalidation timestamp.
   * Deletes all keys matching the pattern 'strapi:*' and stores a new timestamp
   * in 'strapi:cache' with a 30-day TTL for frontend cache synchronization.
   * @returns Promise resolving to a success message and ISO timestamp
   */
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

  /**
   * Retrieves the timestamp of the last cache invalidation.
   * Used by the frontend to determine if its local cache is stale.
   * @returns Promise resolving to an object containing the timestamp or null
   */
  async getCacheTimestamp(): Promise<{ timestamp: string | null }> {
    const timestamp = await this.cache.get<string>('strapi:cache');
    return { timestamp };
  }
}
