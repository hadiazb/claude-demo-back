/**
 * ============================================================================
 * UNIT TESTS: AuthService
 * ============================================================================
 *
 * This file contains unit tests for the AuthService.
 *
 * WHAT IS AuthService?
 * An application service that handles authentication:
 * - User login with credential validation
 * - User registration
 * - Token refresh with rotation
 * - Logout (single and all sessions)
 * - Access token validation
 *
 * TESTING APPROACH:
 * Mock dependencies (UserService, JwtService, ConfigService, TokenRepository)
 * and verify authentication flows work correctly.
 */

import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@auth/application/services/auth.service';
import { UserService } from '@users/application/services/user.service';
import { TokenRepositoryPort } from '@auth/domain/ports/out/token.repository.port';
import { RefreshToken } from '@auth/domain/entities/refresh-token.entity';
import { User, UserRole } from '@users/domain/entities/user.entity';
import { Email } from '@users/domain/value-objects/email.vo';
import { Password } from '@users/domain/value-objects/password.vo';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: jest.Mocked<UserService>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockTokenRepository: jest.Mocked<TokenRepositoryPort>;

  // Helper to create mocks
  const createMocks = () => {
    mockUserService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'jwt.accessSecret') return 'access-secret';
        if (key === 'jwt.refreshSecret') return 'refresh-secret';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    mockTokenRepository = {
      saveRefreshToken: jest.fn().mockImplementation((token) => token),
      findRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
      deleteExpiredTokens: jest.fn(),
    };
  };

  // Helper to create a mock User
  const createMockUser = (
    overrides: Partial<{
      id: string;
      email: string;
      isActive: boolean;
      role: UserRole;
      passwordMatches: boolean;
    }> = {},
  ): User => {
    const user = new User({
      id: overrides.id || 'user-123',
      email: new Email(overrides.email || 'test@example.com'),
      password: Password.fromHash('$2b$10$hashedpassword'),
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      role: overrides.role || UserRole.USER,
      isActive: overrides.isActive ?? true,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Mock validatePassword
    jest
      .spyOn(user, 'validatePassword')
      .mockResolvedValue(overrides.passwordMatches ?? true);

    return user;
  };

  // Helper to create a mock RefreshToken
  const createMockRefreshToken = (
    overrides: Partial<{
      isRevoked: boolean;
      isExpired: boolean;
      userId: string;
    }> = {},
  ): RefreshToken => {
    const token = new RefreshToken({
      id: 'token-id',
      token: 'refresh-token-value',
      userId: overrides.userId || 'user-123',
      expiresAt: overrides.isExpired
        ? new Date(Date.now() - 1000)
        : new Date(Date.now() + 86400000),
      isRevoked: overrides.isRevoked ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return token;
  };

  beforeEach(() => {
    createMocks();
    service = new AuthService(
      mockUserService,
      mockJwtService,
      mockConfigService,
      mockTokenRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 1: LOGIN TESTS
   * =========================================================================
   */
  describe('login', () => {
    const loginCommand = { email: 'test@example.com', password: 'password123' };

    it('should return tokens on successful login', async () => {
      const user = createMockUser({ passwordMatches: true });
      mockUserService.findByEmail.mockResolvedValue(user);

      const result = await service.login(loginCommand);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginCommand)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginCommand)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const user = createMockUser({ passwordMatches: false });
      mockUserService.findByEmail.mockResolvedValue(user);

      await expect(service.login(loginCommand)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginCommand)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when user is disabled', async () => {
      const user = createMockUser({ isActive: false, passwordMatches: true });
      mockUserService.findByEmail.mockResolvedValue(user);

      await expect(service.login(loginCommand)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginCommand)).rejects.toThrow(
        'User account is disabled',
      );
    });

    it('should validate password with user entity', async () => {
      const user = createMockUser({ passwordMatches: true });
      mockUserService.findByEmail.mockResolvedValue(user);

      await service.login(loginCommand);

      expect(user.validatePassword).toHaveBeenCalledWith('password123');
    });

    it('should save refresh token to repository', async () => {
      const user = createMockUser({ passwordMatches: true });
      mockUserService.findByEmail.mockResolvedValue(user);

      await service.login(loginCommand);

      expect(mockTokenRepository.saveRefreshToken).toHaveBeenCalled();
    });

    it('should generate tokens with correct payload', async () => {
      const user = createMockUser({
        id: 'user-id',
        email: 'user@example.com',
        role: UserRole.ADMIN,
        passwordMatches: true,
      });
      mockUserService.findByEmail.mockResolvedValue(user);

      await service.login(loginCommand);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-id',
          email: 'user@example.com',
          role: UserRole.ADMIN,
        }),
        expect.any(Object),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 2: REGISTER TESTS
   * =========================================================================
   */
  describe('register', () => {
    const registerCommand = {
      email: 'new@example.com',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('should register new user and return tokens with userId', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      const newUser = createMockUser({
        id: 'new-user-id',
        email: 'new@example.com',
      });
      mockUserService.createUser.mockResolvedValue(newUser);

      const result = await service.register(registerCommand);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('userId', 'new-user-id');
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = createMockUser({ email: 'new@example.com' });
      mockUserService.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerCommand)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerCommand)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should check email existence before creating user', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(createMockUser());

      await service.register(registerCommand);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'new@example.com',
      );
    });

    it('should create user with provided data', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(createMockUser());

      await service.register(registerCommand);

      expect(mockUserService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      );
    });

    it('should generate tokens for new user', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      const newUser = createMockUser({ id: 'new-id' });
      mockUserService.createUser.mockResolvedValue(newUser);

      await service.register(registerCommand);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2); // Access + Refresh
    });
  });

  /**
   * =========================================================================
   * SECTION 3: REFRESH TOKENS TESTS
   * =========================================================================
   */
  describe('refreshTokens', () => {
    it('should return new tokens on valid refresh', async () => {
      const refreshToken = createMockRefreshToken();
      mockTokenRepository.findRefreshToken.mockResolvedValue(refreshToken);
      const user = createMockUser({ id: 'user-123' });
      mockUserService.findById.mockResolvedValue(user);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when token not found', async () => {
      mockTokenRepository.findRefreshToken.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should throw UnauthorizedException when token is revoked', async () => {
      const revokedToken = createMockRefreshToken({ isRevoked: true });
      mockTokenRepository.findRefreshToken.mockResolvedValue(revokedToken);

      await expect(service.refreshTokens('revoked-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const expiredToken = createMockRefreshToken({ isExpired: true });
      mockTokenRepository.findRefreshToken.mockResolvedValue(expiredToken);

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const refreshToken = createMockRefreshToken();
      mockTokenRepository.findRefreshToken.mockResolvedValue(refreshToken);
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens('valid-token')).rejects.toThrow(
        'User not found or disabled',
      );
    });

    it('should throw UnauthorizedException when user is disabled', async () => {
      const refreshToken = createMockRefreshToken();
      mockTokenRepository.findRefreshToken.mockResolvedValue(refreshToken);
      const disabledUser = createMockUser({ isActive: false });
      mockUserService.findById.mockResolvedValue(disabledUser);

      await expect(service.refreshTokens('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should revoke old refresh token', async () => {
      const refreshToken = createMockRefreshToken();
      mockTokenRepository.findRefreshToken.mockResolvedValue(refreshToken);
      const user = createMockUser();
      mockUserService.findById.mockResolvedValue(user);

      await service.refreshTokens('old-refresh-token');

      expect(mockTokenRepository.revokeRefreshToken).toHaveBeenCalledWith(
        'old-refresh-token',
      );
    });

    it('should save new refresh token', async () => {
      const refreshToken = createMockRefreshToken();
      mockTokenRepository.findRefreshToken.mockResolvedValue(refreshToken);
      const user = createMockUser();
      mockUserService.findById.mockResolvedValue(user);

      await service.refreshTokens('valid-token');

      expect(mockTokenRepository.saveRefreshToken).toHaveBeenCalled();
    });
  });

  /**
   * =========================================================================
   * SECTION 4: LOGOUT TESTS
   * =========================================================================
   */
  describe('logout', () => {
    it('should revoke refresh token', async () => {
      await service.logout('refresh-token-to-revoke');

      expect(mockTokenRepository.revokeRefreshToken).toHaveBeenCalledWith(
        'refresh-token-to-revoke',
      );
    });

    it('should not throw when token does not exist', async () => {
      mockTokenRepository.revokeRefreshToken.mockResolvedValue();

      await expect(service.logout('non-existent-token')).resolves.not.toThrow();
    });
  });

  /**
   * =========================================================================
   * SECTION 5: LOGOUT ALL TESTS
   * =========================================================================
   */
  describe('logoutAll', () => {
    it('should revoke all user tokens', async () => {
      await service.logoutAll('user-123');

      expect(mockTokenRepository.revokeAllUserTokens).toHaveBeenCalledWith(
        'user-123',
      );
    });

    it('should not throw when user has no tokens', async () => {
      mockTokenRepository.revokeAllUserTokens.mockResolvedValue();

      await expect(
        service.logoutAll('user-without-tokens'),
      ).resolves.not.toThrow();
    });
  });

  /**
   * =========================================================================
   * SECTION 6: VALIDATE ACCESS TOKEN TESTS
   * =========================================================================
   */
  describe('validateAccessToken', () => {
    it('should return payload for valid token', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };
      mockJwtService.verify.mockReturnValue(payload);

      const result = service.validateAccessToken('valid-token');

      expect(result).toEqual(payload);
    });

    it('should return null for invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.validateAccessToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = service.validateAccessToken('expired-token');

      expect(result).toBeNull();
    });

    it('should use correct secret for verification', () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'user',
        email: 'test@example.com',
        role: 'user',
      });

      service.validateAccessToken('token');

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({ secret: 'access-secret' }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 7: TOKEN GENERATION TESTS
   * =========================================================================
   */
  describe('token generation', () => {
    it('should generate access token with 15 minute expiry', async () => {
      const user = createMockUser({ passwordMatches: true });
      mockUserService.findByEmail.mockResolvedValue(user);

      await service.login({ email: 'test@example.com', password: 'password' });

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: 900 }),
      );
    });

    it('should generate refresh token with 7 day expiry', async () => {
      const user = createMockUser({ passwordMatches: true });
      mockUserService.findByEmail.mockResolvedValue(user);

      await service.login({ email: 'test@example.com', password: 'password' });

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: 604800 }),
      );
    });
  });
});
