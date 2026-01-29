/**
 * ============================================================================
 * UNIT TESTS: HttpExceptionFilter
 * ============================================================================
 *
 * This file contains unit tests for the global HttpExceptionFilter.
 *
 * WHAT IS AN EXCEPTION FILTER?
 * An exception filter in NestJS intercepts exceptions thrown during request
 * processing and transforms them into appropriate HTTP responses. This filter:
 * - Catches all exceptions (decorated with @Catch())
 * - Converts them to standardized API error responses
 * - Handles rate limiting (ThrottlerException) with custom messages
 * - Logs errors appropriately (error level for 5xx, warn for others)
 *
 * WHAT ARE WE TESTING?
 * 1. catch() method: Main exception handling for different exception types
 * 2. handleThrottlerException(): Rate limiting response handling
 * 3. getThrottleEndpoint(): URL parsing for throttle config matching
 * 4. parseFieldError(): Error message parsing for validation errors
 * 5. Logging behavior: Correct log levels based on status codes
 */

import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from '@shared/infrastructure/filters/http-exception.filter';
import { LoggerPort } from '@shared/logging';

// Type for our mock request (Express Request subset)
interface MockRequest {
  url: string;
  method: string;
  body: Record<string, unknown>;
}

describe('HttpExceptionFilter', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST SETUP AND MOCKS
   * =========================================================================
   */

  let filter: HttpExceptionFilter;
  let mockLogger: jest.Mocked<LoggerPort>;
  let mockRequest: MockRequest;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
    setHeader: jest.Mock;
  };
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;

  // Helper to create a mock logger
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

    // setContext returns the logger itself for chaining
    logger.setContext.mockReturnValue(logger);

    return logger;
  };

  // Helper to create mock request
  const createMockRequest = (
    overrides: Partial<MockRequest> = {},
  ): MockRequest => {
    return {
      url: '/api/v1/users',
      method: 'GET',
      body: {},
      ...overrides,
    };
  };

  // Helper to create mock response
  const createMockResponse = () => {
    const response = {
      status: jest.fn(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    // Chain methods
    response.status.mockReturnValue(response);
    response.setHeader.mockReturnValue(response);
    return response;
  };

  // Helper to create mock ArgumentsHost
  const createMockArgumentsHost = (
    request: MockRequest,
    response: ReturnType<typeof createMockResponse>,
  ): jest.Mocked<ArgumentsHost> => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
        getResponse: jest.fn().mockReturnValue(response),
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as jest.Mocked<ArgumentsHost>;
  };

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);

    filter = new HttpExceptionFilter(mockLogger);
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
    it('should create an instance of HttpExceptionFilter', () => {
      expect(filter).toBeInstanceOf(HttpExceptionFilter);
    });

    it('should set logger context to HttpExceptionFilter', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('HttpExceptionFilter');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: CATCH METHOD - HTTP EXCEPTIONS
   * =========================================================================
   */
  describe('catch - HttpException handling', () => {
    it('should handle HttpException with string response', () => {
      /**
       * TEST: Simple HttpException with string message
       *
       * Some HttpExceptions are created with just a string message:
       * throw new HttpException('Not found', HttpStatus.NOT_FOUND);
       */
      const exception = new HttpException(
        'Resource not found',
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          path: '/api/v1/users',
        }),
      );
    });

    it('should handle HttpException with object response containing message string', () => {
      /**
       * TEST: HttpException with object response
       *
       * NestJS built-in exceptions typically return an object:
       * { statusCode: 400, message: 'Bad Request', error: 'Bad Request' }
       */
      const exception = new HttpException(
        { message: 'Invalid input data', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid input data',
        }),
      );
    });

    it('should handle validation errors with array of messages', () => {
      /**
       * TEST: Validation errors from class-validator
       *
       * When validation fails, NestJS returns an array of error messages.
       * The filter should convert these to ApiFieldError format.
       */
      const exception = new HttpException(
        {
          message: [
            'email must be a valid email',
            'password must be at least 8 characters',
          ],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            { field: 'email', message: 'email must be a valid email' },
            {
              field: 'password',
              message: 'password must be at least 8 characters',
            },
          ],
        }),
      );
    });

    it('should use "Validation failed" when no error property for array messages', () => {
      /**
       * TEST: Validation errors without error property
       */
      const exception = new HttpException(
        { message: ['field1 is required', 'field2 is invalid'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          errors: expect.any(Array),
        }),
      );
    });

    it('should handle different HTTP status codes', () => {
      /**
       * TEST: Various HTTP status codes
       *
       * The filter should preserve the original status code.
       */
      const testCases = [
        { status: HttpStatus.UNAUTHORIZED, message: 'Unauthorized' },
        { status: HttpStatus.FORBIDDEN, message: 'Forbidden' },
        { status: HttpStatus.NOT_FOUND, message: 'Not Found' },
        { status: HttpStatus.CONFLICT, message: 'Conflict' },
      ];

      testCases.forEach(({ status, message }) => {
        jest.clearAllMocks();
        const exception = new HttpException(message, status);

        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(status);
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 4: CATCH METHOD - GENERIC ERRORS
   * =========================================================================
   */
  describe('catch - Generic Error handling', () => {
    it('should handle generic Error with 500 status', () => {
      /**
       * TEST: Plain JavaScript Error
       *
       * Non-HTTP exceptions should be treated as internal server errors.
       */
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        }),
      );
    });

    it('should handle unknown exception types', () => {
      /**
       * TEST: Unknown exception (not Error, not HttpException)
       *
       * Edge case: something that's not an Error is thrown.
       * Should default to 500 with generic message.
       */
      const exception = { weird: 'object' };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );
    });

    it('should handle null exception', () => {
      filter.catch(null, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal server error',
        }),
      );
    });

    it('should handle string thrown as exception', () => {
      /**
       * TEST: String thrown as exception
       *
       * Edge case: throw 'something went wrong';
       */
      filter.catch('string error', mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 5: THROTTLER EXCEPTION HANDLING
   * =========================================================================
   */
  describe('catch - ThrottlerException handling', () => {
    it('should handle ThrottlerException for login endpoint', () => {
      /**
       * TEST: Rate limit on login
       *
       * Login has specific rate limit config: 5 minutes TTL.
       */
      mockRequest = createMockRequest({ url: '/api/v1/auth/login' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new ThrottlerException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.TOO_MANY_REQUESTS,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', '300');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message:
            'Demasiados intentos de login. Intenta de nuevo en 5 minutos.',
          retryAfter: 300,
        }),
      );
    });

    it('should handle ThrottlerException for register endpoint', () => {
      /**
       * TEST: Rate limit on register
       *
       * Register has specific rate limit config: 10 minutes TTL.
       */
      mockRequest = createMockRequest({ url: '/api/v1/auth/register' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new ThrottlerException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', '600');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Demasiados intentos de registro. Intenta de nuevo en 10 minutos.',
          retryAfter: 600,
        }),
      );
    });

    it('should handle ThrottlerException for refresh endpoint', () => {
      /**
       * TEST: Rate limit on refresh token
       *
       * Refresh has specific rate limit config: 1 minute TTL.
       */
      mockRequest = createMockRequest({ url: '/api/v1/auth/refresh' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new ThrottlerException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', '60');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Demasiadas solicitudes de refresh token. Intenta de nuevo en 1 minuto.',
          retryAfter: 60,
        }),
      );
    });

    it('should handle ThrottlerException for unknown endpoint with default config', () => {
      /**
       * TEST: Rate limit on unknown endpoint
       *
       * Endpoints not in THROTTLE_CONFIG should use default config.
       */
      mockRequest = createMockRequest({ url: '/api/v1/users/123' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new ThrottlerException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', '60');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
          retryAfter: 60,
        }),
      );
    });

    it('should strip query parameters when matching throttle endpoint', () => {
      /**
       * TEST: URL with query parameters
       *
       * Query parameters should be stripped before matching.
       */
      mockRequest = createMockRequest({
        url: '/api/v1/auth/login?redirect=/dashboard',
      });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new ThrottlerException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Demasiados intentos de login. Intenta de nuevo en 5 minutos.',
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 6: LOGGING BEHAVIOR TESTS
   * =========================================================================
   */
  describe('logging behavior', () => {
    it('should log with error level for 5xx status codes', () => {
      /**
       * TEST: Server errors logged as error
       *
       * 5xx errors are server-side issues and should be logged as errors.
       */
      const exception = new HttpException(
        'Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should log with warn level for 4xx status codes', () => {
      /**
       * TEST: Client errors logged as warning
       *
       * 4xx errors are client-side issues and should be logged as warnings.
       */
      const exception = new HttpException(
        'Bad Request',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should include request metadata in log', () => {
      /**
       * TEST: Log metadata includes request info
       *
       * Logs should include method, URL, and body for debugging.
       */
      mockRequest = createMockRequest({
        url: '/api/v1/users',
        method: 'POST',
        body: { email: 'test@test.com' },
      });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          method: 'POST',
          url: '/api/v1/users',
          body: { email: 'test@test.com' },
        }),
      );
    });

    it('should log ThrottlerException with warn level', () => {
      /**
       * TEST: Rate limit logged as warning
       */
      mockRequest = createMockRequest({ url: '/api/v1/auth/login' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new ThrottlerException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  /**
   * =========================================================================
   * SECTION 7: RESPONSE FORMAT TESTS
   * =========================================================================
   */
  describe('response format', () => {
    it('should include timestamp in ISO format', () => {
      /**
       * TEST: Timestamp format
       *
       * Response should include a valid ISO timestamp.
       */
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    });

    it('should include request path in response', () => {
      /**
       * TEST: Path in response
       *
       * The request path helps clients identify which endpoint failed.
       */
      mockRequest = createMockRequest({ url: '/api/v1/users/123' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new HttpException('Error', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/users/123',
        }),
      );
    });

    it('should always set success to false', () => {
      /**
       * TEST: Success flag
       *
       * Error responses should always have success: false.
       */
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });

    it('should not include errors array when no validation errors', () => {
      /**
       * TEST: No errors array for non-validation errors
       */
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.errors).toBeUndefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 8: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle HttpException with empty message', () => {
      const exception = new HttpException(
        { message: '' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle validation error with empty array', () => {
      const exception = new HttpException(
        { message: [], error: 'Validation failed' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [],
        }),
      );
    });

    it('should parse field error correctly for multi-word messages', () => {
      /**
       * TEST: Field error parsing
       *
       * The first word should become the field name.
       */
      const exception = new HttpException(
        { message: ['firstName should not be empty'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [
            { field: 'firstname', message: 'firstName should not be empty' },
          ],
        }),
      );
    });

    it('should handle URL without API prefix', () => {
      /**
       * TEST: URL without /api/v1 prefix
       */
      mockRequest = createMockRequest({ url: '/auth/login' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new ThrottlerException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Demasiados intentos de login. Intenta de nuevo en 5 minutos.',
        }),
      );
    });

    it('should handle URL with different API version', () => {
      /**
       * TEST: URL with different API version (/api/v2)
       */
      mockRequest = createMockRequest({ url: '/api/v2/auth/login' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);
      const exception = new ThrottlerException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Demasiados intentos de login. Intenta de nuevo en 5 minutos.',
        }),
      );
    });
  });
});
