/**
 * ============================================================================
 * UNIT TESTS: JwtRefreshStrategy
 * ============================================================================
 *
 * This file contains unit tests for the JwtRefreshStrategy.
 *
 * WHAT IS JwtRefreshStrategy?
 * JwtRefreshStrategy is a Passport strategy that validates JWT refresh tokens.
 * It's used by JwtRefreshGuard to authenticate token refresh requests.
 *
 * DIFFERENCES FROM JwtStrategy:
 * - Extracts token from request body (not Authorization header)
 * - Uses refresh secret (not access secret)
 * - Returns the refresh token along with user info
 * - Does NOT verify user existence (handled by auth service)
 *
 * WHAT ARE WE TESTING?
 * 1. Constructor: Configuration and error handling
 * 2. validate(): Payload extraction and return value
 */

import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtRefreshStrategy } from '@auth/infrastructure/strategies/jwt-refresh.strategy';
import { UserRole } from '@users/domain/entities/user.entity';

describe('JwtRefreshStrategy', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST SETUP AND MOCKS
   * =========================================================================
   */

  let strategy: JwtRefreshStrategy;
  let mockConfigService: jest.Mocked<ConfigService>;

  // Helper to create mock ConfigService
  const createMockConfigService = (
    refreshSecret: string | undefined = 'test-refresh-secret',
  ): jest.Mocked<ConfigService> => {
    return {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'jwt.refreshSecret') return refreshSecret;
        return undefined;
      }),
      getOrThrow: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
  };

  // Helper to create mock Request with refresh token in body
  const createMockRequest = (
    refreshToken: string = 'mock-refresh-token',
  ): Request<unknown, unknown, { refreshToken: string }> => {
    return {
      body: { refreshToken },
    } as Request<unknown, unknown, { refreshToken: string }>;
  };

  beforeEach(() => {
    mockConfigService = createMockConfigService();
    strategy = new JwtRefreshStrategy(mockConfigService);
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
    it('should create an instance when JWT refresh secret is configured', () => {
      /**
       * TEST: Successful instantiation
       *
       * Strategy should be created when jwt.refreshSecret is available.
       */
      expect(strategy).toBeDefined();
      expect(strategy).toBeInstanceOf(JwtRefreshStrategy);
    });

    it('should read jwt.refreshSecret from config', () => {
      /**
       * TEST: Config access
       *
       * Constructor should request the refresh secret from ConfigService.
       */
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.refreshSecret');
    });

    it('should throw Error when JWT refresh secret is not configured', () => {
      /**
       * TEST: Missing secret error
       *
       * If jwt.refreshSecret is null, the strategy should fail
       * to instantiate with a clear error message.
       */
      const configWithoutSecret: jest.Mocked<ConfigService> = {
        get: jest.fn().mockReturnValue(null),
        getOrThrow: jest.fn(),
        set: jest.fn(),
      } as unknown as jest.Mocked<ConfigService>;

      expect(() => {
        new JwtRefreshStrategy(configWithoutSecret);
      }).toThrow('JWT refresh secret is not configured');
    });

    it('should throw Error when JWT refresh secret is empty string', () => {
      /**
       * TEST: Empty secret error
       *
       * Empty string should also trigger the error.
       */
      const configWithEmptySecret = createMockConfigService('');

      expect(() => {
        new JwtRefreshStrategy(configWithEmptySecret);
      }).toThrow('JWT refresh secret is not configured');
    });

    it('should use different secret than access token', () => {
      /**
       * TEST: Secret isolation
       *
       * Refresh strategy should use jwt.refreshSecret, not jwt.accessSecret.
       */
      const config = createMockConfigService('refresh-secret-value');
      new JwtRefreshStrategy(config);

      expect(config.get).toHaveBeenCalledWith('jwt.refreshSecret');
      expect(config.get).not.toHaveBeenCalledWith('jwt.accessSecret');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: VALIDATE METHOD - SUCCESS CASES
   * =========================================================================
   */
  describe('validate - success cases', () => {
    it('should return user info with refresh token', () => {
      /**
       * TEST: Successful validation
       *
       * When JWT is valid, validate() should return user info
       * along with the refresh token from the request body.
       */
      const mockRequest = createMockRequest('valid-refresh-token');
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        refreshToken: 'valid-refresh-token',
      });
    });

    it('should extract userId from payload.sub', () => {
      /**
       * TEST: Subject claim extraction
       *
       * The userId should come from the 'sub' claim in the JWT payload.
       */
      const mockRequest = createMockRequest();
      const payload = {
        sub: 'specific-user-id-456',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result.userId).toBe('specific-user-id-456');
    });

    it('should extract email from payload', () => {
      /**
       * TEST: Email extraction
       *
       * The email should come from the JWT payload.
       */
      const mockRequest = createMockRequest();
      const payload = {
        sub: 'user-123',
        email: 'specific@email.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result.email).toBe('specific@email.com');
    });

    it('should extract refresh token from request body', () => {
      /**
       * TEST: Token extraction from body
       *
       * Unlike JwtStrategy which uses Authorization header,
       * JwtRefreshStrategy extracts the token from req.body.refreshToken.
       */
      const mockRequest = createMockRequest('body-refresh-token-xyz');
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result.refreshToken).toBe('body-refresh-token-xyz');
    });

    it('should be a synchronous function', () => {
      /**
       * TEST: Synchronous nature
       *
       * Unlike JwtStrategy, JwtRefreshStrategy.validate() is synchronous
       * because it doesn't need to look up the user in the database.
       */
      const mockRequest = createMockRequest();
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      // Should return a plain object, not a Promise
      expect(result).not.toBeInstanceOf(Promise);
      expect(result).toHaveProperty('userId');
    });
  });

  /**
   * =========================================================================
   * SECTION 4: VALIDATE METHOD - DIFFERENT PAYLOADS
   * =========================================================================
   */
  describe('validate - different payloads', () => {
    it('should handle admin user payload', () => {
      /**
       * TEST: Admin payload
       *
       * Verify admin users are handled correctly.
       */
      const mockRequest = createMockRequest();
      const payload = {
        sub: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result.userId).toBe('admin-123');
      expect(result.email).toBe('admin@example.com');
    });

    it('should handle payload with additional claims', () => {
      /**
       * TEST: Extra claims in payload
       *
       * JWT payloads might have additional claims (iat, exp, etc.)
       * that should be ignored.
       */
      const mockRequest = createMockRequest();
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
        iat: 1234567890,
        exp: 1234567890 + 3600,
      } as { sub: string; email: string; role: UserRole };

      const result = strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        refreshToken: expect.any(String),
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 5: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle very long refresh token', () => {
      /**
       * TEST: Long token handling
       *
       * Refresh tokens can be quite long. Ensure they're handled correctly.
       */
      const longToken = 'a'.repeat(1000);
      const mockRequest = createMockRequest(longToken);
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result.refreshToken).toBe(longToken);
      expect(result.refreshToken.length).toBe(1000);
    });

    it('should handle UUID format user id', () => {
      /**
       * TEST: UUID user ID
       *
       * User IDs are typically UUIDs.
       */
      const mockRequest = createMockRequest();
      const payload = {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should handle email with special characters', () => {
      /**
       * TEST: Special email characters
       *
       * Emails can have various special characters.
       */
      const mockRequest = createMockRequest();
      const payload = {
        sub: 'user-123',
        email: 'user+tag@sub.domain.example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result.email).toBe('user+tag@sub.domain.example.com');
    });

    it('should not validate user existence', () => {
      /**
       * TEST: No user lookup
       *
       * Unlike JwtStrategy, JwtRefreshStrategy does NOT look up the user.
       * User validation is done by the auth service after refresh.
       */
      const mockRequest = createMockRequest();
      const payload = {
        sub: 'non-existent-user',
        email: 'ghost@example.com',
        role: UserRole.USER,
      };

      // This should NOT throw, even for non-existent users
      const result = strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        userId: 'non-existent-user',
        email: 'ghost@example.com',
        refreshToken: expect.any(String),
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 6: REAL-WORLD SCENARIOS
   * =========================================================================
   */
  describe('real-world scenarios', () => {
    it('should handle typical token refresh request', () => {
      /**
       * SCENARIO: Normal token refresh
       *
       * User's access token expired, they send refresh token to get new tokens.
       */
      const refreshToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.mock';
      const mockRequest = createMockRequest(refreshToken);
      const payload = {
        sub: 'user-abc123',
        email: 'john.doe@company.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        userId: 'user-abc123',
        email: 'john.doe@company.com',
        refreshToken: refreshToken,
      });
    });

    it('should handle admin token refresh', () => {
      /**
       * SCENARIO: Admin refreshing their token
       *
       * Admin users should have the same refresh flow.
       */
      const mockRequest = createMockRequest('admin-refresh-token');
      const payload = {
        sub: 'admin-xyz',
        email: 'admin@company.com',
        role: UserRole.ADMIN,
      };

      const result = strategy.validate(mockRequest, payload);

      expect(result.userId).toBe('admin-xyz');
      expect(result.email).toBe('admin@company.com');
    });

    it('should return data needed for refresh token validation', () => {
      /**
       * SCENARIO: Data for service layer
       *
       * The returned data should contain everything needed by
       * the auth service to validate and issue new tokens.
       */
      const mockRequest = createMockRequest('refresh-token-to-validate');
      const payload = {
        sub: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(mockRequest, payload);

      // Auth service needs:
      // 1. userId - to look up stored refresh tokens
      // 2. email - for new JWT payload
      // 3. refreshToken - to verify it matches stored token
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
