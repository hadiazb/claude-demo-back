import { AuthTokens } from './login.use-case';

/**
 * Input port interface for the Refresh Token use case.
 * Defines the contract for exchanging a refresh token for new authentication tokens.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface RefreshTokenUseCase {
  /**
   * Executes the refresh token use case.
   * Validates the provided refresh token and generates new access and refresh tokens.
   * @param refreshToken - The current refresh token to validate and exchange
   * @returns Promise resolving to new AuthTokens containing access and refresh tokens
   */
  execute(refreshToken: string): Promise<AuthTokens>;
}
