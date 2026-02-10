import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookSecretGuard } from '@strapi/infrastructure/guards/webhook-secret.guard';
import { LoggerPort } from '@shared/logging/domain/ports';

describe('WebhookSecretGuard', () => {
  let guard: WebhookSecretGuard;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockLogger: jest.Mocked<LoggerPort>;

  const createMockExecutionContext = (
    headers: Record<string, string> = {},
  ): jest.Mocked<ExecutionContext> =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers }),
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    }) as jest.Mocked<ExecutionContext>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockLogger = {
      setContext: jest.fn().mockReturnThis(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      http: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as jest.Mocked<LoggerPort>;

    guard = new WebhookSecretGuard(mockConfigService, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance of WebhookSecretGuard', () => {
      expect(guard).toBeInstanceOf(WebhookSecretGuard);
    });

    it('should implement CanActivate interface', () => {
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should set logger context', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('WebhookSecretGuard');
    });
  });

  describe('when secret is valid', () => {
    it('should return true when header matches configured secret', () => {
      mockConfigService.get.mockReturnValue('my-secret');
      const context = createMockExecutionContext({
        'x-webhook-secret': 'my-secret',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should read secret from strapi.webhookSecret config', () => {
      mockConfigService.get.mockReturnValue('test-secret');
      const context = createMockExecutionContext({
        'x-webhook-secret': 'test-secret',
      });

      guard.canActivate(context);

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'strapi.webhookSecret',
      );
    });
  });

  describe('when secret is invalid', () => {
    it('should throw UnauthorizedException when header secret does not match', () => {
      mockConfigService.get.mockReturnValue('correct-secret');
      const context = createMockExecutionContext({
        'x-webhook-secret': 'wrong-secret',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with descriptive message', () => {
      mockConfigService.get.mockReturnValue('correct-secret');
      const context = createMockExecutionContext({
        'x-webhook-secret': 'wrong-secret',
      });

      expect(() => guard.canActivate(context)).toThrow(
        'Invalid or missing webhook secret',
      );
    });

    it('should log warning on failed authentication', () => {
      mockConfigService.get.mockReturnValue('correct-secret');
      const context = createMockExecutionContext({
        'x-webhook-secret': 'wrong-secret',
      });

      try {
        guard.canActivate(context);
      } catch {
        // expected
      }

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Webhook authentication failed: invalid or missing secret',
      );
    });
  });

  describe('when secret header is missing', () => {
    it('should throw UnauthorizedException when header is not present', () => {
      mockConfigService.get.mockReturnValue('my-secret');
      const context = createMockExecutionContext({});

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when header is empty string', () => {
      mockConfigService.get.mockReturnValue('my-secret');
      const context = createMockExecutionContext({
        'x-webhook-secret': '',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should log warning when header is missing', () => {
      mockConfigService.get.mockReturnValue('my-secret');
      const context = createMockExecutionContext({});

      try {
        guard.canActivate(context);
      } catch {
        // expected
      }

      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
