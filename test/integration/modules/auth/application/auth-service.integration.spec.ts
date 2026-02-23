import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '@auth/application/services';
import { TokenRepositoryAdapter } from '@auth/infrastructure/adapters/out/token.repository.adapter';
import { RefreshTokenOrmEntity } from '@auth/infrastructure/persistence/entities/refresh-token.orm-entity';
import { UserService } from '@users/application/services';
import { UserRepositoryAdapter } from '@users/infrastructure/adapters/out/user.repository.adapter';
import { UserOrmEntity } from '@users/infrastructure/persistence/entities/user.orm-entity';
import { UserRole, Password } from '@users/domain';
import { INJECTION_TOKENS } from '@shared';
import { createMockLogger } from '../../../../mocks/logger.mock';
import { validRegisterData } from '../../../../fixtures/auth.fixture';

describe('AuthService (Integration)', () => {
  let authService: AuthService;
  let mockUserOrmRepo: jest.Mocked<Repository<UserOrmEntity>>;
  let mockTokenOrmRepo: jest.Mocked<Repository<RefreshTokenOrmEntity>>;
  let mockEmailService: any;

  const now = new Date();
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const createUserOrm = async (
    overrides: Partial<UserOrmEntity> = {},
  ): Promise<UserOrmEntity> => {
    const hashedPassword = await Password.create('ValidPass123!');
    const entity = new UserOrmEntity();
    entity.id = 'user-uuid-1';
    entity.email = 'test@example.com';
    entity.password = hashedPassword.getValue();
    entity.firstName = 'John';
    entity.lastName = 'Doe';
    entity.age = 25;
    entity.role = UserRole.USER;
    entity.isActive = true;
    entity.avatarUrl = null;
    entity.createdAt = now;
    entity.updatedAt = now;
    Object.assign(entity, overrides);
    return entity;
  };

  const createTokenOrm = (
    overrides: Partial<RefreshTokenOrmEntity> = {},
  ): RefreshTokenOrmEntity => {
    const entity = new RefreshTokenOrmEntity();
    entity.id = 'token-uuid-1';
    entity.token = 'stored-refresh-token';
    entity.userId = 'user-uuid-1';
    entity.expiresAt = futureDate;
    entity.isRevoked = false;
    entity.createdAt = now;
    entity.updatedAt = now;
    Object.assign(entity, overrides);
    return entity;
  };

  beforeEach(async () => {
    mockEmailService = {
      sendWelcomeEmail: jest
        .fn()
        .mockResolvedValue({ success: true, messageId: 'msg-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        UserRepositoryAdapter,
        TokenRepositoryAdapter,
        {
          provide: INJECTION_TOKENS.USER_REPOSITORY,
          useExisting: UserRepositoryAdapter,
        },
        {
          provide: INJECTION_TOKENS.TOKEN_REPOSITORY,
          useExisting: TokenRepositoryAdapter,
        },
        {
          provide: INJECTION_TOKENS.EMAIL,
          useValue: mockEmailService,
        },
        {
          provide: INJECTION_TOKENS.LOGGER,
          useValue: createMockLogger(),
        },
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, unknown> = {
                'jwt.accessSecret': 'test-access-secret',
                'jwt.refreshSecret': 'test-refresh-secret',
              };
              return config[key];
            }),
          },
        },
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RefreshTokenOrmEntity),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    mockUserOrmRepo = module.get(getRepositoryToken(UserOrmEntity));
    mockTokenOrmRepo = module.get(getRepositoryToken(RefreshTokenOrmEntity));
  });

  describe('register', () => {
    it('should create user, generate tokens, and persist refresh token', async () => {
      mockUserOrmRepo.findOne.mockResolvedValue(null); // findByEmail returns null
      mockUserOrmRepo.count.mockResolvedValue(0); // existsByEmail returns false
      mockUserOrmRepo.save.mockImplementation((entity: any) => {
        return Promise.resolve({
          ...entity,
          createdAt: now,
          updatedAt: now,
        } as UserOrmEntity);
      });
      mockTokenOrmRepo.save.mockImplementation((entity: any) => {
        return Promise.resolve({
          ...entity,
          createdAt: now,
          updatedAt: now,
        } as RefreshTokenOrmEntity);
      });

      const result = await authService.register({
        email: validRegisterData.email,
        password: validRegisterData.password,
        firstName: validRegisterData.firstName,
        lastName: validRegisterData.lastName,
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.userId).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');

      // Verify user was persisted
      expect(mockUserOrmRepo.save).toHaveBeenCalled();
      // Verify refresh token was persisted
      expect(mockTokenOrmRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = await createUserOrm({
        email: validRegisterData.email,
      });
      mockUserOrmRepo.findOne.mockResolvedValue(existingUser);

      await expect(
        authService.register({
          email: validRegisterData.email,
          password: validRegisterData.password,
          firstName: validRegisterData.firstName,
          lastName: validRegisterData.lastName,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user and generate tokens', async () => {
      const userOrm = await createUserOrm();
      mockUserOrmRepo.findOne.mockResolvedValue(userOrm);
      mockTokenOrmRepo.save.mockImplementation((entity: any) => {
        return Promise.resolve({
          ...entity,
          createdAt: now,
          updatedAt: now,
        } as RefreshTokenOrmEntity);
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockTokenOrmRepo.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      mockUserOrmRepo.findOne.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'ValidPass123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const userOrm = await createUserOrm();
      mockUserOrmRepo.findOne.mockResolvedValue(userOrm);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is disabled', async () => {
      const disabledUser = await createUserOrm({ isActive: false });
      mockUserOrmRepo.findOne.mockResolvedValue(disabledUser);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'ValidPass123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should find stored token, revoke old, and generate new tokens', async () => {
      const tokenOrm = createTokenOrm();
      mockTokenOrmRepo.findOne.mockResolvedValue(tokenOrm);
      mockTokenOrmRepo.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      mockTokenOrmRepo.save.mockImplementation((entity: any) => {
        return Promise.resolve({
          ...entity,
          createdAt: now,
          updatedAt: now,
        } as RefreshTokenOrmEntity);
      });

      const userOrm = await createUserOrm();
      mockUserOrmRepo.findOne.mockResolvedValue(userOrm);

      const result = await authService.refreshTokens('stored-refresh-token');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // Old token should be revoked
      expect(mockTokenOrmRepo.update).toHaveBeenCalledWith(
        { token: 'stored-refresh-token' },
        { isRevoked: true },
      );
      // New token should be saved
      expect(mockTokenOrmRepo.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockTokenOrmRepo.findOne.mockResolvedValue(null);

      await expect(authService.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for revoked refresh token', async () => {
      const revokedToken = createTokenOrm({ isRevoked: true });
      mockTokenOrmRepo.findOne.mockResolvedValue(revokedToken);

      await expect(
        authService.refreshTokens('stored-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const expiredToken = createTokenOrm({
        expiresAt: new Date(Date.now() - 1000),
      });
      mockTokenOrmRepo.findOne.mockResolvedValue(expiredToken);

      await expect(
        authService.refreshTokens('stored-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke the specific refresh token', async () => {
      mockTokenOrmRepo.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      await authService.logout('refresh-token-to-revoke');

      expect(mockTokenOrmRepo.update).toHaveBeenCalledWith(
        { token: 'refresh-token-to-revoke' },
        { isRevoked: true },
      );
    });
  });

  describe('logoutAll', () => {
    it('should revoke all tokens for the user', async () => {
      mockTokenOrmRepo.update.mockResolvedValue({
        affected: 3,
        raw: {},
        generatedMaps: [],
      });

      await authService.logoutAll('user-uuid-1');

      expect(mockTokenOrmRepo.update).toHaveBeenCalledWith(
        { userId: 'user-uuid-1' },
        { isRevoked: true },
      );
    });
  });
});
