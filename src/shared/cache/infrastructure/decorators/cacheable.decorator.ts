import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

export interface CacheableOptions {
  key: string;
  ttl?: number; // seconds, default 300 (5 min)
}

/**
 * Decorator to cache the result of a method.
 * Use with CacheInterceptor to enable caching.
 *
 * @example
 * ```typescript
 * @Get()
 * @Cacheable({ key: 'users:all', ttl: 300 })
 * async findAll(): Promise<User[]> {
 *   return this.userService.findAll();
 * }
 * ```
 *
 * @param options - Cache key and optional TTL in seconds
 */
export const Cacheable = (options: CacheableOptions): MethodDecorator => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(CACHE_KEY_METADATA, options.key)(
      target,
      propertyKey,
      descriptor,
    );
    SetMetadata(CACHE_TTL_METADATA, options.ttl ?? 300)(
      target,
      propertyKey,
      descriptor,
    );
    return descriptor;
  };
};
