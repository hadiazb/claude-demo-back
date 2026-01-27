import { User } from '../../entities/user.entity';

/**
 * Input port interface for the Find User use case.
 * Defines the contract for querying users in the system.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface FindUserUseCase {
  /**
   * Finds a user by their unique identifier.
   * @param id - The unique identifier of the user to find
   * @returns Promise resolving to the User if found, or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their email address.
   * @param email - The email address to search for
   * @returns Promise resolving to the User if found, or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Retrieves all users from the system.
   * @returns Promise resolving to an array of all User entities
   */
  findAll(): Promise<User[]>;
}
