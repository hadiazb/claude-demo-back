import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CachePort } from '../../domain/ports';
import { LoggerPort } from '@shared/logging/domain/ports';
import { INJECTION_TOKENS } from '@shared/constants';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '../decorators/cacheable.decorator';

/**
 * Interceptor that handles caching for methods decorated with @Cacheable.
 * Automatically caches responses and returns cached data when available.
 *
 * @example
 * ```typescript
 * // In your module
 * providers: [
 *   {
 *     provide: APP_INTERCEPTOR,
 *     useClass: CacheInterceptor,
 *   },
 * ]
 *
 * // In your controller
 * @Get()
 * @Cacheable({ key: 'users:all', ttl: 300 })
 * async findAll() { ... }
 * ```
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private logger: LoggerPort;

  constructor(
    private readonly reflector: Reflector,
    @Inject(INJECTION_TOKENS.CACHE)
    private readonly cache: CachePort,
    @Inject(INJECTION_TOKENS.LOGGER)
    logger: LoggerPort,
  ) {
    this.logger = logger.setContext(CacheInterceptor.name);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    // If no cache key is set, skip caching
    if (!cacheKey) {
      return next.handle();
    }

    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    // Try to get from cache
    const cachedData = await this.cache.get(cacheKey);

    // Debug: log what we got from cache
    this.logger.debug(
      `Cache check for key: ${cacheKey}, found: ${cachedData !== null}, type: ${typeof cachedData}, isArray: ${Array.isArray(cachedData)}`,
    );

    if (cachedData !== null && cachedData !== undefined) {
      this.logger.debug(`Cache HIT for key: ${cacheKey}`);
      return of(cachedData);
    }

    this.logger.debug(`Cache MISS for key: ${cacheKey}`);

    // Execute the handler and cache the result
    return next.handle().pipe(
      switchMap((data) =>
        from(this.cache.set(cacheKey, data, ttl)).pipe(
          tap(() => {
            this.logger.debug(
              `Cached data for key: ${cacheKey} (TTL: ${ttl}s)`,
            );
          }),
          switchMap(() => of(data)),
        ),
      ),
    );
  }
}
