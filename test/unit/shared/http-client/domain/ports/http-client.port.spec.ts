/**
 * ============================================================================
 * UNIT TESTS: HttpClientError
 * ============================================================================
 *
 * This file contains unit tests for the HttpClientError class.
 *
 * WHAT IS HttpClientError?
 * A custom error class that extends Error to carry HTTP-specific details:
 * - status: HTTP status code
 * - data: Response data
 * - cause: Original error (if any)
 *
 * TESTING APPROACH:
 * Test constructor and properties directly.
 */

import { HttpClientError } from '@shared/http-client/domain/ports/http-client.port';

describe('HttpClientError', () => {
  /**
   * =========================================================================
   * SECTION 1: CONSTRUCTOR TESTS
   * =========================================================================
   */
  describe('constructor', () => {
    it('should create error with message only', () => {
      const error = new HttpClientError('Request failed');

      expect(error.message).toBe('Request failed');
      expect(error.name).toBe('HttpClientError');
      expect(error.status).toBeUndefined();
      expect(error.data).toBeUndefined();
    });

    it('should create error with message and status', () => {
      const error = new HttpClientError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
      expect(error.data).toBeUndefined();
    });

    it('should create error with message, status, and data', () => {
      const responseData = { error: 'Invalid input', field: 'email' };
      const error = new HttpClientError('Bad request', 400, responseData);

      expect(error.message).toBe('Bad request');
      expect(error.status).toBe(400);
      expect(error.data).toEqual(responseData);
    });

    it('should create error with cause', () => {
      const cause = new Error('Network error');
      const error = new HttpClientError('Request failed', 500, null, cause);

      expect(error.message).toBe('Request failed');
      expect(error.cause).toBe(cause);
    });

    it('should create error with all parameters', () => {
      const cause = new Error('Original error');
      const responseData = { details: 'Server unavailable' };
      const error = new HttpClientError(
        'Service unavailable',
        503,
        responseData,
        cause,
      );

      expect(error.message).toBe('Service unavailable');
      expect(error.status).toBe(503);
      expect(error.data).toEqual(responseData);
      expect(error.cause).toBe(cause);
    });
  });

  /**
   * =========================================================================
   * SECTION 2: PROPERTY TESTS
   * =========================================================================
   */
  describe('properties', () => {
    it('should have readonly status property', () => {
      const error = new HttpClientError('Error', 500);

      expect(error.status).toBe(500);
    });

    it('should have readonly data property', () => {
      const data = { key: 'value' };
      const error = new HttpClientError('Error', 400, data);

      expect(error.data).toEqual(data);
    });

    it('should inherit from Error', () => {
      const error = new HttpClientError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpClientError);
    });

    it('should have name property set to HttpClientError', () => {
      const error = new HttpClientError('Test');

      expect(error.name).toBe('HttpClientError');
    });

    it('should have stack trace', () => {
      const error = new HttpClientError('Stack test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('HttpClientError');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: STATUS CODE SCENARIOS
   * =========================================================================
   */
  describe('status code scenarios', () => {
    it('should handle 400 Bad Request', () => {
      const error = new HttpClientError('Bad Request', 400, {
        errors: ['Invalid email'],
      });

      expect(error.status).toBe(400);
      expect(error.data).toEqual({ errors: ['Invalid email'] });
    });

    it('should handle 401 Unauthorized', () => {
      const error = new HttpClientError('Unauthorized', 401);

      expect(error.status).toBe(401);
    });

    it('should handle 403 Forbidden', () => {
      const error = new HttpClientError('Forbidden', 403);

      expect(error.status).toBe(403);
    });

    it('should handle 404 Not Found', () => {
      const error = new HttpClientError('Not Found', 404);

      expect(error.status).toBe(404);
    });

    it('should handle 429 Too Many Requests', () => {
      const error = new HttpClientError('Rate limited', 429, {
        retryAfter: 60,
      });

      expect(error.status).toBe(429);
      expect(error.data).toEqual({ retryAfter: 60 });
    });

    it('should handle 500 Internal Server Error', () => {
      const error = new HttpClientError('Internal Server Error', 500);

      expect(error.status).toBe(500);
    });

    it('should handle 502 Bad Gateway', () => {
      const error = new HttpClientError('Bad Gateway', 502);

      expect(error.status).toBe(502);
    });

    it('should handle 503 Service Unavailable', () => {
      const error = new HttpClientError('Service Unavailable', 503);

      expect(error.status).toBe(503);
    });

    it('should handle 504 Gateway Timeout', () => {
      const error = new HttpClientError('Gateway Timeout', 504);

      expect(error.status).toBe(504);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: DATA HANDLING TESTS
   * =========================================================================
   */
  describe('data handling', () => {
    it('should handle string data', () => {
      const error = new HttpClientError('Error', 400, 'Plain text error');

      expect(error.data).toBe('Plain text error');
    });

    it('should handle array data', () => {
      const errors = ['Error 1', 'Error 2'];
      const error = new HttpClientError('Validation error', 400, errors);

      expect(error.data).toEqual(errors);
    });

    it('should handle nested object data', () => {
      const data = {
        errors: {
          email: ['Invalid format'],
          password: ['Too short', 'Missing special character'],
        },
      };
      const error = new HttpClientError('Validation failed', 422, data);

      expect(error.data).toEqual(data);
    });

    it('should handle null data', () => {
      const error = new HttpClientError('Error', 500, null);

      expect(error.data).toBeNull();
    });

    it('should handle number data', () => {
      const error = new HttpClientError('Error', 500, 12345);

      expect(error.data).toBe(12345);
    });
  });

  /**
   * =========================================================================
   * SECTION 5: ERROR CHAINING TESTS
   * =========================================================================
   */
  describe('error chaining', () => {
    it('should preserve original error as cause', () => {
      const original = new Error('Network timeout');
      const error = new HttpClientError(
        'Request failed',
        undefined,
        undefined,
        original,
      );

      expect(error.cause).toBe(original);
      expect((error.cause as Error).message).toBe('Network timeout');
    });

    it('should handle TypeError as cause', () => {
      const typeError = new TypeError('Cannot read property of undefined');
      const error = new HttpClientError('Parse error', 500, null, typeError);

      expect(error.cause).toBeInstanceOf(TypeError);
    });

    it('should handle no cause', () => {
      const error = new HttpClientError('Error without cause', 400);

      expect(error.cause).toBeUndefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 6: THROWABLE TESTS
   * =========================================================================
   */
  describe('throwable', () => {
    it('should be throwable', () => {
      expect(() => {
        throw new HttpClientError('Thrown error', 500);
      }).toThrow(HttpClientError);
    });

    it('should be catchable with message check', () => {
      expect(() => {
        throw new HttpClientError('Custom message');
      }).toThrow('Custom message');
    });

    it('should work in try-catch', () => {
      let caught: HttpClientError | null = null;

      try {
        throw new HttpClientError('Catch test', 404, { id: 'not-found' });
      } catch (error) {
        caught = error as HttpClientError;
      }

      expect(caught).toBeInstanceOf(HttpClientError);
      expect(caught?.status).toBe(404);
      expect(caught?.data).toEqual({ id: 'not-found' });
    });
  });
});
