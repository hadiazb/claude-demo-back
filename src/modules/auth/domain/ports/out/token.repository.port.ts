import { RefreshToken } from '../../entities/refresh-token.entity';

/**
 * Output port interface for refresh token repository operations.
 * Defines the contract for token persistence in the Hexagonal Architecture.
 * Implemented by infrastructure adapters (e.g., TokenRepositoryAdapter).
 */
export interface TokenRepositoryPort {
  /**
   * Persists a new refresh token to the data store.
   * @param token - The RefreshToken domain entity to save
   * @returns Promise resolving to the saved RefreshToken entity
   */
  saveRefreshToken(token: RefreshToken): Promise<RefreshToken>;

  /**
   * Retrieves a refresh token by its token string.
   * @param token - The JWT refresh token string to search for
   * @returns Promise resolving to the RefreshToken if found, or null if not found
   */
  findRefreshToken(token: string): Promise<RefreshToken | null>;

  /**
   * Revokes a refresh token by marking it as invalid.
   * Prevents the token from being used for future authentication.
   * @param token - The JWT refresh token string to revoke
   * @returns Promise resolving when the token is revoked
   */
  revokeRefreshToken(token: string): Promise<void>;

  /**
   * Revokes all refresh tokens belonging to a specific user.
   * Used for logging out a user from all devices/sessions.
   * @param userId - The unique identifier of the user whose tokens to revoke
   * @returns Promise resolving when all tokens are revoked
   */
  revokeAllUserTokens(userId: string): Promise<void>;

  /**
   * Deletes all expired tokens from the data store.
   * Used for cleanup and maintenance operations.
   * @returns Promise resolving when expired tokens are deleted
   */
  deleteExpiredTokens(): Promise<void>;
}
