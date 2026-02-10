import { StrapiWebhookService } from '@strapi/application/services';
import { CachePort } from '@shared/cache/domain/ports';
import { LoggerPort } from '@shared/logging/domain/ports';

describe('StrapiWebhookService', () => {
  let service: StrapiWebhookService;
  let mockCache: jest.Mocked<CachePort>;
  let mockLogger: jest.Mocked<LoggerPort>;

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPattern: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
    } as jest.Mocked<CachePort>;

    mockLogger = {
      setContext: jest.fn().mockReturnThis(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      http: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as jest.Mocked<LoggerPort>;

    service = new StrapiWebhookService(mockCache, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set logger context', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith(
        'StrapiWebhookService',
      );
    });
  });

  describe('invalidateCache', () => {
    it('should call deleteByPattern with strapi:* pattern', async () => {
      mockCache.deleteByPattern.mockResolvedValue(undefined);
      mockCache.set.mockResolvedValue(undefined);

      await service.invalidateCache();

      expect(mockCache.deleteByPattern).toHaveBeenCalledWith('strapi:*');
    });

    it('should set strapi:cache key with timestamp after invalidation', async () => {
      mockCache.deleteByPattern.mockResolvedValue(undefined);
      mockCache.set.mockResolvedValue(undefined);

      await service.invalidateCache();

      expect(mockCache.set).toHaveBeenCalledWith(
        'strapi:cache',
        expect.any(String),
        2592000,
      );
    });

    it('should set strapi:cache after deleteByPattern', async () => {
      const callOrder: string[] = [];
      mockCache.deleteByPattern.mockImplementation(() => {
        callOrder.push('deleteByPattern');
        return Promise.resolve();
      });
      mockCache.set.mockImplementation(() => {
        callOrder.push('set');
        return Promise.resolve();
      });

      await service.invalidateCache();

      expect(callOrder).toEqual(['deleteByPattern', 'set']);
    });

    it('should return success response with message and timestamp', async () => {
      mockCache.deleteByPattern.mockResolvedValue(undefined);
      mockCache.set.mockResolvedValue(undefined);

      const result = await service.invalidateCache();

      expect(result.message).toBe('Cache invalidated successfully');
      expect(result.timestamp).toBeDefined();
    });

    it('should return valid ISO timestamp', async () => {
      mockCache.deleteByPattern.mockResolvedValue(undefined);
      mockCache.set.mockResolvedValue(undefined);

      const result = await service.invalidateCache();

      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should log cache invalidation request', async () => {
      mockCache.deleteByPattern.mockResolvedValue(undefined);
      mockCache.set.mockResolvedValue(undefined);

      await service.invalidateCache();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cache invalidation requested via webhook',
      );
    });

    it('should log completion message', async () => {
      mockCache.deleteByPattern.mockResolvedValue(undefined);
      mockCache.set.mockResolvedValue(undefined);

      await service.invalidateCache();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cache invalidation completed for pattern strapi:*',
      );
    });

    it('should propagate cache errors', async () => {
      mockCache.deleteByPattern.mockRejectedValue(
        new Error('Redis connection error'),
      );

      await expect(service.invalidateCache()).rejects.toThrow(
        'Redis connection error',
      );
    });
  });

  describe('getCacheTimestamp', () => {
    it('should return timestamp when key exists', async () => {
      mockCache.get.mockResolvedValue('2024-01-01T00:00:00.000Z');

      const result = await service.getCacheTimestamp();

      expect(result).toEqual({ timestamp: '2024-01-01T00:00:00.000Z' });
    });

    it('should call cache.get with strapi:cache key', async () => {
      mockCache.get.mockResolvedValue(null);

      await service.getCacheTimestamp();

      expect(mockCache.get).toHaveBeenCalledWith('strapi:cache');
    });

    it('should return null timestamp when key does not exist', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await service.getCacheTimestamp();

      expect(result).toEqual({ timestamp: null });
    });

    it('should propagate cache errors', async () => {
      mockCache.get.mockRejectedValue(new Error('Redis connection error'));

      await expect(service.getCacheTimestamp()).rejects.toThrow(
        'Redis connection error',
      );
    });
  });
});
