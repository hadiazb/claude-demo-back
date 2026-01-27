import { User } from '../../entities/user.entity';

/**
 * Output port interface for User repository operations.
 * Defines the contract for persistence operations in the Hexagonal Architecture.
 * Implemented by infrastructure adapters (e.g., UserRepositoryAdapter).
 */
export interface UserRepositoryPort {
  /**
   * Persists a new user to the data store.
   * @param user - The User domain entity to save
   * @returns Promise resolving to the saved User entity
   */
  save(user: User): Promise<User>;

  /**
   * Retrieves a user by their unique identifier.
   * @param id - The unique identifier of the user
   * @returns Promise resolving to the User if found, or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Retrieves a user by their email address.
   * @param email - The email address to search for
   * @returns Promise resolving to the User if found, or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Retrieves all users from the data store.
   * @returns Promise resolving to an array of all User entities
   */
  findAll(): Promise<User[]>;

  /**
   * Updates an existing user in the data store.
   * @param user - The User domain entity with updated data
   * @returns Promise resolving to the updated User entity
   */
  update(user: User): Promise<User>;

  /**
   * Deletes a user from the data store by their identifier.
   * @param id - The unique identifier of the user to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if a user with the given email already exists.
   * @param email - The email address to check for existence
   * @returns Promise resolving to true if email exists, false otherwise
   */
  existsByEmail(email: string): Promise<boolean>;
}
