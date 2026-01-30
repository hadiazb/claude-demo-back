/**
 * ============================================================================
 * UNIT TESTS: RequestIdMiddleware
 * ============================================================================
 *
 * This file contains unit tests for the RequestIdMiddleware.
 *
 * WHAT IS RequestIdMiddleware?
 * A NestJS middleware that:
 * - Extracts or generates a request ID for each incoming request
 * - Sets the request ID in the response header
 * - Stores the request context using AsyncContextService
 *
 * TESTING APPROACH:
 * Mock Express request/response objects and AsyncContextService,
 * verify middleware behavior for various scenarios.
 */

import { Request, Response } from 'express';
import {
  RequestIdMiddleware,
  REQUEST_ID_HEADER,
} from '@shared/logging/infrastructure/middleware/request-id.middleware';
import { AsyncContextService } from '@shared/logging/infrastructure/context/async-context.service';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let mockAsyncContext: jest.Mocked<AsyncContextService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockAsyncContext = {
      run: jest.fn().mockImplementation((_context, callback) => callback()),
      getContext: jest.fn(),
      getRequestId: jest.fn(),
      getStartTime: jest.fn(),
    } as unknown as jest.Mocked<AsyncContextService>;

    middleware = new RequestIdMiddleware(mockAsyncContext);

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 1: CONSTANTS TESTS
   * =========================================================================
   */
  describe('constants', () => {
    it('should export REQUEST_ID_HEADER constant', () => {
      expect(REQUEST_ID_HEADER).toBe('x-request-id');
    });
  });

  /**
   * =========================================================================
   * SECTION 2: REQUEST ID EXTRACTION TESTS
   * =========================================================================
   */
  describe('request ID extraction', () => {
    it('should use existing request ID from header', () => {
      const existingRequestId = 'existing-request-id-123';
      mockRequest.headers = {
        [REQUEST_ID_HEADER]: existingRequestId,
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAsyncContext.run).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: existingRequestId }),
        expect.any(Function),
      );
    });

    it('should generate new UUID when header is missing', () => {
      mockRequest.headers = {};

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAsyncContext.run).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
        }),
        expect.any(Function),
      );
    });

    it('should generate new UUID when header is empty string', () => {
      mockRequest.headers = {
        [REQUEST_ID_HEADER]: '',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAsyncContext.run).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
        }),
        expect.any(Function),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 3: RESPONSE HEADER TESTS
   * =========================================================================
   */
  describe('response header', () => {
    it('should set request ID header in response', () => {
      const existingRequestId = 'response-header-test';
      mockRequest.headers = {
        [REQUEST_ID_HEADER]: existingRequestId,
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        REQUEST_ID_HEADER,
        existingRequestId,
      );
    });

    it('should set generated request ID in response header', () => {
      mockRequest.headers = {};

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        REQUEST_ID_HEADER,
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        ),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 4: ASYNC CONTEXT TESTS
   * =========================================================================
   */
  describe('async context', () => {
    it('should run callback within async context', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAsyncContext.run).toHaveBeenCalled();
    });

    it('should include startTime in context', () => {
      const beforeTime = Date.now();

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      const afterTime = Date.now();

      expect(mockAsyncContext.run).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: expect.any(Number),
        }),
        expect.any(Function),
      );

      const passedContext = mockAsyncContext.run.mock.calls[0][0];
      expect(passedContext.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(passedContext.startTime).toBeLessThanOrEqual(afterTime);
    });

    it('should call next() inside async context run', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  /**
   * =========================================================================
   * SECTION 5: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle empty headers object', () => {
      mockRequest.headers = {};

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );
      }).not.toThrow();

      expect(mockNext).toHaveBeenCalled();
    });

    it('should preserve other headers', () => {
      mockRequest.headers = {
        'content-type': 'application/json',
        authorization: 'Bearer token',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate unique IDs for consecutive requests', () => {
      const requestIds: string[] = [];

      for (let i = 0; i < 5; i++) {
        mockRequest.headers = {};
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        const passedContext = mockAsyncContext.run.mock.calls[i][0];
        requestIds.push(passedContext.requestId);
      }

      const uniqueIds = new Set(requestIds);
      expect(uniqueIds.size).toBe(5);
    });
  });
});
