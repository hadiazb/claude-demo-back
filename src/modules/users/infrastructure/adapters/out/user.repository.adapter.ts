import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRepositoryPort, UserRole } from '@users/domain';
import { UserOrmEntity, UserMapper } from '@users/infrastructure/persistence';

/**
 * Repository adapter for User entity persistence operations.
 * Implements the UserRepositoryPort interface following the Hexagonal Architecture pattern.
 * Acts as a bridge between the domain layer and TypeORM infrastructure.
 */
@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  /**
   * Creates a new instance of UserRepositoryAdapter.
   * @param userRepository - TypeORM repository for UserOrmEntity injected by NestJS
   */
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  /**
   * Persists a new user to the database.
   * @param user - Domain user entity to save
   * @returns Promise resolving to the saved user domain entity
   */
  async save(user: User): Promise<User> {
    const ormEntity = UserMapper.toPersistence(user);
    const savedEntity = await this.userRepository.save(ormEntity);
    return UserMapper.toDomain(savedEntity);
  }

  /**
   * Finds a user by their unique identifier.
   * @param id - Unique identifier of the user
   * @returns Promise resolving to the user if found, or null if not found
   */
  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({ where: { id } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * Finds a user by their email address.
   * Email comparison is case-insensitive.
   * @param email - Email address to search for
   * @returns Promise resolving to the user if found, or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * Retrieves all users from the database.
   * @returns Promise resolving to an array of user domain entities
   */
  async findAll(): Promise<User[]> {
    const ormEntities = await this.userRepository.find();
    return ormEntities.map((entity) => UserMapper.toDomain(entity));
  }

  /**
   * Updates an existing user in the database.
   * @param user - Domain user entity with updated data
   * @returns Promise resolving to the updated user domain entity
   */
  async update(user: User): Promise<User> {
    const ormEntity = UserMapper.toPersistence(user);
    const updatedEntity = await this.userRepository.save(ormEntity);
    return UserMapper.toDomain(updatedEntity);
  }

  /**
   * Deletes a user from the database by their identifier.
   * @param id - Unique identifier of the user to delete
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  /**
   * Checks if a user with the given email already exists.
   * Email comparison is case-insensitive.
   * @param email - Email address to check for existence
   * @returns Promise resolving to true if email exists, false otherwise
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * Counts the number of users with a specific role.
   * Used for business rule validation (e.g., preventing last admin demotion).
   * @param role - The role to count users for
   * @returns Promise resolving to the count of users with the specified role
   */
  async countByRole(role: UserRole): Promise<number> {
    return this.userRepository.count({ where: { role } });
  }
}
