/**
 * Command object containing the credentials required for user authentication.
 * Used as input for the LoginUseCase.
 */
export interface LoginCommand {
  /** Email address of the user attempting to log in */
  email: string;
  /** Plain text password for authentication */
  password: string;
}

/**
 * Interface representing the authentication tokens returned after successful login.
 * Contains both access and refresh tokens for API authentication.
 */
export interface AuthTokens {
  /** JWT access token for authenticating API requests */
  accessToken: string;
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string;
}

/**
 * Input port interface for the Login use case.
 * Defines the contract for authenticating users in the system.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface LoginUseCase {
  /**
   * Executes the login use case.
   * Validates user credentials and generates authentication tokens.
   * @param command - Object containing the user's login credentials
   * @returns Promise resolving to AuthTokens containing access and refresh tokens
   */
  execute(command: LoginCommand): Promise<AuthTokens>;
}
