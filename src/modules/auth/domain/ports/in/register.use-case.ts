import { UserRole } from '../../../../users/domain/entities/user.entity';

/**
 * Command object containing the data required to register a new user.
 * Used as input for the RegisterUseCase.
 */
export interface RegisterCommand {
  /** Email address for the new user account. Must be unique */
  email: string;
  /** Plain text password that will be hashed before storage */
  password: string;
  /** First name of the new user */
  firstName: string;
  /** Last name of the new user */
  lastName: string;
  /** Age in years of the new user */
  age?: number;
  /** Optional role for the user. Defaults to USER if not specified */
  role?: UserRole;
  /** Optional URL to the user's avatar image */
  avatarUrl?: string;
}

/**
 * Interface representing the result of a successful registration.
 * Contains authentication tokens and the new user's identifier.
 */
export interface RegisterResult {
  /** JWT access token for authenticating API requests */
  accessToken: string;
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string;
  /** Unique identifier of the newly created user */
  userId: string;
}

/**
 * Input port interface for the Register use case.
 * Defines the contract for creating new user accounts in the system.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface RegisterUseCase {
  /**
   * Executes the register use case.
   * Creates a new user account and generates authentication tokens.
   * @param command - Object containing the new user's registration data
   * @returns Promise resolving to RegisterResult with tokens and user ID
   */
  execute(command: RegisterCommand): Promise<RegisterResult>;
}
