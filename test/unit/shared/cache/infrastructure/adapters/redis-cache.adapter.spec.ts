import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisCacheAdapter } from '@shared/cache/infrastructure/adapters';
import { INJECTION_TOKENS } from '@shared/constants';
import { LoggerPort } from '@shared/logging/domain/ports';

const mockRedisInstance = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  exists: jest.fn(),
  ttl: jest.fn(),
  quit: jest.fn(),
  on: jest.fn(),
};

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockRedisInstance),
  };
});

describe('RedisCacheAdapter', () => {
  let adapter: RedisCacheAdapter;

  const mockLogger: LoggerPort = {
    setContext: jest.fn().mockReturnThis(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      const config: Record<string, unknown> = {
        'cache.url': undefined,
        'cache.host': 'localhost',
        'cache.port': 6379,
        'cache.password': undefined,
        'cache.keyPrefix': 'test:',
        'cache.defaultTtl': 3600,
      };
      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheAdapter,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: INJECTION_TOKENS.LOGGER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    adapter = module.get<RedisCacheAdapter>(RedisCacheAdapter);
    adapter.onModuleInit();
  });

  afterEach(async () => {
    if (adapter) {
      await adapter.onModuleDestroy();
    }
  });

  describe('get', () => {
    it('should return parsed data on cache hit', async () => {
      const testData = { id: 1, name: 'Test User' };
      mockRedisInstance.get.mockResolvedValue(JSON.stringify(testData));

      const result = await adapter.get<typeof testData>('user:1');

      expect(result).toEqual(testData);
      expect(mockRedisInstance.get).toHaveBeenCalledWith('user:1');
    });

    it('should return null on cache miss', async () => {
      mockRedisInstance.get.mockResolvedValue(null);

      const result = await adapter.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null and log error on Redis error', async () => {
      mockRedisInstance.get.mockRejectedValue(new Error('Connection refused'));

      const result = await adapter.get('user:1');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should set value with default TTL', async () => {
      mockRedisInstance.set.mockResolvedValue('OK');
      const testData = { id: 1, name: 'Test User' };

      await adapter.set('user:1', testData);

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'user:1',
        JSON.stringify(testData),
        'EX',
        3600,
      );
    });

    it('should set value with custom TTL', async () => {
      mockRedisInstance.set.mockResolvedValue('OK');
      const testData = { id: 1, name: 'Test User' };

      await adapter.set('user:1', testData, 300);

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'user:1',
        JSON.stringify(testData),
        'EX',
        300,
      );
    });

    it('should log error on Redis error', async () => {
      mockRedisInstance.set.mockRejectedValue(new Error('Connection refused'));

      await adapter.set('user:1', { id: 1 });

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      mockRedisInstance.del.mockResolvedValue(1);

      await adapter.delete('user:1');

      expect(mockRedisInstance.del).toHaveBeenCalledWith('user:1');
    });

    it('should log error on Redis error', async () => {
      mockRedisInstance.del.mockRejectedValue(new Error('Connection refused'));

      await adapter.delete('user:1');

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('deleteByPattern', () => {
    it('should delete keys matching pattern', async () => {
      mockRedisInstance.keys.mockResolvedValue(['test:user:1', 'test:user:2']);
      mockRedisInstance.del.mockResolvedValue(2);

      await adapter.deleteByPattern('user:*');

      expect(mockRedisInstance.keys).toHaveBeenCalledWith('test:user:*');
      expect(mockRedisInstance.del).toHaveBeenCalledWith('user:1', 'user:2');
    });

    it('should not call del if no keys match', async () => {
      mockRedisInstance.keys.mockResolvedValue([]);

      await adapter.deleteByPattern('nonexistent:*');

      expect(mockRedisInstance.keys).toHaveBeenCalled();
      expect(mockRedisInstance.del).not.toHaveBeenCalled();
    });

    it('should log error on Redis error', async () => {
      mockRedisInstance.keys.mockRejectedValue(new Error('Connection refused'));

      await adapter.deleteByPattern('user:*');

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true if key exists', async () => {
      mockRedisInstance.exists.mockResolvedValue(1);

      const result = await adapter.exists('user:1');

      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      mockRedisInstance.exists.mockResolvedValue(0);

      const result = await adapter.exists('nonexistent');

      expect(result).toBe(false);
    });

    it('should return false and log error on Redis error', async () => {
      mockRedisInstance.exists.mockRejectedValue(
        new Error('Connection refused'),
      );

      const result = await adapter.exists('user:1');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('ttl', () => {
    it('should return TTL for existing key', async () => {
      mockRedisInstance.ttl.mockResolvedValue(300);

      const result = await adapter.ttl('user:1');

      expect(result).toBe(300);
    });

    it('should return -2 for non-existing key', async () => {
      mockRedisInstance.ttl.mockResolvedValue(-2);

      const result = await adapter.ttl('nonexistent');

      expect(result).toBe(-2);
    });

    it('should return -1 and log error on Redis error', async () => {
      mockRedisInstance.ttl.mockRejectedValue(new Error('Connection refused'));

      const result = await adapter.ttl('user:1');

      expect(result).toBe(-1);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('lifecycle', () => {
    it('should log info on successful connection close', async () => {
      mockRedisInstance.quit.mockResolvedValue('OK');

      await adapter.onModuleDestroy();

      expect(mockRedisInstance.quit).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Redis connection closed gracefully',
      );
    });
  });
});
