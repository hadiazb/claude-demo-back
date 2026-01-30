/**
 * ============================================================================
 * UNIT TESTS: JwtStrategy
 * ============================================================================
 *
 * This file contains unit tests for the JwtStrategy.
 *
 * WHAT IS JwtStrategy?
 * JwtStrategy is a Passport strategy that validates JWT access tokens.
 * It's used by JwtAuthGuard to authenticate requests to protected routes.
 *
 * RESPONSIBILITIES:
 * 1. Extract JWT from Authorization header (Bearer token)
 * 2. Verify token signature using the access secret
 * 3. Check token expiration
 * 4. Validate user exists and is active
 * 5. Return user info for the request context
 *
 * WHAT ARE WE TESTING?
 * 1. Constructor: Configuration and error handling
 * 2. validate(): User lookup and authorization logic
 */

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@auth/infrastructure/strategies/jwt.strategy';
import { UserService } from '@users/application/services';
import { User, UserRole } from '@users/domain/entities/user.entity';
import { Email } from '@users/domain/value-objects/email.vo';
import { Password } from '@users/domain/value-objects/password.vo';

describe('JwtStrategy', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST SETUP AND MOCKS
   * =========================================================================
   */

  let strategy: JwtStrategy;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockUserService: jest.Mocked<UserService>;

  // Helper to create mock ConfigService
  const createMockConfigService = (
    accessSecret: string | undefined = 'test-access-secret',
  ): jest.Mocked<ConfigService> => {
    return {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'jwt.accessSecret') return accessSecret;
        return undefined;
      }),
      getOrThrow: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
  };

  // Helper to create mock UserService
  const createMockUserService = (): jest.Mocked<UserService> => {
    return {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserService>;
  };

  // Helper to create a mock User domain entity
  const createMockUser = (
    overrides: Partial<{
      id: string;
      email: string;
      isActive: boolean;
      role: UserRole;
    }> = {},
  ): User => {
    const defaults = {
      id: 'user-123',
      email: 'test@example.com',
      isActive: true,
      role: UserRole.USER,
    };
    const merged = { ...defaults, ...overrides };

    return new User({
      id: merged.id,
      email: new Email(merged.email),
      password: Password.fromHash('$2b$10$hashedpassword'),
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      role: merged.role,
      isActive: merged.isActive,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    mockConfigService = createMockConfigService();
    mockUserService = createMockUserService();
    strategy = new JwtStrategy(mockConfigService, mockUserService);
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
    it('should create an instance when JWT secret is configured', () => {
      /**
       * TEST: Successful instantiation
       *
       * Strategy should be created when jwt.accessSecret is available.
       */
      expect(strategy).toBeDefined();
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });

    it('should read jwt.accessSecret from config', () => {
      /**
       * TEST: Config access
       *
       * Constructor should request the access secret from ConfigService.
       */
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.accessSecret');
    });

    it('should throw Error when JWT secret is not configured', () => {
      /**
       * TEST: Missing secret error
       *
       * If jwt.accessSecret is null, the strategy should fail
       * to instantiate with a clear error message.
       */
      const configWithoutSecret: jest.Mocked<ConfigService> = {
        get: jest.fn().mockReturnValue(null),
        getOrThrow: jest.fn(),
        set: jest.fn(),
      } as unknown as jest.Mocked<ConfigService>;

      expect(() => {
        new JwtStrategy(configWithoutSecret, mockUserService);
      }).toThrow('JWT access secret is not configured');
    });

    it('should throw Error when JWT secret is empty string', () => {
      /**
       * TEST: Empty secret error
       *
       * Empty string should also trigger the error.
       */
      const configWithEmptySecret = createMockConfigService('');

      expect(() => {
        new JwtStrategy(configWithEmptySecret, mockUserService);
      }).toThrow('JWT access secret is not configured');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: VALIDATE METHOD - SUCCESS CASES
   * =========================================================================
   */
  describe('validate - success cases', () => {
    it('should return user info when user exists and is active', async () => {
      /**
       * TEST: Successful validation
       *
       * When JWT is valid and user exists + is active,
       * validate() should return user info for the request.
       */
      const mockUser = createMockUser();
      mockUserService.findById.mockResolvedValue(mockUser);

      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      });
    });

    it('should call userService.findById with payload.sub', async () => {
      /**
       * TEST: User lookup
       *
       * The strategy should look up the user by the 'sub' claim
       * which contains the user ID.
       */
      const mockUser = createMockUser();
      mockUserService.findById.mockResolvedValue(mockUser);

      const payload = {
        sub: 'specific-user-id',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      await strategy.validate(payload);

      expect(mockUserService.findById).toHaveBeenCalledWith('specific-user-id');
      expect(mockUserService.findById).toHaveBeenCalledTimes(1);
    });

    it('should return admin role from payload', async () => {
      /**
       * TEST: Admin role validation
       *
       * Admin users should have their role correctly passed through.
       */
      const mockUser = createMockUser({ role: UserRole.ADMIN });
      mockUserService.findById.mockResolvedValue(mockUser);

      const payload = {
        sub: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const result = await strategy.validate(payload);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should return email from payload', async () => {
      /**
       * TEST: Email extraction
       *
       * Email should come from the JWT payload, not from the user lookup.
       */
      const mockUser = createMockUser();
      mockUserService.findById.mockResolvedValue(mockUser);

      const payload = {
        sub: 'user-123',
        email: 'payload@example.com', // Different from mock user
        role: UserRole.USER,
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('payload@example.com');
    });
  });

  /**
   * =========================================================================
   * SECTION 4: VALIDATE METHOD - FAILURE CASES
   * =========================================================================
   */
  describe('validate - failure cases', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      /**
       * TEST: User not found
       *
       * If the user ID in the JWT doesn't exist in the database,
       * the request should be rejected.
       */
      mockUserService.findById.mockResolvedValue(null);

      const payload = {
        sub: 'non-existent-user',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found or disabled',
      );
    });

    it('should throw UnauthorizedException when user is disabled', async () => {
      /**
       * TEST: Disabled user
       *
       * Even if the user exists, if isActive is false,
       * they should not be allowed access.
       */
      const disabledUser = createMockUser({ isActive: false });
      mockUserService.findById.mockResolvedValue(disabledUser);

      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found or disabled',
      );
    });

    it('should throw UnauthorizedException with correct message', async () => {
      /**
       * TEST: Error message verification
       *
       * The error message should be consistent and informative.
       */
      mockUserService.findById.mockResolvedValue(null);

      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      try {
        await strategy.validate(payload);
        fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).message).toBe(
          'User not found or disabled',
        );
      }
    });
  });

  /**
   * =========================================================================
   * SECTION 5: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle user lookup returning undefined', async () => {
      /**
       * TEST: Undefined user result
       *
       * Handle the case where findById returns undefined instead of null.
       */
      mockUserService.findById.mockResolvedValue(
        undefined as unknown as User | null,
      );

      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should be an async function', () => {
      /**
       * TEST: Async nature
       *
       * validate() should return a Promise for async user lookup.
       */
      const mockUser = createMockUser();
      mockUserService.findById.mockResolvedValue(mockUser);

      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = strategy.validate(payload);

      expect(result).toBeInstanceOf(Promise);
    });

    it('should propagate database errors', async () => {
      /**
       * TEST: Error propagation
       *
       * If the user lookup fails with a database error,
       * it should be propagated up.
       */
      mockUserService.findById.mockRejectedValue(new Error('Database error'));

      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        'Database error',
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 6: REAL-WORLD SCENARIOS
   * =========================================================================
   */
  describe('real-world scenarios', () => {
    it('should validate a typical user login token', async () => {
      /**
       * SCENARIO: Normal user accessing protected resource
       *
       * A regular user with a valid JWT accesses an API endpoint.
       */
      const mockUser = createMockUser({
        id: 'user-abc123',
        email: 'john.doe@company.com',
        isActive: true,
        role: UserRole.USER,
      });
      mockUserService.findById.mockResolvedValue(mockUser);

      const payload = {
        sub: 'user-abc123',
        email: 'john.doe@company.com',
        role: UserRole.USER,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-abc123',
        email: 'john.doe@company.com',
        role: UserRole.USER,
      });
    });

    it('should reject a deactivated admin user', async () => {
      /**
       * SCENARIO: Deactivated admin trying to access
       *
       * An admin whose account was deactivated tries to use
       * a previously valid token.
       */
      const deactivatedAdmin = createMockUser({
        id: 'admin-xyz',
        role: UserRole.ADMIN,
        isActive: false,
      });
      mockUserService.findById.mockResolvedValue(deactivatedAdmin);

      const payload = {
        sub: 'admin-xyz',
        email: 'admin@company.com',
        role: UserRole.ADMIN,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found or disabled',
      );
    });

    it('should reject token for deleted user', async () => {
      /**
       * SCENARIO: Deleted user's token
       *
       * A user who has been deleted from the system tries to
       * use their old token.
       */
      mockUserService.findById.mockResolvedValue(null);

      const payload = {
        sub: 'deleted-user-123',
        email: 'deleted@example.com',
        role: UserRole.USER,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
