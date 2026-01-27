import { User, UserRole } from '../../entities/user.entity';

/**
 * Command object containing the data required to create a new user.
 * Used as input for the CreateUserUseCase.
 */
export interface CreateUserCommand {
  /** Email address for the new user. Must be unique */
  email: string;
  /** Plain text password that will be hashed before storage */
  password: string;
  /** First name of the new user */
  firstName: string;
  /** Last name of the new user */
  lastName: string;
  /** Age in years of the new user */
  age: number;
  /** Optional role for the user. Defaults to USER if not specified */
  role?: UserRole;
  /** Optional URL to the user's avatar image */
  avatarUrl?: string;
}

/**
 * Input port interface for the Create User use case.
 * Defines the contract for creating new users in the system.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface CreateUserUseCase {
  /**
   * Executes the create user use case.
   * Creates a new user with the provided data after validation.
   * @param command - Object containing the new user's data
   * @returns Promise resolving to the newly created User entity
   */
  execute(command: CreateUserCommand): Promise<User>;
}
