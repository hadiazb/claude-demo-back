/**
 * ============================================================================
 * UNIT TESTS: RefreshToken Entity
 * ============================================================================
 *
 * This file contains unit tests for the RefreshToken domain entity.
 *
 * WHAT IS A REFRESH TOKEN?
 * A refresh token is a credential used to obtain new access tokens without
 * requiring the user to re-authenticate. It's part of the OAuth 2.0 / JWT
 * authentication flow and typically has a longer lifespan than access tokens.
 *
 * WHAT ARE WE TESTING?
 * 1. Constructor: That the entity is created correctly with all properties
 * 2. Inheritance: That it correctly inherits from BaseEntity
 * 3. isExpired() method: That it correctly determines if a token has expired
 * 4. isValid() method: That it correctly combines revocation and expiration checks
 *
 * BUSINESS RULES:
 * - A token is expired if the current date is past expiresAt
 * - A token is valid only if it's NOT revoked AND NOT expired
 * - Revoked tokens are never valid, even if not expired
 */

import {
  RefreshToken,
  RefreshTokenProps,
} from '@auth/domain/entities/refresh-token.entity';

describe('RefreshToken Entity', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST DATA SETUP (Test Fixtures)
   * =========================================================================
   */

  // Helper to create dates relative to now
  const createFutureDate = (hoursFromNow: number): Date => {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    return date;
  };

  const createPastDate = (hoursAgo: number): Date => {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    return date;
  };

  // Helper function to create valid RefreshTokenProps
  const createValidTokenProps = (
    overrides: Partial<RefreshTokenProps> = {},
  ): RefreshTokenProps => {
    return {
      id: 'token-123',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshtoken',
      userId: 'user-456',
      expiresAt: createFutureDate(24), // Expires in 24 hours
      isRevoked: false,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      ...overrides,
    };
  };

  /**
   * =========================================================================
   * SECTION 2: CONSTRUCTOR TESTS
   * =========================================================================
   */
  describe('constructor', () => {
    it('should create a RefreshToken instance with all provided properties', () => {
      /**
       * TEST: Create token with all properties
       *
       * Verifies that the constructor correctly assigns all properties
       * from the props object to the entity instance.
       */

      // Arrange
      const expiresAt = createFutureDate(24);
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-01T12:00:00Z');
      const props = createValidTokenProps({
        expiresAt,
        createdAt,
        updatedAt,
      });

      // Act
      const token = new RefreshToken(props);

      // Assert
      expect(token).toBeInstanceOf(RefreshToken);
      expect(token.id).toBe('token-123');
      expect(token.token).toBe(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshtoken',
      );
      expect(token.userId).toBe('user-456');
      expect(token.expiresAt).toEqual(expiresAt);
      expect(token.isRevoked).toBe(false);
    });

    it('should inherit id, createdAt, and updatedAt from BaseEntity', () => {
      /**
       * TEST: Verify BaseEntity inheritance
       *
       * RefreshToken extends BaseEntity which provides common fields
       * for all domain entities.
       */

      // Arrange
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-15T15:30:00Z');
      const props = createValidTokenProps({ createdAt, updatedAt });

      // Act
      const token = new RefreshToken(props);

      // Assert
      expect(token.id).toBe('token-123');
      expect(token.createdAt).toEqual(createdAt);
      expect(token.updatedAt).toEqual(updatedAt);
    });

    it('should use default dates when createdAt and updatedAt are not provided', () => {
      /**
       * TEST: Default dates from BaseEntity
       *
       * When dates are not provided, BaseEntity assigns current date.
       */

      // Arrange
      const props = createValidTokenProps();
      delete props.createdAt;
      delete props.updatedAt;
      const beforeCreation = new Date();

      // Act
      const token = new RefreshToken(props);
      const afterCreation = new Date();

      // Assert
      expect(token.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(token.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });

    it('should create a revoked token', () => {
      /**
       * TEST: Create token with isRevoked = true
       *
       * Tokens can be created in a revoked state, for example
       * when restoring from database where the token was revoked.
       */

      // Arrange
      const props = createValidTokenProps({ isRevoked: true });

      // Act
      const token = new RefreshToken(props);

      // Assert
      expect(token.isRevoked).toBe(true);
    });

    it('should store the complete JWT token string', () => {
      /**
       * TEST: Token string storage
       *
       * The token field stores the actual JWT string which can be
       * quite long. Verify it's stored completely without truncation.
       */

      // Arrange
      const longToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
        'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const props = createValidTokenProps({ token: longToken });

      // Act
      const refreshToken = new RefreshToken(props);

      // Assert
      expect(refreshToken.token).toBe(longToken);
      expect(refreshToken.token.length).toBe(longToken.length);
    });
  });

  /**
   * =========================================================================
   * SECTION 3: isExpired() METHOD TESTS
   * =========================================================================
   *
   * This method checks if the token's expiration date has passed.
   * It's crucial for security - expired tokens must not be accepted.
   */
  describe('isExpired', () => {
    it('should return false for a token that expires in the future', () => {
      /**
       * TEST: Non-expired token
       *
       * A token with expiresAt in the future should not be expired.
       * This is the normal state for a valid, usable token.
       */

      // Arrange
      const props = createValidTokenProps({
        expiresAt: createFutureDate(24), // 24 hours from now
      });
      const token = new RefreshToken(props);

      // Act
      const expired = token.isExpired();

      // Assert
      expect(expired).toBe(false);
    });

    it('should return true for a token that expired in the past', () => {
      /**
       * TEST: Expired token
       *
       * A token with expiresAt in the past should be expired.
       * These tokens must be rejected during authentication.
       */

      // Arrange
      const props = createValidTokenProps({
        expiresAt: createPastDate(1), // 1 hour ago
      });
      const token = new RefreshToken(props);

      // Act
      const expired = token.isExpired();

      // Assert
      expect(expired).toBe(true);
    });

    it('should return true for a token that expired long ago', () => {
      /**
       * TEST: Token expired days ago
       *
       * Verify the method works correctly for tokens that
       * expired a significant time in the past.
       */

      // Arrange
      const props = createValidTokenProps({
        expiresAt: createPastDate(24 * 30), // 30 days ago
      });
      const token = new RefreshToken(props);

      // Act
      const expired = token.isExpired();

      // Assert
      expect(expired).toBe(true);
    });

    it('should return false for a token expiring far in the future', () => {
      /**
       * TEST: Token with long expiration
       *
       * Some refresh tokens may have long validity periods (e.g., 30 days).
       * Verify the method handles these correctly.
       */

      // Arrange
      const props = createValidTokenProps({
        expiresAt: createFutureDate(24 * 30), // 30 days from now
      });
      const token = new RefreshToken(props);

      // Act
      const expired = token.isExpired();

      // Assert
      expect(expired).toBe(false);
    });

    it('should handle edge case of token expiring exactly now', () => {
      /**
       * TEST: Token expiring at current moment
       *
       * Edge case: What happens when expiresAt equals current time?
       * The comparison is ">" so a token expiring exactly now is NOT expired.
       *
       * Note: This test might be flaky due to timing, so we test
       * the boundary condition by checking a token that just expired.
       */

      // Arrange - Create token that expires 1 millisecond in the past
      const justExpired = new Date(Date.now() - 1);
      const props = createValidTokenProps({ expiresAt: justExpired });
      const token = new RefreshToken(props);

      // Act
      const expired = token.isExpired();

      // Assert
      expect(expired).toBe(true);
    });

    it('should return consistent results on multiple calls', () => {
      /**
       * TEST: Consistency of isExpired
       *
       * The method should return the same result when called multiple
       * times in quick succession (assuming the token hasn't expired
       * between calls).
       */

      // Arrange
      const props = createValidTokenProps({
        expiresAt: createFutureDate(24),
      });
      const token = new RefreshToken(props);

      // Act
      const result1 = token.isExpired();
      const result2 = token.isExpired();
      const result3 = token.isExpired();

      // Assert
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe(false);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: isValid() METHOD TESTS
   * =========================================================================
   *
   * This method combines two checks:
   * 1. Token must NOT be revoked
   * 2. Token must NOT be expired
   *
   * A token is valid ONLY if both conditions are satisfied.
   * This is the primary method used during authentication.
   */
  describe('isValid', () => {
    it('should return true for non-revoked and non-expired token', () => {
      /**
       * TEST: Valid token (happy path)
       *
       * A token that is neither revoked nor expired is valid.
       * This is the expected state for tokens in active use.
       */

      // Arrange
      const props = createValidTokenProps({
        isRevoked: false,
        expiresAt: createFutureDate(24),
      });
      const token = new RefreshToken(props);

      // Act
      const valid = token.isValid();

      // Assert
      expect(valid).toBe(true);
    });

    it('should return false for revoked token even if not expired', () => {
      /**
       * TEST: Revoked but not expired
       *
       * SECURITY CRITICAL: A revoked token must NEVER be considered valid,
       * even if its expiration date hasn't passed.
       *
       * Use case: User logs out - their token is revoked but may not
       * be expired yet. We must reject it.
       */

      // Arrange
      const props = createValidTokenProps({
        isRevoked: true,
        expiresAt: createFutureDate(24), // Still has 24 hours left
      });
      const token = new RefreshToken(props);

      // Act
      const valid = token.isValid();

      // Assert
      expect(valid).toBe(false);
    });

    it('should return false for expired token even if not revoked', () => {
      /**
       * TEST: Expired but not revoked
       *
       * An expired token is invalid regardless of revocation status.
       * This is the natural lifecycle end of a token.
       */

      // Arrange
      const props = createValidTokenProps({
        isRevoked: false,
        expiresAt: createPastDate(1), // Expired 1 hour ago
      });
      const token = new RefreshToken(props);

      // Act
      const valid = token.isValid();

      // Assert
      expect(valid).toBe(false);
    });

    it('should return false for token that is both revoked AND expired', () => {
      /**
       * TEST: Both revoked and expired
       *
       * A token can be both revoked and expired (e.g., user logged out
       * and then the token also expired). It should definitely be invalid.
       */

      // Arrange
      const props = createValidTokenProps({
        isRevoked: true,
        expiresAt: createPastDate(24), // Expired 24 hours ago
      });
      const token = new RefreshToken(props);

      // Act
      const valid = token.isValid();

      // Assert
      expect(valid).toBe(false);
    });

    it('should correctly combine isRevoked and isExpired checks', () => {
      /**
       * TEST: Verify isValid uses both checks
       *
       * This test verifies that isValid() correctly implements
       * the business rule: valid = !isRevoked && !isExpired()
       */

      // Arrange - Create tokens for all combinations
      const validToken = new RefreshToken(
        createValidTokenProps({
          isRevoked: false,
          expiresAt: createFutureDate(24),
        }),
      );

      const revokedOnly = new RefreshToken(
        createValidTokenProps({
          isRevoked: true,
          expiresAt: createFutureDate(24),
        }),
      );

      const expiredOnly = new RefreshToken(
        createValidTokenProps({
          isRevoked: false,
          expiresAt: createPastDate(1),
        }),
      );

      const bothInvalid = new RefreshToken(
        createValidTokenProps({
          isRevoked: true,
          expiresAt: createPastDate(1),
        }),
      );

      // Act & Assert - Truth table for isValid
      expect(validToken.isValid()).toBe(true); // !false && !false = true
      expect(revokedOnly.isValid()).toBe(false); // !true && !false = false
      expect(expiredOnly.isValid()).toBe(false); // !false && !true = false
      expect(bothInvalid.isValid()).toBe(false); // !true && !true = false
    });
  });

  /**
   * =========================================================================
   * SECTION 5: IMMUTABILITY TESTS
   * =========================================================================
   */
  describe('immutability', () => {
    it('should have readonly properties', () => {
      /**
       * TEST: Properties are readonly
       *
       * RefreshToken properties should not be modifiable after creation.
       * This ensures token integrity and prevents accidental mutations.
       */

      // Arrange
      const props = createValidTokenProps();
      const token = new RefreshToken(props);

      // Assert - All properties exist and are defined
      expect(token.id).toBeDefined();
      expect(token.token).toBeDefined();
      expect(token.userId).toBeDefined();
      expect(token.expiresAt).toBeDefined();
      expect(token.isRevoked).toBeDefined();
      expect(token.createdAt).toBeDefined();
      expect(token.updatedAt).toBeDefined();

      // TypeScript prevents: token.isRevoked = true;
      // This would cause a compilation error
    });
  });

  /**
   * =========================================================================
   * SECTION 6: EDGE CASES AND SECURITY TESTS
   * =========================================================================
   */
  describe('edge cases and security', () => {
    it('should handle token with very long userId', () => {
      /**
       * TEST: Long userId handling
       *
       * UUIDs are typically 36 characters, but verify the entity
       * handles longer IDs without issues.
       */

      // Arrange
      const longUserId = 'user-' + 'a'.repeat(100);
      const props = createValidTokenProps({ userId: longUserId });

      // Act
      const token = new RefreshToken(props);

      // Assert
      expect(token.userId).toBe(longUserId);
    });

    it('should handle expiresAt with timezone information', () => {
      /**
       * TEST: Timezone handling
       *
       * Dates should work correctly regardless of timezone.
       * JavaScript Date objects handle this internally.
       */

      // Arrange
      const expiresAt = new Date('2025-06-15T10:30:00+05:00'); // UTC+5 timezone
      const props = createValidTokenProps({ expiresAt });

      // Act
      const token = new RefreshToken(props);

      // Assert
      expect(token.expiresAt).toEqual(expiresAt);
    });

    it('should reference the same Date object as props (no defensive copy)', () => {
      /**
       * TEST: Date reference behavior
       *
       * Documents that the entity stores a reference to the Date object,
       * not a copy. This is standard JavaScript behavior.
       *
       * IMPORTANT: In production code, callers should not mutate dates
       * after passing them to the entity. TypeScript's readonly modifier
       * helps prevent this at compile time.
       */

      // Arrange
      const originalDate = new Date('2025-01-01T00:00:00Z');
      const props = createValidTokenProps({ expiresAt: originalDate });
      const token = new RefreshToken(props);

      // Assert - Token references the same Date object
      expect(token.expiresAt).toBe(originalDate);

      // This documents that mutation of original affects the entity
      // (This is expected JavaScript behavior for object references)
      const timeBefore = token.expiresAt.getTime();
      originalDate.setFullYear(2000);
      const timeAfter = token.expiresAt.getTime();

      // Times are different because they reference the same object
      expect(timeBefore).not.toBe(timeAfter);
    });
  });
});
