import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, lastValueFrom } from 'rxjs';
import { CacheInterceptor } from '@shared/cache';
import { INJECTION_TOKENS } from '@shared/constants';
import { CachePort } from '@shared/cache/domain/ports';
import { LoggerPort } from '@shared/logging/domain/ports';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '@shared/cache/infrastructure/decorators';

describe('CacheInterceptor', () => {
  let interceptor: CacheInterceptor;
  let reflector: Reflector;
  let mockCache: jest.Mocked<CachePort>;
  let mockLogger: jest.Mocked<LoggerPort>;

  const createMockExecutionContext = (): ExecutionContext => {
    return {
      getHandler: jest.fn().mockReturnValue(() => {}),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToHttp: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (returnValue: unknown): CallHandler => {
    return {
      handle: jest.fn().mockReturnValue(of(returnValue)),
    };
  };

  beforeEach(async () => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPattern: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
    };

    mockLogger = {
      setContext: jest.fn().mockReturnThis(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      http: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInterceptor,
        Reflector,
        {
          provide: INJECTION_TOKENS.CACHE,
          useValue: mockCache,
        },
        {
          provide: INJECTION_TOKENS.LOGGER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    interceptor = module.get<CacheInterceptor>(CacheInterceptor);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('intercept', () => {
    it('should skip caching when no cache key is set', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler({ data: 'test' });

      const result$ = await interceptor.intercept(context, handler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({ data: 'test' });
      expect(mockCache.get).not.toHaveBeenCalled();
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should return cached data on cache hit', async () => {
      const cachedData = [{ id: 1, name: 'User 1' }];
      jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
        if (key === CACHE_KEY_METADATA) return 'users:all';
        if (key === CACHE_TTL_METADATA) return 300;
        return undefined;
      });
      mockCache.get.mockResolvedValue(cachedData);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler([]);

      const result$ = await interceptor.intercept(context, handler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual(cachedData);
      expect(mockCache.get).toHaveBeenCalledWith('users:all');
      expect(handler.handle).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Cache HIT'),
      );
    });

    it('should fetch and cache data on cache miss', async () => {
      const freshData = [{ id: 1, name: 'User 1' }];
      jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
        if (key === CACHE_KEY_METADATA) return 'users:all';
        if (key === CACHE_TTL_METADATA) return 300;
        return undefined;
      });
      mockCache.get.mockResolvedValue(null);
      mockCache.set.mockResolvedValue(undefined);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler(freshData);

      const result$ = await interceptor.intercept(context, handler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual(freshData);
      expect(mockCache.get).toHaveBeenCalledWith('users:all');
      expect(mockCache.set).toHaveBeenCalledWith('users:all', freshData, 300);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Cache MISS'),
      );
    });

    it('should use correct TTL from metadata', async () => {
      const freshData = { data: 'test' };
      jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
        if (key === CACHE_KEY_METADATA) return 'test:key';
        if (key === CACHE_TTL_METADATA) return 600;
        return undefined;
      });
      mockCache.get.mockResolvedValue(null);
      mockCache.set.mockResolvedValue(undefined);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler(freshData);

      const result$ = await interceptor.intercept(context, handler);
      await lastValueFrom(result$);

      expect(mockCache.set).toHaveBeenCalledWith('test:key', freshData, 600);
    });

    it('should log cache check details', async () => {
      jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
        if (key === CACHE_KEY_METADATA) return 'users:all';
        if (key === CACHE_TTL_METADATA) return 300;
        return undefined;
      });
      mockCache.get.mockResolvedValue(null);
      mockCache.set.mockResolvedValue(undefined);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler([]);

      const result$ = await interceptor.intercept(context, handler);
      await lastValueFrom(result$);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Cache check for key: users:all'),
      );
    });

    it('should handle undefined cached data correctly', async () => {
      jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
        if (key === CACHE_KEY_METADATA) return 'test:key';
        if (key === CACHE_TTL_METADATA) return 300;
        return undefined;
      });
      mockCache.get.mockResolvedValue(undefined);
      mockCache.set.mockResolvedValue(undefined);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler({ data: 'fresh' });

      const result$ = await interceptor.intercept(context, handler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({ data: 'fresh' });
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should handle empty array as valid cached data', async () => {
      jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
        if (key === CACHE_KEY_METADATA) return 'users:all';
        if (key === CACHE_TTL_METADATA) return 300;
        return undefined;
      });
      mockCache.get.mockResolvedValue([]);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler([{ id: 1 }]);

      const result$ = await interceptor.intercept(context, handler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual([]);
      expect(handler.handle).not.toHaveBeenCalled();
    });
  });
});
