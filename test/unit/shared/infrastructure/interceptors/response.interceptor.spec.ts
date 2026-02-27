/**
 * ============================================================================
 * UNIT TESTS: ResponseInterceptor
 * ============================================================================
 *
 * This file contains unit tests for the ResponseInterceptor.
 *
 * WHAT IS AN INTERCEPTOR?
 * An interceptor in NestJS is a class that can:
 * - Transform the result returned from a route handler
 * - Transform exceptions thrown from a route handler
 * - Extend basic function behavior
 * - Completely override a function based on specific conditions
 *
 * WHAT DOES ResponseInterceptor DO?
 * 1. Logs incoming HTTP requests (method, URL, body, query, IP)
 * 2. Logs outgoing responses with duration
 * 3. Wraps response data in standardized ApiResponse format
 * 4. Generates appropriate success messages based on HTTP method
 *
 * API RESPONSE FORMAT:
 * {
 *   success: true,
 *   statusCode: number,
 *   message: string,
 *   data: T,
 *   timestamp: string (ISO),
 *   path: string
 * }
 */

import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from '@shared/infrastructure/interceptors/response.interceptor';
import { LoggerPort, AsyncContextService } from '@shared/logging';

describe('ResponseInterceptor', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST SETUP AND MOCKS
   * =========================================================================
   */

  let interceptor: ResponseInterceptor<unknown>;
  let mockLogger: jest.Mocked<LoggerPort>;
  let mockAsyncContext: jest.Mocked<AsyncContextService>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockRequest: {
    method: string;
    url: string;
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    ip: string;
  };
  let mockResponse: {
    statusCode: number;
  };

  // Helper to create mock logger
  const createMockLogger = (): jest.Mocked<LoggerPort> => {
    const logger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      http: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      setContext: jest.fn(),
    } as jest.Mocked<LoggerPort>;

    logger.setContext.mockReturnValue(logger);
    return logger;
  };

  // Helper to create mock AsyncContextService
  // Note: We cast through 'unknown' because AsyncContextService has private
  // properties (storage) that we don't need to mock for our tests
  const createMockAsyncContext = (
    startTime: number | null = Date.now() - 100,
  ): jest.Mocked<AsyncContextService> => {
    return {
      run: jest.fn(),
      getContext: jest.fn(),
      getRequestId: jest.fn().mockReturnValue('req-123'),
      getStartTime: jest.fn().mockReturnValue(startTime),
    } as unknown as jest.Mocked<AsyncContextService>;
  };

  // Helper to create mock request
  const createMockRequest = (overrides: Partial<typeof mockRequest> = {}) => {
    return {
      method: 'GET',
      url: '/api/v1/users',
      body: {},
      query: {},
      ip: '127.0.0.1',
      ...overrides,
    };
  };

  // Helper to create mock response
  const createMockResponse = (statusCode: number = 200) => {
    return { statusCode };
  };

  // Helper to create mock ExecutionContext
  const createMockExecutionContext = (
    request: typeof mockRequest,
    response: typeof mockResponse,
  ): jest.Mocked<ExecutionContext> => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
        getResponse: jest.fn().mockReturnValue(response),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as jest.Mocked<ExecutionContext>;
  };

  // Helper to create mock CallHandler
  const createMockCallHandler = (
    data: unknown = {},
  ): jest.Mocked<CallHandler> => {
    return {
      handle: jest.fn().mockReturnValue(of(data)),
    } as jest.Mocked<CallHandler>;
  };

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockAsyncContext = createMockAsyncContext();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockExecutionContext = createMockExecutionContext(
      mockRequest,
      mockResponse,
    );
    mockCallHandler = createMockCallHandler({ id: 1, name: 'Test' });

    interceptor = new ResponseInterceptor(mockLogger, mockAsyncContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 2: CONSTRUCTOR TESTS
   * =========================================================================
   */
  describe('constructor', () => {
    it('should create an instance of ResponseInterceptor', () => {
      expect(interceptor).toBeInstanceOf(ResponseInterceptor);
    });

    it('should set logger context to HTTP', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('HTTP');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: REQUEST LOGGING TESTS
   * =========================================================================
   */
  describe('request logging', () => {
    it('should log incoming request with method and URL', (done) => {
      mockRequest = createMockRequest({ method: 'GET', url: '/api/v1/users' });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(mockLogger.http).toHaveBeenCalledWith(
            '--> GET /api/v1/users',
            undefined,
            expect.any(Object),
          );
          done();
        },
      });
    });

    it('should log request body in metadata', (done) => {
      mockRequest = createMockRequest({
        method: 'POST',
        body: { email: 'test@test.com' },
      });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(mockLogger.http).toHaveBeenCalledWith(
            expect.any(String),
            undefined,
            expect.objectContaining({
              body: { email: 'test@test.com' },
            }),
          );
          done();
        },
      });
    });

    it('should log query parameters in metadata', (done) => {
      mockRequest = createMockRequest({
        query: { page: '1', limit: '10' },
      });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(mockLogger.http).toHaveBeenCalledWith(
            expect.any(String),
            undefined,
            expect.objectContaining({
              query: { page: '1', limit: '10' },
            }),
          );
          done();
        },
      });
    });

    it('should log client IP in metadata', (done) => {
      mockRequest = createMockRequest({ ip: '192.168.1.100' });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(mockLogger.http).toHaveBeenCalledWith(
            expect.any(String),
            undefined,
            expect.objectContaining({
              ip: '192.168.1.100',
            }),
          );
          done();
        },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 4: RESPONSE LOGGING TESTS
   * =========================================================================
   */
  describe('response logging', () => {
    it('should log outgoing response with method, URL, and status code', (done) => {
      mockRequest = createMockRequest({ method: 'GET', url: '/api/v1/users' });
      mockResponse = createMockResponse(200);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(mockLogger.http).toHaveBeenCalledWith(
            '<-- GET /api/v1/users 200',
            undefined,
            expect.any(Object),
          );
          done();
        },
      });
    });

    it('should log response duration when startTime is available', (done) => {
      const startTime = Date.now() - 150; // 150ms ago
      mockAsyncContext = createMockAsyncContext(startTime);
      interceptor = new ResponseInterceptor(mockLogger, mockAsyncContext);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(mockLogger.http).toHaveBeenCalledWith(
            expect.stringContaining('<--'),
            undefined,
            expect.objectContaining({
              duration: expect.stringMatching(/^\d+ms$/),
            }),
          );
          done();
        },
      });
    });

    it('should log 0ms duration when startTime is null', (done) => {
      mockAsyncContext = createMockAsyncContext(null);
      interceptor = new ResponseInterceptor(mockLogger, mockAsyncContext);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(mockLogger.http).toHaveBeenCalledWith(
            expect.stringContaining('<--'),
            undefined,
            expect.objectContaining({
              duration: '0ms',
            }),
          );
          done();
        },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 5: RESPONSE TRANSFORMATION TESTS
   * =========================================================================
   */
  describe('response transformation', () => {
    it('should wrap response data in ApiResponse format', (done) => {
      const responseData = { id: 1, name: 'Test User' };
      mockCallHandler = createMockCallHandler(responseData);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual(
            expect.objectContaining({
              success: true,
              statusCode: 200,
              data: responseData,
            }),
          );
          done();
        },
      });
    });

    it('should include timestamp in ISO format', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.timestamp).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
          );
          done();
        },
      });
    });

    it('should include request path in response', (done) => {
      mockRequest = createMockRequest({ url: '/api/v1/users/123' });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.path).toBe('/api/v1/users/123');
          done();
        },
      });
    });

    it('should always set success to true', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.success).toBe(true);
          done();
        },
      });
    });

    it('should preserve the original data structure', (done) => {
      const complexData = {
        users: [
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' },
        ],
        meta: { total: 2, page: 1 },
      };
      mockCallHandler = createMockCallHandler(complexData);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data).toEqual(complexData);
          done();
        },
      });
    });

    it('should handle null data', (done) => {
      mockCallHandler = createMockCallHandler(null);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data).toBeNull();
          done();
        },
      });
    });

    it('should handle undefined data by converting to empty object', (done) => {
      /**
       * NOTE: When handler returns undefined, the map operator in RxJS
       * combined with the spread operator creates an empty object.
       * This is expected behavior - the response always has a data field.
       */
      mockCallHandler = createMockCallHandler(undefined);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data).toEqual({});
          done();
        },
      });
    });

    it('should handle array data', (done) => {
      const arrayData = [1, 2, 3, 4, 5];
      mockCallHandler = createMockCallHandler(arrayData);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data).toEqual(arrayData);
          done();
        },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 6: SUCCESS MESSAGE TESTS
   * =========================================================================
   */
  describe('success messages', () => {
    it('should return "Resource created successfully" for 201 status', (done) => {
      mockResponse = createMockResponse(201);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Resource created successfully');
          done();
        },
      });
    });

    it('should return "Data retrieved successfully" for GET requests', (done) => {
      mockRequest = createMockRequest({ method: 'GET' });
      mockResponse = createMockResponse(200);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Data retrieved successfully');
          done();
        },
      });
    });

    it('should return "Operation completed successfully" for POST requests (non-201)', (done) => {
      mockRequest = createMockRequest({ method: 'POST' });
      mockResponse = createMockResponse(200);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Operation completed successfully');
          done();
        },
      });
    });

    it('should return "Resource updated successfully" for PATCH requests', (done) => {
      mockRequest = createMockRequest({ method: 'PATCH' });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Resource updated successfully');
          done();
        },
      });
    });

    it('should return "Resource updated successfully" for PUT requests', (done) => {
      mockRequest = createMockRequest({ method: 'PUT' });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Resource updated successfully');
          done();
        },
      });
    });

    it('should return "Resource deleted successfully" for DELETE requests', (done) => {
      mockRequest = createMockRequest({ method: 'DELETE' });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Resource deleted successfully');
          done();
        },
      });
    });

    it('should return default message for unknown HTTP methods', (done) => {
      mockRequest = createMockRequest({ method: 'OPTIONS' });
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Operation completed successfully');
          done();
        },
      });
    });

    it('should prioritize 201 status over method for message', (done) => {
      // Even for GET with 201, should say "Resource created"
      mockRequest = createMockRequest({ method: 'GET' });
      mockResponse = createMockResponse(201);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Resource created successfully');
          done();
        },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 7: DIFFERENT STATUS CODES TESTS
   * =========================================================================
   */
  describe('different status codes', () => {
    const statusCodes = [200, 201, 202, 204];

    statusCodes.forEach((statusCode) => {
      it(`should handle ${statusCode} status code`, (done) => {
        mockResponse = createMockResponse(statusCode);
        mockExecutionContext = createMockExecutionContext(
          mockRequest,
          mockResponse,
        );

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: (result) => {
            expect(result.statusCode).toBe(statusCode);
            done();
          },
        });
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 8: OBSERVABLE BEHAVIOR TESTS
   * =========================================================================
   */
  describe('observable behavior', () => {
    it('should call next.handle()', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should complete the observable', (done) => {
      let completed = false;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          completed = true;
          expect(completed).toBe(true);
          done();
        },
      });
    });

    it('should emit exactly one value', (done) => {
      let emitCount = 0;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          emitCount++;
        },
        complete: () => {
          expect(emitCount).toBe(1);
          done();
        },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 9: REAL-WORLD SCENARIOS
   * =========================================================================
   */
  describe('real-world scenarios', () => {
    it('should handle user list response', (done) => {
      const users = [
        { id: 1, email: 'user1@test.com' },
        { id: 2, email: 'user2@test.com' },
      ];
      mockRequest = createMockRequest({ method: 'GET', url: '/api/v1/users' });
      mockResponse = createMockResponse(200);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );
      mockCallHandler = createMockCallHandler(users);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({
            success: true,
            statusCode: 200,
            message: 'Data retrieved successfully',
            data: users,
            timestamp: expect.any(String),
            path: '/api/v1/users',
          });
          done();
        },
      });
    });

    it('should handle user creation response', (done) => {
      const newUser = { id: 3, email: 'new@test.com' };
      mockRequest = createMockRequest({ method: 'POST', url: '/api/v1/users' });
      mockResponse = createMockResponse(201);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );
      mockCallHandler = createMockCallHandler(newUser);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.statusCode).toBe(201);
          expect(result.message).toBe('Resource created successfully');
          expect(result.data).toEqual(newUser);
          done();
        },
      });
    });

    it('should handle user update response', (done) => {
      const updatedUser = { id: 1, email: 'updated@test.com' };
      mockRequest = createMockRequest({
        method: 'PATCH',
        url: '/api/v1/users/1',
      });
      mockResponse = createMockResponse(200);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );
      mockCallHandler = createMockCallHandler(updatedUser);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Resource updated successfully');
          expect(result.data).toEqual(updatedUser);
          done();
        },
      });
    });

    it('should handle delete response with no data', (done) => {
      mockRequest = createMockRequest({
        method: 'DELETE',
        url: '/api/v1/users/1',
      });
      mockResponse = createMockResponse(200);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );
      mockCallHandler = createMockCallHandler(null);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Resource deleted successfully');
          expect(result.data).toBeNull();
          done();
        },
      });
    });

    it('should handle login response', (done) => {
      const authResponse = {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'user@test.com' },
      };
      mockRequest = createMockRequest({
        method: 'POST',
        url: '/api/v1/auth/login',
      });
      mockResponse = createMockResponse(200);
      mockExecutionContext = createMockExecutionContext(
        mockRequest,
        mockResponse,
      );
      mockCallHandler = createMockCallHandler(authResponse);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.success).toBe(true);
          expect(result.data).toEqual(authResponse);
          done();
        },
      });
    });
  });
});
