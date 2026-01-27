import { User, Email, Password } from '@users/domain';
import { UserOrmEntity } from '@users/infrastructure/persistence/entities';

/**
 * Mapper class for converting between User domain entities and UserOrmEntity persistence objects.
 * Implements the Data Mapper pattern to separate domain logic from persistence concerns.
 */
export class UserMapper {
  /**
   * Converts a persistence ORM entity to a domain User entity.
   * Reconstructs value objects (Email, Password) from their primitive representations.
   * @param ormEntity - The TypeORM entity retrieved from the database
   * @returns A fully hydrated User domain entity
   */
  static toDomain(ormEntity: UserOrmEntity): User {
    return new User({
      id: ormEntity.id,
      email: new Email(ormEntity.email),
      password: Password.fromHash(ormEntity.password),
      firstName: ormEntity.firstName,
      lastName: ormEntity.lastName,
      age: ormEntity.age,
      role: ormEntity.role,
      isActive: ormEntity.isActive,
      avatarUrl: ormEntity.avatarUrl,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  /**
   * Converts a domain User entity to a persistence ORM entity.
   * Extracts primitive values from value objects for database storage.
   * @param domainEntity - The User domain entity to persist
   * @returns A TypeORM entity ready for database operations
   */
  static toPersistence(domainEntity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.email = domainEntity.email.getValue();
    ormEntity.password = domainEntity.password.getValue();
    ormEntity.firstName = domainEntity.firstName;
    ormEntity.lastName = domainEntity.lastName;
    ormEntity.age = domainEntity.age;
    ormEntity.role = domainEntity.role;
    ormEntity.isActive = domainEntity.isActive;
    ormEntity.avatarUrl = domainEntity.avatarUrl;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    return ormEntity;
  }
}
