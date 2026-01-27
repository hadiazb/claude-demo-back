import { User } from '../../entities/user.entity';

/**
 * Command object containing the fields that can be updated for a user.
 * All properties are optional, allowing partial updates.
 */
export interface UpdateUserCommand {
  /** Updated first name for the user */
  firstName?: string;
  /** Updated last name for the user */
  lastName?: string;
  /** Updated age in years for the user */
  age?: number;
  /** Updated URL to the user's avatar image */
  avatarUrl?: string;
  /** Updated active status for the user account */
  isActive?: boolean;
}

/**
 * Input port interface for the Update User use case.
 * Defines the contract for updating an existing user in the system.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface UpdateUserUseCase {
  /**
   * Executes the update user use case.
   * Applies partial updates to an existing user based on the provided command.
   * @param id - The unique identifier of the user to update
   * @param command - Object containing the fields to update
   * @returns Promise resolving to the updated User entity
   */
  execute(id: string, command: UpdateUserCommand): Promise<User>;
}
