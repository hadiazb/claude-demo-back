import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CachePort } from '../../domain/ports';
import { LoggerPort } from '@shared/logging/domain/ports';
import { INJECTION_TOKENS } from '@shared/constants';

@Injectable()
export class RedisCacheAdapter
  implements CachePort, OnModuleInit, OnModuleDestroy
{
  private client: Redis;
  private readonly keyPrefix: string;
  private readonly defaultTtl: number;
  private logger: LoggerPort;

  constructor(
    private readonly configService: ConfigService,
    @Inject(INJECTION_TOKENS.LOGGER)
    logger: LoggerPort,
  ) {
    this.logger = logger.setContext(RedisCacheAdapter.name);
    this.keyPrefix = this.configService.get<string>('cache.keyPrefix', 'app:');
    this.defaultTtl = this.configService.get<number>('cache.defaultTtl', 3600);
  }

  onModuleInit(): void {
    const redisUrl = this.configService.get<string>('cache.url');

    const retryStrategy = (times: number): number | null => {
      if (times > 3) {
        this.logger.error('Redis connection failed after 3 retries');
        return null;
      }
      return Math.min(times * 200, 2000);
    };

    if (redisUrl) {
      const usesTls = redisUrl.startsWith('rediss://');
      this.logger.info(`Connecting to Redis${usesTls ? ' with TLS' : ''}...`);

      this.client = new Redis(redisUrl, {
        keyPrefix: this.keyPrefix,
        retryStrategy,
        tls: usesTls ? { rejectUnauthorized: false } : undefined,
        maxRetriesPerRequest: 3,
      });
    } else {
      this.client = new Redis({
        host: this.configService.get<string>('cache.host', 'localhost'),
        port: this.configService.get<number>('cache.port', 6379),
        password: this.configService.get<string>('cache.password'),
        keyPrefix: this.keyPrefix,
        retryStrategy,
        maxRetriesPerRequest: 3,
      });
    }

    this.client.on('connect', () => {
      this.logger.info('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error(
        'Redis connection error',
        error instanceof Error ? error.stack : String(error),
      );
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.info('Redis connection closed gracefully');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(
        `Error getting cache key: ${key}`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds ?? this.defaultTtl;
      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized, 'EX', ttl);
    } catch (error) {
      this.logger.error(
        `Error setting cache key: ${key}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(
        `Error deleting cache key: ${key}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const fullPattern = `${this.keyPrefix}${pattern}`;
      const keys = await this.client.keys(fullPattern);

      if (keys.length > 0) {
        const keysWithoutPrefix = keys.map((key) =>
          key.replace(this.keyPrefix, ''),
        );
        await this.client.del(...keysWithoutPrefix);
      }
    } catch (error) {
      this.logger.error(
        `Error deleting cache keys by pattern: ${pattern}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Error checking cache key existence: ${key}`,
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(
        `Error getting TTL for cache key: ${key}`,
        error instanceof Error ? error.message : String(error),
      );
      return -1;
    }
  }
}
