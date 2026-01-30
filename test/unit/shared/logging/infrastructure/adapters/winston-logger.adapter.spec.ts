/**
 * ============================================================================
 * UNIT TESTS: WinstonLoggerAdapter
 * ============================================================================
 *
 * This file contains unit tests for the WinstonLoggerAdapter.
 *
 * WHAT IS WinstonLoggerAdapter?
 * A Winston-based logger implementation that:
 * - Implements LoggerPort and NestJS LoggerService interfaces
 * - Supports multiple log levels (error, warn, info, http, debug, verbose)
 * - Includes request ID tracking via AsyncContextService
 * - Sanitizes sensitive data in logs
 * - Supports pretty and JSON output formats
 *
 * TESTING APPROACH:
 * Mock ConfigService and AsyncContextService, verify logging behavior.
 */

import { ConfigService } from '@nestjs/config';
import { WinstonLoggerAdapter } from '@shared/logging/infrastructure/adapters/winston-logger.adapter';
import { AsyncContextService } from '@shared/logging/infrastructure/context/async-context.service';

describe('WinstonLoggerAdapter', () => {
  let logger: WinstonLoggerAdapter;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockAsyncContext: jest.Mocked<AsyncContextService>;

  // Spy on winston logger methods
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    mockConfigService = {
      get: jest
        .fn()
        .mockImplementation((key: string, defaultValue?: unknown) => {
          const config: Record<string, unknown> = {
            'logger.level': 'debug',
            'logger.format': 'pretty',
            'logger.toFile': false,
            'logger.directory': 'logs',
            'logger.appName': 'test-app',
          };
          return config[key] ?? defaultValue;
        }),
    } as unknown as jest.Mocked<ConfigService>;

    mockAsyncContext = {
      run: jest.fn(),
      getContext: jest.fn(),
      getRequestId: jest.fn().mockReturnValue('test-request-id'),
      getStartTime: jest.fn(),
    } as unknown as jest.Mocked<AsyncContextService>;

    logger = new WinstonLoggerAdapter(mockConfigService, mockAsyncContext);

    // Spy on internal logger
    logSpy = jest.spyOn(logger['logger'], 'log');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 1: CONSTRUCTOR TESTS
   * =========================================================================
   */
  describe('constructor', () => {
    it('should create logger instance', () => {
      expect(logger).toBeInstanceOf(WinstonLoggerAdapter);
    });

    it('should read config values', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'logger.level',
        'debug',
      );
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'logger.format',
        'pretty',
      );
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'logger.toFile',
        false,
      );
    });

    it('should create logger with JSON format', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: unknown) => {
          if (key === 'logger.format') return 'json';
          const config: Record<string, unknown> = {
            'logger.level': 'debug',
            'logger.toFile': false,
            'logger.directory': 'logs',
            'logger.appName': 'test-app',
          };
          return config[key] ?? defaultValue;
        },
      );

      const jsonLogger = new WinstonLoggerAdapter(
        mockConfigService,
        mockAsyncContext,
      );
      expect(jsonLogger).toBeInstanceOf(WinstonLoggerAdapter);
    });

    it('should create logger with file transports when enabled', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: unknown) => {
          if (key === 'logger.toFile') return true;
          const config: Record<string, unknown> = {
            'logger.level': 'debug',
            'logger.format': 'pretty',
            'logger.directory': 'logs',
            'logger.appName': 'test-app',
          };
          return config[key] ?? defaultValue;
        },
      );

      const fileLogger = new WinstonLoggerAdapter(
        mockConfigService,
        mockAsyncContext,
      );
      expect(fileLogger).toBeInstanceOf(WinstonLoggerAdapter);
    });
  });

  /**
   * =========================================================================
   * SECTION 2: SET CONTEXT TESTS
   * =========================================================================
   */
  describe('setContext', () => {
    it('should return new logger with context', () => {
      const newLogger = logger.setContext('TestContext');

      expect(newLogger).toBeDefined();
      expect(newLogger).not.toBe(logger);
    });

    it('should preserve logger functionality', () => {
      const newLogger = logger.setContext('TestContext');
      const newLogSpy = jest.spyOn(newLogger['logger'], 'log');

      newLogger.info('Test message');

      expect(newLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Test message',
          context: 'TestContext',
        }),
      );
    });

    it('should chain context setting', () => {
      const contextLogger = logger.setContext('FirstContext');
      const secondContextLogger = contextLogger.setContext('SecondContext');

      expect(secondContextLogger).toBeDefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 3: LOG LEVEL TESTS
   * =========================================================================
   */
  describe('log levels', () => {
    it('should log error level messages', () => {
      logger.error('Error message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Error message',
        }),
      );
    });

    it('should log error with trace', () => {
      logger.error('Error message', 'Stack trace here');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Error message',
          stack: 'Stack trace here',
        }),
      );
    });

    it('should log error with metadata', () => {
      logger.error('Error message', undefined, { userId: 'user-123' });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Error message',
          userId: 'user-123',
        }),
      );
    });

    it('should log warn level messages', () => {
      logger.warn('Warning message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
          message: 'Warning message',
        }),
      );
    });

    it('should log info level messages', () => {
      logger.info('Info message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Info message',
        }),
      );
    });

    it('should log http level messages', () => {
      logger.http('HTTP message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'http',
          message: 'HTTP message',
        }),
      );
    });

    it('should log debug level messages', () => {
      logger.debug('Debug message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
          message: 'Debug message',
        }),
      );
    });

    it('should log verbose level messages', () => {
      logger.verbose('Verbose message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'verbose',
          message: 'Verbose message',
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 4: LOG METHOD (NestJS LoggerService) TESTS
   * =========================================================================
   */
  describe('log method', () => {
    it('should log using info level', () => {
      const infoSpy = jest.spyOn(logger['logger'], 'info');

      logger.log('Log message');

      expect(infoSpy).toHaveBeenCalledWith('Log message', {
        context: undefined,
      });
    });

    it('should log with context', () => {
      const contextLogger = logger.setContext(
        'MyContext',
      ) as WinstonLoggerAdapter;
      const infoSpy = jest.spyOn(contextLogger['logger'], 'info');

      contextLogger.log('Log message');

      expect(infoSpy).toHaveBeenCalledWith('Log message', {
        context: 'MyContext',
      });
    });

    it('should log with custom context parameter', () => {
      const infoSpy = jest.spyOn(logger['logger'], 'info');

      logger.log('Log message', 'CustomContext');

      expect(infoSpy).toHaveBeenCalledWith('Log message', {
        context: 'CustomContext',
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 5: METADATA AND SANITIZATION TESTS
   * =========================================================================
   */
  describe('metadata and sanitization', () => {
    it('should include metadata in log', () => {
      logger.info('Message', undefined, { key: 'value', count: 42 });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'value',
          count: 42,
        }),
      );
    });

    it('should sanitize sensitive data in metadata', () => {
      logger.info('Login', undefined, {
        email: 'test@test.com',
        password: 'secret123',
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@test.com',
          password: '[REDACTED]',
        }),
      );
    });

    it('should sanitize token fields', () => {
      logger.info('Auth', undefined, { accessToken: 'jwt-token-here' });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: '[REDACTED]',
        }),
      );
    });

    it('should handle undefined metadata', () => {
      logger.info('Message', undefined, undefined);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Message',
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 6: TRACE PARAMETER TESTS
   * =========================================================================
   */
  describe('trace parameter', () => {
    it('should include stack trace when provided', () => {
      const stackTrace = 'Error: Test\n    at Test.fn (test.ts:1:1)';

      logger.error('Error occurred', stackTrace);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: stackTrace,
        }),
      );
    });

    it('should not include stack when trace is undefined', () => {
      logger.info('Info message', undefined);

      const callArgs = logSpy.mock.calls[0][0];
      expect(callArgs.stack).toBeUndefined();
    });

    it('should handle trace with metadata', () => {
      logger.warn('Warning', 'trace-info', { extra: 'data' });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
          message: 'Warning',
          stack: 'trace-info',
          extra: 'data',
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 7: CONTEXT PROPAGATION TESTS
   * =========================================================================
   */
  describe('context propagation', () => {
    it('should include context in log', () => {
      const contextLogger = logger.setContext('AuthService');

      contextLogger.info('User logged in');

      const callArgs = logSpy.mock.calls[0][0];
      expect(callArgs.context).toBe('AuthService');
    });

    it('should preserve original logger context', () => {
      // Create new logger with context but verify original is unchanged
      void logger.setContext('NewContext');
      const originalLogSpy = jest.spyOn(logger['logger'], 'log');

      logger.info('Original');

      expect(originalLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          context: undefined,
        }),
      );
    });
  });
});
