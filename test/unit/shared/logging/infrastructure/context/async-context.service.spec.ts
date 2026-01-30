/**
 * ============================================================================
 * UNIT TESTS: AsyncContextService
 * ============================================================================
 *
 * This file contains unit tests for the AsyncContextService.
 *
 * WHAT IS AsyncContextService?
 * A service that provides async context storage using Node.js AsyncLocalStorage.
 * It stores request-specific context (request ID, start time) that can be
 * accessed anywhere within the same async execution context.
 *
 * TESTING APPROACH:
 * Test the AsyncLocalStorage wrapper methods directly.
 */

import {
  AsyncContextService,
  RequestContext,
} from '@shared/logging/infrastructure/context/async-context.service';

describe('AsyncContextService', () => {
  let service: AsyncContextService;

  beforeEach(() => {
    service = new AsyncContextService();
  });

  /**
   * =========================================================================
   * SECTION 1: RUN METHOD TESTS
   * =========================================================================
   */
  describe('run', () => {
    it('should execute callback within context', () => {
      const context: RequestContext = {
        requestId: 'test-request-id',
        startTime: Date.now(),
      };
      const callback = jest.fn().mockReturnValue('result');

      const result = service.run(context, callback);

      expect(callback).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should make context available inside callback', () => {
      const context: RequestContext = {
        requestId: 'test-123',
        startTime: 1234567890,
      };

      let capturedRequestId: string | undefined;
      let capturedStartTime: number | undefined;

      service.run(context, () => {
        capturedRequestId = service.getRequestId();
        capturedStartTime = service.getStartTime();
      });

      expect(capturedRequestId).toBe('test-123');
      expect(capturedStartTime).toBe(1234567890);
    });

    it('should isolate contexts between runs', () => {
      const context1: RequestContext = {
        requestId: 'request-1',
        startTime: 1000,
      };
      const context2: RequestContext = {
        requestId: 'request-2',
        startTime: 2000,
      };

      const results: string[] = [];

      service.run(context1, () => {
        results.push(service.getRequestId() || 'undefined');
      });

      service.run(context2, () => {
        results.push(service.getRequestId() || 'undefined');
      });

      expect(results).toEqual(['request-1', 'request-2']);
    });

    it('should return callback result', () => {
      const context: RequestContext = {
        requestId: 'test',
        startTime: Date.now(),
      };

      const result = service.run(context, () => {
        return { data: 'test-data' };
      });

      expect(result).toEqual({ data: 'test-data' });
    });

    it('should handle async callbacks', async () => {
      const context: RequestContext = {
        requestId: 'async-test',
        startTime: Date.now(),
      };

      const result = await service.run(context, async () => {
        await Promise.resolve();
        return service.getRequestId();
      });

      expect(result).toBe('async-test');
    });
  });

  /**
   * =========================================================================
   * SECTION 2: GET CONTEXT TESTS
   * =========================================================================
   */
  describe('getContext', () => {
    it('should return undefined when called outside of run', () => {
      const result = service.getContext();

      expect(result).toBeUndefined();
    });

    it('should return full context when called inside run', () => {
      const context: RequestContext = {
        requestId: 'full-context-test',
        startTime: 9876543210,
      };

      let capturedContext: RequestContext | undefined;

      service.run(context, () => {
        capturedContext = service.getContext();
      });

      expect(capturedContext).toEqual(context);
    });

    it('should return the same context object', () => {
      const context: RequestContext = {
        requestId: 'same-object-test',
        startTime: Date.now(),
      };

      let capturedContext: RequestContext | undefined;

      service.run(context, () => {
        capturedContext = service.getContext();
      });

      expect(capturedContext).toBe(context);
    });
  });

  /**
   * =========================================================================
   * SECTION 3: GET REQUEST ID TESTS
   * =========================================================================
   */
  describe('getRequestId', () => {
    it('should return undefined when called outside of run', () => {
      const result = service.getRequestId();

      expect(result).toBeUndefined();
    });

    it('should return request ID when called inside run', () => {
      const context: RequestContext = {
        requestId: 'my-request-id',
        startTime: Date.now(),
      };

      let capturedRequestId: string | undefined;

      service.run(context, () => {
        capturedRequestId = service.getRequestId();
      });

      expect(capturedRequestId).toBe('my-request-id');
    });

    it('should return correct ID for nested async operations', async () => {
      const context: RequestContext = {
        requestId: 'nested-async-id',
        startTime: Date.now(),
      };

      const result = await service.run(context, async () => {
        await Promise.resolve();
        const innerResult = await Promise.resolve(service.getRequestId());
        return innerResult;
      });

      expect(result).toBe('nested-async-id');
    });
  });

  /**
   * =========================================================================
   * SECTION 4: GET START TIME TESTS
   * =========================================================================
   */
  describe('getStartTime', () => {
    it('should return undefined when called outside of run', () => {
      const result = service.getStartTime();

      expect(result).toBeUndefined();
    });

    it('should return start time when called inside run', () => {
      const startTime = 1704067200000; // 2024-01-01 00:00:00 UTC
      const context: RequestContext = {
        requestId: 'time-test',
        startTime,
      };

      let capturedStartTime: number | undefined;

      service.run(context, () => {
        capturedStartTime = service.getStartTime();
      });

      expect(capturedStartTime).toBe(startTime);
    });

    it('should return correct time for nested operations', () => {
      const startTime = Date.now();
      const context: RequestContext = {
        requestId: 'nested-time-test',
        startTime,
      };

      let capturedStartTime: number | undefined;

      service.run(context, () => {
        // Nested function
        const getTime = (): number | undefined => service.getStartTime();
        capturedStartTime = getTime();
      });

      expect(capturedStartTime).toBe(startTime);
    });
  });

  /**
   * =========================================================================
   * SECTION 5: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle multiple service instances independently', () => {
      const service1 = new AsyncContextService();
      const service2 = new AsyncContextService();

      const context1: RequestContext = {
        requestId: 'service1-id',
        startTime: 1000,
      };
      const context2: RequestContext = {
        requestId: 'service2-id',
        startTime: 2000,
      };

      let result1: string | undefined;
      let result2: string | undefined;

      service1.run(context1, () => {
        result1 = service1.getRequestId();
      });

      service2.run(context2, () => {
        result2 = service2.getRequestId();
      });

      expect(result1).toBe('service1-id');
      expect(result2).toBe('service2-id');
    });

    it('should handle errors inside callback', () => {
      const context: RequestContext = {
        requestId: 'error-test',
        startTime: Date.now(),
      };

      expect(() => {
        service.run(context, () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });

    it('should not leak context after callback completes', () => {
      const context: RequestContext = {
        requestId: 'leak-test',
        startTime: Date.now(),
      };

      service.run(context, () => {
        // Context should be available here
        expect(service.getRequestId()).toBe('leak-test');
      });

      // Context should not be available here
      expect(service.getRequestId()).toBeUndefined();
    });
  });
});
