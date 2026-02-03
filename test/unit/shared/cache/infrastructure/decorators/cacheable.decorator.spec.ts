import { Reflector } from '@nestjs/core';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
  Cacheable,
} from '@shared/cache';

describe('Cacheable Decorator', () => {
  let reflector: Reflector;

  class TestClass {
    @Cacheable({ key: 'test:key', ttl: 600 })
    methodWithTtl(): string {
      return 'test';
    }

    @Cacheable({ key: 'test:default' })
    methodWithDefaultTtl(): string {
      return 'test';
    }
  }

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('metadata', () => {
    it('should set cache key metadata', () => {
      const metadata = reflector.get<string>(
        CACHE_KEY_METADATA,
        TestClass.prototype.methodWithTtl,
      );
      expect(metadata).toBe('test:key');
    });

    it('should set custom TTL metadata', () => {
      const metadata = reflector.get<number>(
        CACHE_TTL_METADATA,
        TestClass.prototype.methodWithTtl,
      );
      expect(metadata).toBe(600);
    });

    it('should set default TTL of 300 when not provided', () => {
      const metadata = reflector.get<number>(
        CACHE_TTL_METADATA,
        TestClass.prototype.methodWithDefaultTtl,
      );
      expect(metadata).toBe(300);
    });

    it('should set cache key for method with default TTL', () => {
      const metadata = reflector.get<string>(
        CACHE_KEY_METADATA,
        TestClass.prototype.methodWithDefaultTtl,
      );
      expect(metadata).toBe('test:default');
    });
  });

  describe('method execution', () => {
    it('should not modify the original method behavior', () => {
      const instance = new TestClass();
      expect(instance.methodWithTtl()).toBe('test');
      expect(instance.methodWithDefaultTtl()).toBe('test');
    });
  });
});
