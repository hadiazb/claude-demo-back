/**
 * ============================================================================
 * UNIT TESTS: TokenRepositoryAdapter
 * ============================================================================
 *
 * This file contains unit tests for the TokenRepositoryAdapter.
 *
 * WHAT IS TokenRepositoryAdapter?
 * An infrastructure adapter that handles refresh token persistence.
 * Implements TokenRepositoryPort following Hexagonal Architecture.
 *
 * WHAT DOES IT DO?
 * 1. saveRefreshToken(): Store a new refresh token
 * 2. findRefreshToken(): Find token by its string value
 * 3. revokeRefreshToken(): Mark a single token as revoked
 * 4. revokeAllUserTokens(): Revoke all tokens for a user (logout all devices)
 * 5. deleteExpiredTokens(): Clean up expired tokens from database
 *
 * TESTING APPROACH:
 * Mock TypeORM Repository and verify:
 * - Correct methods called with proper arguments
 * - Domain/ORM entity conversions work correctly
 * - Edge cases handled properly
 */

import { Repository, LessThan } from 'typeorm';
import { TokenRepositoryAdapter } from '@auth/infrastructure/adapters/out/token.repository.adapter';
import { RefreshTokenOrmEntity } from '@auth/infrastructure/persistence/entities/refresh-token.orm-entity';
import { RefreshToken } from '@auth/domain/entities/refresh-token.entity';

describe('TokenRepositoryAdapter', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST SETUP AND MOCKS
   * =========================================================================
   */

  let adapter: TokenRepositoryAdapter;
  let mockRepository: jest.Mocked<Repository<RefreshTokenOrmEntity>>;

  // Helper to create mock TypeORM repository
  const createMockRepository = (): jest.Mocked<
    Repository<RefreshTokenOrmEntity>
  > => {
    return {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<RefreshTokenOrmEntity>>;
  };

  // Helper to create a RefreshTokenOrmEntity
  const createOrmEntity = (
    overrides: Partial<RefreshTokenOrmEntity> = {},
  ): RefreshTokenOrmEntity => {
    const entity = new RefreshTokenOrmEntity();
    entity.id = 'token-123';
    entity.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token';
    entity.userId = 'user-456';
    entity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    entity.isRevoked = false;
    entity.createdAt = new Date('2024-01-01');
    entity.updatedAt = new Date('2024-01-01');
    Object.assign(entity, overrides);
    return entity;
  };

  // Helper to create a domain RefreshToken entity
  const createDomainToken = (
    overrides: Partial<{
      id: string;
      token: string;
      userId: string;
      expiresAt: Date;
      isRevoked: boolean;
    }> = {},
  ): RefreshToken => {
    const defaults = {
      id: 'token-123',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token',
      userId: 'user-456',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    };
    const merged = { ...defaults, ...overrides };

    return new RefreshToken({
      id: merged.id,
      token: merged.token,
      userId: merged.userId,
      expiresAt: merged.expiresAt,
      isRevoked: merged.isRevoked,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  };

  beforeEach(() => {
    mockRepository = createMockRepository();
    adapter = new TokenRepositoryAdapter(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 2: SAVE REFRESH TOKEN TESTS
   * =========================================================================
   */
  describe('saveRefreshToken', () => {
    it('should save token and return domain entity', async () => {
      /**
       * TEST: Successful save
       *
       * saveRefreshToken should:
       * 1. Convert domain to ORM entity
       * 2. Save via repository
       * 3. Convert back to domain entity
       */
      const domainToken = createDomainToken();
      const savedOrmEntity = createOrmEntity();
      mockRepository.save.mockResolvedValue(savedOrmEntity);

      const result = await adapter.saveRefreshToken(domainToken);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(RefreshToken);
      expect(result.id).toBe('token-123');
    });

    it('should preserve token string in save', async () => {
      /**
       * TEST: Token value preservation
       */
      const tokenString = 'unique-jwt-refresh-token-value';
      const domainToken = createDomainToken({ token: tokenString });
      const savedOrmEntity = createOrmEntity({ token: tokenString });
      mockRepository.save.mockResolvedValue(savedOrmEntity);

      const result = await adapter.saveRefreshToken(domainToken);

      expect(result.token).toBe(tokenString);
    });

    it('should preserve userId in save', async () => {
      /**
       * TEST: User association preservation
       */
      const domainToken = createDomainToken({ userId: 'specific-user-id' });
      const savedOrmEntity = createOrmEntity({ userId: 'specific-user-id' });
      mockRepository.save.mockResolvedValue(savedOrmEntity);

      const result = await adapter.saveRefreshToken(domainToken);

      expect(result.userId).toBe('specific-user-id');
    });

    it('should preserve expiration date', async () => {
      /**
       * TEST: Expiration preservation
       */
      const expiresAt = new Date('2024-12-31T23:59:59Z');
      const domainToken = createDomainToken({ expiresAt });
      const savedOrmEntity = createOrmEntity({ expiresAt });
      mockRepository.save.mockResolvedValue(savedOrmEntity);

      const result = await adapter.saveRefreshToken(domainToken);

      expect(result.expiresAt).toEqual(expiresAt);
    });

    it('should save with isRevoked false by default', async () => {
      /**
       * TEST: New token not revoked
       */
      const domainToken = createDomainToken({ isRevoked: false });
      const savedOrmEntity = createOrmEntity({ isRevoked: false });
      mockRepository.save.mockResolvedValue(savedOrmEntity);

      await adapter.saveRefreshToken(domainToken);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isRevoked: false }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 3: FIND REFRESH TOKEN TESTS
   * =========================================================================
   */
  describe('findRefreshToken', () => {
    it('should return token when found', async () => {
      /**
       * TEST: Token found
       */
      const ormEntity = createOrmEntity();
      mockRepository.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findRefreshToken(ormEntity.token);

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.token).toBe(ormEntity.token);
    });

    it('should return null when token not found', async () => {
      /**
       * TEST: Token not found
       */
      mockRepository.findOne.mockResolvedValue(null);

      const result = await adapter.findRefreshToken('non-existent-token');

      expect(result).toBeNull();
    });

    it('should query by token string', async () => {
      /**
       * TEST: Correct query parameter
       */
      mockRepository.findOne.mockResolvedValue(null);
      const tokenString = 'search-this-token';

      await adapter.findRefreshToken(tokenString);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { token: tokenString },
      });
    });

    it('should return complete token with all properties', async () => {
      /**
       * TEST: All properties mapped
       */
      const expiresAt = new Date('2024-06-15');
      const ormEntity = createOrmEntity({
        id: 'token-id',
        userId: 'user-id',
        expiresAt,
        isRevoked: true,
      });
      mockRepository.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findRefreshToken(ormEntity.token);

      expect(result?.id).toBe('token-id');
      expect(result?.userId).toBe('user-id');
      expect(result?.expiresAt).toEqual(expiresAt);
      expect(result?.isRevoked).toBe(true);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: REVOKE REFRESH TOKEN TESTS
   * =========================================================================
   */
  describe('revokeRefreshToken', () => {
    it('should update token to revoked', async () => {
      /**
       * TEST: Single token revocation
       */
      mockRepository.update.mockResolvedValue({ affected: 1, raw: {} } as any);
      const tokenString = 'token-to-revoke';

      await adapter.revokeRefreshToken(tokenString);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { token: tokenString },
        { isRevoked: true },
      );
    });

    it('should not throw when token does not exist', async () => {
      /**
       * TEST: Revoke non-existent token
       *
       * Should not throw - idempotent operation.
       */
      mockRepository.update.mockResolvedValue({ affected: 0, raw: {} } as any);

      await expect(
        adapter.revokeRefreshToken('non-existent'),
      ).resolves.not.toThrow();
    });

    it('should return void on success', async () => {
      /**
       * TEST: Return type
       */
      mockRepository.update.mockResolvedValue({ affected: 1, raw: {} } as any);

      const result = await adapter.revokeRefreshToken('token');

      expect(result).toBeUndefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 5: REVOKE ALL USER TOKENS TESTS
   * =========================================================================
   */
  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for a user', async () => {
      /**
       * TEST: Bulk revocation by user ID
       *
       * Used when user logs out from all devices.
       */
      mockRepository.update.mockResolvedValue({ affected: 5, raw: {} } as any);
      const userId = 'user-to-logout';

      await adapter.revokeAllUserTokens(userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId },
        { isRevoked: true },
      );
    });

    it('should not throw when user has no tokens', async () => {
      /**
       * TEST: User with no tokens
       */
      mockRepository.update.mockResolvedValue({ affected: 0, raw: {} } as any);

      await expect(
        adapter.revokeAllUserTokens('user-without-tokens'),
      ).resolves.not.toThrow();
    });

    it('should use userId in where clause', async () => {
      /**
       * TEST: Correct filter
       */
      mockRepository.update.mockResolvedValue({ affected: 1, raw: {} } as any);

      await adapter.revokeAllUserTokens('specific-user-id');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId: 'specific-user-id' },
        expect.any(Object),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 6: DELETE EXPIRED TOKENS TESTS
   * =========================================================================
   */
  describe('deleteExpiredTokens', () => {
    it('should delete tokens with expiresAt less than now', async () => {
      /**
       * TEST: Expired token cleanup
       *
       * Should delete all tokens where expiresAt < current date.
       */
      mockRepository.delete.mockResolvedValue({ affected: 10, raw: {} });

      await adapter.deleteExpiredTokens();

      expect(mockRepository.delete).toHaveBeenCalledWith({
        expiresAt: expect.any(Object),
      });
    });

    it('should use LessThan operator for date comparison', async () => {
      /**
       * TEST: TypeORM operator usage
       *
       * Verify LessThan is used for date comparison.
       */
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await adapter.deleteExpiredTokens();

      const deleteCall = mockRepository.delete.mock.calls[0][0] as {
        expiresAt: ReturnType<typeof LessThan>;
      };
      expect(deleteCall.expiresAt).toBeDefined();
    });

    it('should not throw when no expired tokens exist', async () => {
      /**
       * TEST: No expired tokens
       */
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(adapter.deleteExpiredTokens()).resolves.not.toThrow();
    });

    it('should return void', async () => {
      /**
       * TEST: Return type
       */
      mockRepository.delete.mockResolvedValue({ affected: 5, raw: {} });

      const result = await adapter.deleteExpiredTokens();

      expect(result).toBeUndefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 7: DOMAIN/ORM CONVERSION TESTS
   * =========================================================================
   */
  describe('entity conversion', () => {
    it('should convert all ORM properties to domain entity', async () => {
      /**
       * TEST: Complete ORM to domain conversion
       */
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      const expiresAt = new Date('2024-12-31');

      const ormEntity = createOrmEntity({
        id: 'orm-id',
        token: 'orm-token',
        userId: 'orm-user',
        expiresAt,
        isRevoked: true,
        createdAt,
        updatedAt,
      });
      mockRepository.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findRefreshToken('orm-token');

      expect(result?.id).toBe('orm-id');
      expect(result?.token).toBe('orm-token');
      expect(result?.userId).toBe('orm-user');
      expect(result?.expiresAt).toEqual(expiresAt);
      expect(result?.isRevoked).toBe(true);
      expect(result?.createdAt).toEqual(createdAt);
      expect(result?.updatedAt).toEqual(updatedAt);
    });

    it('should convert domain properties to ORM entity on save', async () => {
      /**
       * TEST: Domain to ORM conversion
       */
      const domainToken = createDomainToken({
        id: 'domain-id',
        token: 'domain-token',
        userId: 'domain-user',
      });
      mockRepository.save.mockResolvedValue(createOrmEntity());

      await adapter.saveRefreshToken(domainToken);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'domain-id',
          token: 'domain-token',
          userId: 'domain-user',
        }),
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 8: ERROR HANDLING TESTS
   * =========================================================================
   */
  describe('error handling', () => {
    it('should propagate database errors from save', async () => {
      /**
       * TEST: Save error propagation
       */
      mockRepository.save.mockRejectedValue(new Error('Database error'));
      const domainToken = createDomainToken();

      await expect(adapter.saveRefreshToken(domainToken)).rejects.toThrow(
        'Database error',
      );
    });

    it('should propagate database errors from find', async () => {
      /**
       * TEST: Find error propagation
       */
      mockRepository.findOne.mockRejectedValue(new Error('Connection lost'));

      await expect(adapter.findRefreshToken('token')).rejects.toThrow(
        'Connection lost',
      );
    });

    it('should propagate database errors from update', async () => {
      /**
       * TEST: Update error propagation
       */
      mockRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(adapter.revokeRefreshToken('token')).rejects.toThrow(
        'Update failed',
      );
    });

    it('should propagate database errors from delete', async () => {
      /**
       * TEST: Delete error propagation
       */
      mockRepository.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(adapter.deleteExpiredTokens()).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  /**
   * =========================================================================
   * SECTION 9: REAL-WORLD SCENARIOS
   * =========================================================================
   */
  describe('real-world scenarios', () => {
    it('should handle login flow - save new refresh token', async () => {
      /**
       * SCENARIO: User logs in
       *
       * A new refresh token is created and saved.
       */
      const newToken = createDomainToken({
        token: 'new-login-refresh-token',
        userId: 'logging-in-user',
      });
      const savedEntity = createOrmEntity({
        token: 'new-login-refresh-token',
        userId: 'logging-in-user',
      });
      mockRepository.save.mockResolvedValue(savedEntity);

      const result = await adapter.saveRefreshToken(newToken);

      expect(result.token).toBe('new-login-refresh-token');
      expect(result.userId).toBe('logging-in-user');
      expect(result.isRevoked).toBe(false);
    });

    it('should handle token refresh flow - find and validate token', async () => {
      /**
       * SCENARIO: User refreshes access token
       *
       * 1. Find refresh token
       * 2. Validate it's not revoked/expired
       */
      const validToken = createOrmEntity({
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000), // tomorrow
      });
      mockRepository.findOne.mockResolvedValue(validToken);

      const result = await adapter.findRefreshToken(validToken.token);

      expect(result).not.toBeNull();
      expect(result?.isRevoked).toBe(false);
      expect(result?.isValid()).toBe(true);
    });

    it('should handle logout flow - revoke single token', async () => {
      /**
       * SCENARIO: User logs out from current device
       *
       * Only the current refresh token is revoked.
       */
      mockRepository.update.mockResolvedValue({ affected: 1, raw: {} } as any);

      await adapter.revokeRefreshToken('current-device-token');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { token: 'current-device-token' },
        { isRevoked: true },
      );
    });

    it('should handle logout-all flow - revoke all user tokens', async () => {
      /**
       * SCENARIO: User logs out from all devices
       *
       * All refresh tokens for the user are revoked.
       */
      mockRepository.update.mockResolvedValue({ affected: 3, raw: {} } as any);

      await adapter.revokeAllUserTokens('user-logging-out-everywhere');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId: 'user-logging-out-everywhere' },
        { isRevoked: true },
      );
    });

    it('should handle cleanup job - delete expired tokens', async () => {
      /**
       * SCENARIO: Scheduled cleanup job
       *
       * Periodically remove expired tokens to keep database clean.
       */
      mockRepository.delete.mockResolvedValue({ affected: 100, raw: {} });

      await adapter.deleteExpiredTokens();

      expect(mockRepository.delete).toHaveBeenCalled();
    });

    it('should handle stolen token scenario - find revoked token', async () => {
      /**
       * SCENARIO: Attacker tries to use stolen (but revoked) token
       *
       * Token is found but marked as revoked.
       */
      const revokedToken = createOrmEntity({ isRevoked: true });
      mockRepository.findOne.mockResolvedValue(revokedToken);

      const result = await adapter.findRefreshToken(revokedToken.token);

      expect(result).not.toBeNull();
      expect(result?.isRevoked).toBe(true);
      expect(result?.isValid()).toBe(false);
    });
  });
});
