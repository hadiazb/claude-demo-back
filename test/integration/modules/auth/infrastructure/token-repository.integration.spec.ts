import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenRepositoryAdapter } from '@auth/infrastructure/adapters/out/token.repository.adapter';
import { RefreshTokenOrmEntity } from '@auth/infrastructure/persistence/entities/refresh-token.orm-entity';
import { RefreshToken } from '@auth/domain';

describe('TokenRepositoryAdapter (Integration)', () => {
  let adapter: TokenRepositoryAdapter;
  let mockOrmRepo: jest.Mocked<Repository<RefreshTokenOrmEntity>>;

  const now = new Date();
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const createOrmEntity = (
    overrides: Partial<RefreshTokenOrmEntity> = {},
  ): RefreshTokenOrmEntity => {
    const entity = new RefreshTokenOrmEntity();
    entity.id = 'token-uuid-1';
    entity.token = 'jwt-refresh-token-string';
    entity.userId = 'user-uuid-1';
    entity.expiresAt = futureDate;
    entity.isRevoked = false;
    entity.createdAt = now;
    entity.updatedAt = now;
    Object.assign(entity, overrides);
    return entity;
  };

  const createDomainToken = (
    overrides: Partial<RefreshToken> = {},
  ): RefreshToken => {
    return new RefreshToken({
      id: 'token-uuid-1',
      token: 'jwt-refresh-token-string',
      userId: 'user-uuid-1',
      expiresAt: futureDate,
      isRevoked: false,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRepositoryAdapter,
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

    adapter = module.get(TokenRepositoryAdapter);
    mockOrmRepo = module.get(getRepositoryToken(RefreshTokenOrmEntity));
  });

  describe('saveRefreshToken', () => {
    it('should map domain to ORM entity, persist, and return domain', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.save.mockResolvedValue(ormEntity);

      const domainToken = createDomainToken();
      const result = await adapter.saveRefreshToken(domainToken);

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result.id).toBe('token-uuid-1');
      expect(result.token).toBe('jwt-refresh-token-string');
      expect(result.userId).toBe('user-uuid-1');
      expect(result.isRevoked).toBe(false);
      expect(mockOrmRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'token-uuid-1',
          token: 'jwt-refresh-token-string',
          userId: 'user-uuid-1',
        }),
      );
    });
  });

  describe('findRefreshToken', () => {
    it('should find by token string and map to domain', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findRefreshToken('jwt-refresh-token-string');

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result!.token).toBe('jwt-refresh-token-string');
      expect(result!.isValid()).toBe(true);
      expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
        where: { token: 'jwt-refresh-token-string' },
      });
    });

    it('should return null when token not found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);

      const result = await adapter.findRefreshToken('nonexistent-token');

      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should update isRevoked to true for the given token', async () => {
      mockOrmRepo.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      await adapter.revokeRefreshToken('jwt-refresh-token-string');

      expect(mockOrmRepo.update).toHaveBeenCalledWith(
        { token: 'jwt-refresh-token-string' },
        { isRevoked: true },
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should update all tokens for the given userId', async () => {
      mockOrmRepo.update.mockResolvedValue({
        affected: 3,
        raw: {},
        generatedMaps: [],
      });

      await adapter.revokeAllUserTokens('user-uuid-1');

      expect(mockOrmRepo.update).toHaveBeenCalledWith(
        { userId: 'user-uuid-1' },
        { isRevoked: true },
      );
    });
  });

  describe('deleteExpiredTokens', () => {
    it('should delete tokens where expiresAt is less than now', async () => {
      mockOrmRepo.delete.mockResolvedValue({ affected: 5, raw: {} });

      await adapter.deleteExpiredTokens();

      expect(mockOrmRepo.delete).toHaveBeenCalledWith({
        expiresAt: expect.any(Object),
      });

      const deleteArg = mockOrmRepo.delete.mock.calls[0][0] as any;
      expect(deleteArg.expiresAt).toBeDefined();
    });
  });
});
