/**
 * ============================================================================
 * UNIT TESTS: AxiosHttpClientAdapter
 * ============================================================================
 *
 * This file contains unit tests for the AxiosHttpClientAdapter.
 *
 * WHAT IS AxiosHttpClientAdapter?
 * An Axios-based HTTP client implementation that:
 * - Implements HttpClientPort interface
 * - Provides GET, POST, PUT, PATCH, DELETE methods
 * - Includes retry logic with exponential backoff
 * - Propagates request IDs via headers
 * - Logs all HTTP operations
 *
 * TESTING APPROACH:
 * Mock axios, AsyncContextService, and LoggerPort to test HTTP client behavior.
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { AxiosHttpClientAdapter } from '@shared/http-client/infrastructure/adapters/axios-http-client.adapter';
import { HttpClientError } from '@shared/http-client/domain/ports/http-client.port';
import { AsyncContextService } from '@shared/logging/infrastructure/context/async-context.service';
import { LoggerPort } from '@shared/logging/domain/ports/logger.port';

jest.mock('axios');

describe('AxiosHttpClientAdapter', () => {
  let adapter: AxiosHttpClientAdapter;
  let mockAsyncContext: jest.Mocked<AsyncContextService>;
  let mockLogger: jest.Mocked<LoggerPort>;
  let mockAxiosInstance: jest.Mocked<ReturnType<typeof axios.create>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockAsyncContext = {
      run: jest.fn(),
      getContext: jest.fn(),
      getRequestId: jest.fn().mockReturnValue('test-request-id'),
      getStartTime: jest.fn(),
    } as unknown as jest.Mocked<AsyncContextService>;

    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      http: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      log: jest.fn(),
      setContext: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<LoggerPort>;

    mockAxiosInstance = {
      request: jest.fn(),
    } as unknown as jest.Mocked<ReturnType<typeof axios.create>>;

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    (axios.isAxiosError as unknown as jest.Mock) = jest
      .fn()
      .mockReturnValue(false);

    adapter = new AxiosHttpClientAdapter(mockAsyncContext, mockLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Helper to create mock axios response
  const createMockResponse = <T>(
    data: T,
    status = 200,
    statusText = 'OK',
    headers: Record<string, unknown> = {},
  ): AxiosResponse<T> =>
    ({
      data,
      status,
      statusText,
      headers,
      config: {},
    }) as AxiosResponse<T>;

  // Helper to create mock axios error
  const createMockAxiosError = (
    message: string,
    status?: number,
    data?: unknown,
  ): AxiosError => {
    const error = new Error(message) as AxiosError;
    error.isAxiosError = true;
    error.response = status
      ? {
          status,
          statusText: 'Error',
          data,
          headers: {},
          config: {} as AxiosResponse['config'],
        }
      : undefined;
    return error;
  };

  /**
   * =========================================================================
   * SECTION 1: CONSTRUCTOR TESTS
   * =========================================================================
   */
  describe('constructor', () => {
    it('should create axios instance with default timeout', () => {
      expect(axios.create).toHaveBeenCalledWith({
        timeout: 30000,
      });
    });

    it('should set logger context to HttpClient', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('HttpClient');
    });
  });

  /**
   * =========================================================================
   * SECTION 2: GET METHOD TESTS
   * =========================================================================
   */
  describe('get', () => {
    it('should perform GET request', async () => {
      const responseData = { id: 1, name: 'Test' };
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse(responseData),
      );

      const result = await adapter.get('/api/test');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
        }),
      );
      expect(result.data).toEqual(responseData);
      expect(result.status).toBe(200);
    });

    it('should include custom headers', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.get('/api/test', {
        headers: { Authorization: 'Bearer token' },
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token',
          }),
        }),
      );
    });

    it('should include request ID header', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.get('/api/test');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-request-id': 'test-request-id',
          }),
        }),
      );
    });

    it('should not include request ID header when not available', async () => {
      mockAsyncContext.getRequestId.mockReturnValue(undefined);
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.get('/api/test');

      const callArgs = mockAxiosInstance.request.mock.calls[0][0];
      expect(callArgs.headers?.['x-request-id']).toBeUndefined();
    });

    it('should use baseUrl when provided', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.get('/users', {
        baseUrl: 'https://api.example.com',
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/users',
        }),
      );
    });

    it('should include query params', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.get('/api/search', {
        params: { q: 'test', page: 1 },
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { q: 'test', page: 1 },
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 3: POST METHOD TESTS
   * =========================================================================
   */
  describe('post', () => {
    it('should perform POST request with data', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: 1, name: 'New Item' };
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse(responseData, 201, 'Created'),
      );

      const result = await adapter.post('/api/items', requestData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/api/items',
          data: requestData,
        }),
      );
      expect(result.data).toEqual(responseData);
      expect(result.status).toBe(201);
    });

    it('should handle POST without data', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.post('/api/trigger');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          data: undefined,
        }),
      );
    });

    it('should set Content-Type header', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.post('/api/items', { name: 'Test' });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 4: PUT METHOD TESTS
   * =========================================================================
   */
  describe('put', () => {
    it('should perform PUT request with data', async () => {
      const requestData = { id: 1, name: 'Updated Item' };
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse(requestData),
      );

      const result = await adapter.put('/api/items/1', requestData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/api/items/1',
          data: requestData,
        }),
      );
      expect(result.data).toEqual(requestData);
    });
  });

  /**
   * =========================================================================
   * SECTION 5: PATCH METHOD TESTS
   * =========================================================================
   */
  describe('patch', () => {
    it('should perform PATCH request with partial data', async () => {
      const requestData = { name: 'Patched Name' };
      const responseData = { id: 1, name: 'Patched Name', status: 'active' };
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse(responseData),
      );

      const result = await adapter.patch('/api/items/1', requestData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/api/items/1',
          data: requestData,
        }),
      );
      expect(result.data).toEqual(responseData);
    });
  });

  /**
   * =========================================================================
   * SECTION 6: DELETE METHOD TESTS
   * =========================================================================
   */
  describe('delete', () => {
    it('should perform DELETE request', async () => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse(null, 204, 'No Content'),
      );

      const result = await adapter.delete('/api/items/1');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/api/items/1',
        }),
      );
      expect(result.status).toBe(204);
    });
  });

  /**
   * =========================================================================
   * SECTION 7: RESPONSE HANDLING TESTS
   * =========================================================================
   */
  describe('response handling', () => {
    it('should normalize string response headers', async () => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse({}, 200, 'OK', {
          'content-type': 'application/json',
          'x-custom': 'value',
        }),
      );

      const result = await adapter.get('/api/test');

      expect(result.headers).toEqual({
        'content-type': 'application/json',
        'x-custom': 'value',
      });
    });

    it('should normalize array response headers', async () => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse({}, 200, 'OK', {
          'set-cookie': ['cookie1=value1', 'cookie2=value2'],
        }),
      );

      const result = await adapter.get('/api/test');

      expect(result.headers['set-cookie']).toBe(
        'cookie1=value1, cookie2=value2',
      );
    });

    it('should return status text', async () => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse({}, 201, 'Created'),
      );

      const result = await adapter.post('/api/items', {});

      expect(result.statusText).toBe('Created');
    });
  });

  /**
   * =========================================================================
   * SECTION 8: ERROR HANDLING TESTS
   * =========================================================================
   */
  describe('error handling', () => {
    it('should throw HttpClientError on axios error', async () => {
      const axiosError = createMockAxiosError('Request failed', 404, {
        message: 'Not found',
      });
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      await expect(adapter.get('/api/missing', { retries: 0 })).rejects.toThrow(
        HttpClientError,
      );
    });

    it('should include status code in error', async () => {
      const axiosError = createMockAxiosError('Not found', 404);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      try {
        await adapter.get('/api/missing', { retries: 0 });
      } catch (error) {
        expect((error as HttpClientError).status).toBe(404);
      }
    });

    it('should include response data in error', async () => {
      const axiosError = createMockAxiosError('Bad request', 400, {
        errors: ['Invalid input'],
      });
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      try {
        await adapter.post('/api/items', {}, { retries: 0 });
      } catch (error) {
        expect((error as HttpClientError).data).toEqual({
          errors: ['Invalid input'],
        });
      }
    });

    it('should handle network errors (no response)', async () => {
      const networkError = createMockAxiosError('Network Error');
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(networkError);

      await expect(adapter.get('/api/test', { retries: 0 })).rejects.toThrow(
        HttpClientError,
      );
    });

    it('should handle non-axios errors', async () => {
      const genericError = new Error('Unknown error');
      mockAxiosInstance.request.mockRejectedValue(genericError);

      await expect(adapter.get('/api/test', { retries: 0 })).rejects.toThrow(
        HttpClientError,
      );
    });

    it('should log errors', async () => {
      const axiosError = createMockAxiosError('Request failed', 500);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      try {
        await adapter.get('/api/test', { retries: 0 });
      } catch {
        // Expected to throw
      }

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  /**
   * =========================================================================
   * SECTION 9: RETRY LOGIC TESTS
   * =========================================================================
   */
  describe('retry logic', () => {
    it('should retry on 5xx errors', async () => {
      const axiosError = createMockAxiosError('Server error', 500);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request
        .mockRejectedValueOnce(axiosError)
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const resultPromise = adapter.get('/api/test', { retries: 3 });

      // Fast-forward through retries
      await jest.runAllTimersAsync();

      const result = await resultPromise;
      expect(result.data).toEqual({ success: true });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
    });

    it('should retry on 429 rate limit', async () => {
      const axiosError = createMockAxiosError('Too many requests', 429);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce(createMockResponse({}));

      const resultPromise = adapter.get('/api/test', { retries: 3 });

      await jest.runAllTimersAsync();

      await resultPromise;
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should retry on network errors', async () => {
      const networkError = createMockAxiosError('Network Error');
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(createMockResponse({}));

      const resultPromise = adapter.get('/api/test', { retries: 3 });

      await jest.runAllTimersAsync();

      await resultPromise;
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors (except 429)', async () => {
      const axiosError = createMockAxiosError('Not found', 404);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      await expect(adapter.get('/api/test', { retries: 3 })).rejects.toThrow();
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 400 Bad Request', async () => {
      const axiosError = createMockAxiosError('Bad request', 400);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      await expect(adapter.get('/api/test', { retries: 3 })).rejects.toThrow();
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should respect retry count from config', async () => {
      const axiosError = createMockAxiosError('Server error', 500);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      // Start the request (don't await yet)
      const resultPromise = adapter.get('/api/test', { retries: 2 });

      // Run all pending timers (for retry delays)
      for (let i = 0; i < 3; i++) {
        await Promise.resolve();
        jest.advanceTimersByTime(5000);
      }

      await expect(resultPromise).rejects.toThrow(HttpClientError);
      // Initial + 2 retries = 3 calls
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
    });

    it('should log retry attempts', async () => {
      const axiosError = createMockAxiosError('Server error', 500);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce(createMockResponse({}));

      const resultPromise = adapter.get('/api/test', { retries: 3 });

      await jest.runAllTimersAsync();

      await resultPromise;
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Retry attempt'),
        undefined,
        expect.any(Object),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 10: TIMEOUT TESTS
   * =========================================================================
   */
  describe('timeout', () => {
    it('should use custom timeout from config', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.get('/api/test', { timeout: 5000 });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        }),
      );
    });

    it('should use default timeout when not specified', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.get('/api/test');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 11: LOGGING TESTS
   * =========================================================================
   */
  describe('logging', () => {
    it('should log request start', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      await adapter.get('/api/test');

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'HTTP GET request',
        undefined,
        expect.objectContaining({
          url: '/api/test',
          attempt: 1,
        }),
      );
    });

    it('should log successful response', async () => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse({}, 200, 'OK'),
      );

      await adapter.get('/api/test');

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'HTTP GET response',
        undefined,
        expect.objectContaining({
          url: '/api/test',
          status: 200,
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 12: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle non-axios errors without retrying', async () => {
      const genericError = new TypeError('Cannot read property');
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);
      mockAxiosInstance.request.mockRejectedValue(genericError);

      await expect(adapter.get('/api/test', { retries: 3 })).rejects.toThrow(
        HttpClientError,
      );
      // Should not retry for non-axios errors
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should handle non-Error objects thrown', async () => {
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);
      mockAxiosInstance.request.mockRejectedValue('string error');

      await expect(adapter.get('/api/test', { retries: 0 })).rejects.toThrow(
        HttpClientError,
      );
    });

    it('should skip non-string and non-array header values', async () => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockResponse({}, 200, 'OK', {
          'content-type': 'application/json',
          'x-number': 123,
          'x-object': { nested: 'value' },
          'x-null': null,
        }),
      );

      const result = await adapter.get('/api/test');

      expect(result.headers['content-type']).toBe('application/json');
      expect(result.headers['x-number']).toBeUndefined();
      expect(result.headers['x-object']).toBeUndefined();
      expect(result.headers['x-null']).toBeUndefined();
    });

    it('should handle empty config gracefully', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockResponse({}));

      const result = await adapter.get('/api/test', {});

      expect(result.status).toBe(200);
    });

    it('should use default retries when not specified', async () => {
      const axiosError = createMockAxiosError('Server error', 500);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request
        .mockRejectedValueOnce(axiosError)
        .mockRejectedValueOnce(axiosError)
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce(createMockResponse({}));

      const resultPromise = adapter.get('/api/test');

      await jest.runAllTimersAsync();

      const result = await resultPromise;
      expect(result.status).toBe(200);
      // Default 3 retries + initial = 4 calls max
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(4);
    });
  });
});
