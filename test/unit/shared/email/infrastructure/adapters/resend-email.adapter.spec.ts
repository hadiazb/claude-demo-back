/**
 * ============================================================================
 * UNIT TESTS: ResendEmailAdapter
 * ============================================================================
 *
 * Tests for the Resend email adapter that implements the EmailPort interface.
 * Uses mocked Resend SDK to test email sending functionality.
 */

import { ConfigService } from '@nestjs/config';
import { ResendEmailAdapter } from '@shared/email/infrastructure/adapters/resend-email.adapter';
import { LoggerPort } from '@shared/logging';

// Mock Resend SDK
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  };
});

describe('ResendEmailAdapter', () => {
  let adapter: ResendEmailAdapter;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockLogger: jest.Mocked<LoggerPort>;
  let mockResendSend: jest.Mock;

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

  const createMockConfigService = (
    overrides: Record<string, string | undefined> = {},
  ): jest.Mocked<ConfigService> => {
    const defaults: Record<string, string | undefined> = {
      'email.resendApiKey': 're_test_api_key',
      'email.fromEmail': 'test@example.com',
      'email.loginUrl': 'https://example.com/login',
      'app.appName': 'Test App',
    };

    const config = { ...defaults, ...overrides };

    return {
      get: jest
        .fn()
        .mockImplementation((key: string, defaultValue?: string) => {
          return config[key] ?? defaultValue;
        }),
    } as unknown as jest.Mocked<ConfigService>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = createMockLogger();
    mockConfigService = createMockConfigService();

    // Create adapter and get reference to mocked Resend send function
    adapter = new ResendEmailAdapter(mockConfigService, mockLogger);

    mockResendSend = (adapter as any).resend.emails.send;
  });

  /**
   * =========================================================================
   * SECTION 1: CONSTRUCTOR TESTS
   * =========================================================================
   */
  describe('constructor', () => {
    it('should create an instance successfully', () => {
      expect(adapter).toBeInstanceOf(ResendEmailAdapter);
    });

    it('should set logger context to ResendEmailAdapter', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('ResendEmailAdapter');
    });

    it('should throw error if RESEND_API_KEY is not configured', () => {
      const configWithoutKey = createMockConfigService({
        'email.resendApiKey': undefined,
      });

      expect(() => {
        new ResendEmailAdapter(configWithoutKey, mockLogger);
      }).toThrow('RESEND_API_KEY is not configured');
    });

    it('should use default fromEmail if not configured', () => {
      const configWithoutFrom = createMockConfigService({
        'email.fromEmail': undefined,
      });

      const adapterWithDefault = new ResendEmailAdapter(
        configWithoutFrom,
        mockLogger,
      );

      expect(adapterWithDefault).toBeInstanceOf(ResendEmailAdapter);
    });

    it('should use default appName if not configured', () => {
      const configWithoutAppName = createMockConfigService({
        'app.appName': undefined,
      });

      const adapterWithDefault = new ResendEmailAdapter(
        configWithoutAppName,
        mockLogger,
      );

      expect(adapterWithDefault).toBeInstanceOf(ResendEmailAdapter);
    });
  });

  /**
   * =========================================================================
   * SECTION 2: SEND METHOD TESTS
   * =========================================================================
   */
  describe('send', () => {
    const emailOptions = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>',
      text: 'Test content',
    };

    it('should send email successfully', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      const result = await adapter.send(emailOptions);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('email-123');
    });

    it('should call Resend API with correct parameters', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      await adapter.send(emailOptions);

      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text,
      });
    });

    it('should log debug message when sending', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      await adapter.send(emailOptions);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Sending email',
        undefined,
        expect.objectContaining({
          to: emailOptions.to,
          subject: emailOptions.subject,
        }),
      );
    });

    it('should log info message on success', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      await adapter.send(emailOptions);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Email sent successfully',
        undefined,
        expect.objectContaining({
          to: emailOptions.to,
          messageId: 'email-123',
        }),
      );
    });

    it('should return error result when Resend API returns error', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { name: 'validation_error', message: 'Invalid email' },
      });

      const result = await adapter.send(emailOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email');
    });

    it('should log error when Resend API returns error', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { name: 'validation_error', message: 'Invalid email' },
      });

      await adapter.send(emailOptions);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to send email',
        'Invalid email',
        expect.objectContaining({
          to: emailOptions.to,
          errorName: 'validation_error',
        }),
      );
    });

    it('should handle unexpected exceptions', async () => {
      mockResendSend.mockRejectedValue(new Error('Network error'));

      const result = await adapter.send(emailOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should log error for unexpected exceptions', async () => {
      mockResendSend.mockRejectedValue(new Error('Network error'));

      await adapter.send(emailOptions);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected error sending email',
        'Network error',
        expect.objectContaining({
          to: emailOptions.to,
        }),
      );
    });

    it('should handle non-Error exceptions', async () => {
      mockResendSend.mockRejectedValue('String error');

      const result = await adapter.send(emailOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should send email without text option', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      const optionsWithoutText = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      const result = await adapter.send(optionsWithoutText);

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: undefined,
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 3: SEND WELCOME EMAIL TESTS
   * =========================================================================
   */
  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'welcome-123' },
        error: null,
      });

      const result = await adapter.sendWelcomeEmail('user@example.com', 'Hugo');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('welcome-123');
    });

    it('should include personalized subject with firstName', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'welcome-123' },
        error: null,
      });

      await adapter.sendWelcomeEmail('user@example.com', 'Hugo');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Hugo'),
        }),
      );
    });

    it('should include app name in subject', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'welcome-123' },
        error: null,
      });

      await adapter.sendWelcomeEmail('user@example.com', 'Hugo');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Test App'),
        }),
      );
    });

    it('should send to correct recipient', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'welcome-123' },
        error: null,
      });

      await adapter.sendWelcomeEmail('user@example.com', 'Hugo');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
        }),
      );
    });

    it('should include HTML content', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'welcome-123' },
        error: null,
      });

      await adapter.sendWelcomeEmail('user@example.com', 'Hugo');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('<!DOCTYPE html>'),
        }),
      );
    });

    it('should include text content', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'welcome-123' },
        error: null,
      });

      await adapter.sendWelcomeEmail('user@example.com', 'Hugo');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Bienvenido'),
        }),
      );
    });

    it('should handle API errors', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { name: 'rate_limit', message: 'Too many requests' },
      });

      const result = await adapter.sendWelcomeEmail('user@example.com', 'Hugo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Too many requests');
    });

    it('should handle special characters in firstName', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'welcome-123' },
        error: null,
      });

      await adapter.sendWelcomeEmail('user@example.com', 'José María');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('José María'),
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 4: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle empty email address', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { name: 'validation_error', message: 'Invalid email' },
      });

      const result = await adapter.send({
        to: '',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
    });

    it('should handle very long subject', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      const longSubject = 'A'.repeat(1000);
      const result = await adapter.send({
        to: 'test@example.com',
        subject: longSubject,
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(true);
    });

    it('should handle very long HTML content', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      const longHtml = '<p>' + 'A'.repeat(100000) + '</p>';
      const result = await adapter.send({
        to: 'test@example.com',
        subject: 'Test',
        html: longHtml,
      });

      expect(result.success).toBe(true);
    });

    it('should handle null data in response', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await adapter.send({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      // When both data and error are null, it should be treated as success
      // but messageId will be undefined
      expect(result.success).toBe(true);
      expect(result.messageId).toBeUndefined();
    });
  });
});
