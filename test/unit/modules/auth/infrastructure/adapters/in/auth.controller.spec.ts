/**
 * ============================================================================
 * UNIT TESTS: AuthController
 * ============================================================================
 *
 * This file contains unit tests for the AuthController.
 *
 * WHAT IS AuthController?
 * A REST controller handling authentication HTTP endpoints:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login with credentials
 * - POST /auth/refresh - Refresh access token
 * - POST /auth/logout - Logout from current session
 * - POST /auth/logout-all - Logout from all sessions
 *
 * TESTING APPROACH:
 * Mock AuthService and verify:
 * - Controller methods call service correctly
 * - Responses are transformed to DTOs
 * - Correct data is passed between layers
 */

import { AuthController } from '@auth/infrastructure/adapters/in/auth.controller';
import { AuthService } from '@auth/application/services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  // Helper to create mock AuthService
  const createMockAuthService = (): jest.Mocked<AuthService> => {
    return {
      login: jest.fn(),
      register: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
      logoutAll: jest.fn(),
      validateAccessToken: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
  };

  beforeEach(() => {
    mockAuthService = createMockAuthService();
    controller = new AuthController(mockAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 1: REGISTER TESTS
   * =========================================================================
   */
  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('should register user and return auth response', async () => {
      mockAuthService.register.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        userId: 'new-user-id',
      });

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('userId', 'new-user-id');
    });

    it('should call authService.register with dto', async () => {
      mockAuthService.register.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'token',
        userId: 'id',
      });

      await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return AuthResponseDto', async () => {
      mockAuthService.register.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        userId: 'user-id',
      });

      const result = await controller.register(registerDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.userId).toBeDefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 2: LOGIN TESTS
   * =========================================================================
   */
  describe('login', () => {
    const loginDto = {
      email: 'user@example.com',
      password: 'password123',
    };

    it('should login and return tokens', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
    });

    it('should call authService.login with dto', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'token',
      });

      await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should not return userId for login', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await controller.login(loginDto);

      expect(result.userId).toBeUndefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 3: REFRESH TESTS
   * =========================================================================
   */
  describe('refresh', () => {
    const refreshTokenDto = {
      refreshToken: 'current-refresh-token',
    };

    it('should refresh and return new tokens', async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('should call authService.refreshTokens with token', async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'token',
      });

      await controller.refresh(refreshTokenDto);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'current-refresh-token',
      );
    });

    it('should return AuthResponseDto', async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await controller.refresh(refreshTokenDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 4: LOGOUT TESTS
   * =========================================================================
   */
  describe('logout', () => {
    const refreshTokenDto = {
      refreshToken: 'token-to-revoke',
    };

    it('should logout and return void', async () => {
      mockAuthService.logout.mockResolvedValue();

      const result = await controller.logout(refreshTokenDto);

      expect(result).toBeUndefined();
    });

    it('should call authService.logout with token', async () => {
      mockAuthService.logout.mockResolvedValue();

      await controller.logout(refreshTokenDto);

      expect(mockAuthService.logout).toHaveBeenCalledWith('token-to-revoke');
    });
  });

  /**
   * =========================================================================
   * SECTION 5: LOGOUT ALL TESTS
   * =========================================================================
   */
  describe('logoutAll', () => {
    it('should logout all and return void', async () => {
      mockAuthService.logoutAll.mockResolvedValue();

      const result = await controller.logoutAll('user-123');

      expect(result).toBeUndefined();
    });

    it('should call authService.logoutAll with userId', async () => {
      mockAuthService.logoutAll.mockResolvedValue();

      await controller.logoutAll('user-123');

      expect(mockAuthService.logoutAll).toHaveBeenCalledWith('user-123');
    });
  });

  /**
   * =========================================================================
   * SECTION 6: ERROR PROPAGATION TESTS
   * =========================================================================
   */
  describe('error propagation', () => {
    it('should propagate service errors in register', async () => {
      mockAuthService.register.mockRejectedValue(
        new Error('Registration failed'),
      );

      await expect(
        controller.register({
          email: 'test@example.com',
          password: 'pass',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow('Registration failed');
    });

    it('should propagate service errors in login', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        controller.login({ email: 'test@example.com', password: 'pass' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should propagate service errors in refresh', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(
        new Error('Token expired'),
      );

      await expect(
        controller.refresh({ refreshToken: 'expired' }),
      ).rejects.toThrow('Token expired');
    });

    it('should propagate service errors in logout', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      await expect(
        controller.logout({ refreshToken: 'token' }),
      ).rejects.toThrow('Logout failed');
    });

    it('should propagate service errors in logoutAll', async () => {
      mockAuthService.logoutAll.mockRejectedValue(
        new Error('Logout all failed'),
      );

      await expect(controller.logoutAll('user-123')).rejects.toThrow(
        'Logout all failed',
      );
    });
  });
});
