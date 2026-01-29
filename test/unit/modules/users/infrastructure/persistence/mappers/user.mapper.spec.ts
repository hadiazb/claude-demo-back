/**
 * ============================================================================
 * UNIT TESTS: UserMapper
 * ============================================================================
 *
 * This file contains unit tests for the UserMapper class.
 *
 * WHAT IS A MAPPER?
 * A mapper (also known as Data Mapper pattern) is responsible for transferring
 * data between two different representations:
 * - Domain Entity: Rich object with business logic (User, Email, Password VOs)
 * - ORM Entity: Simple data structure for database persistence (UserOrmEntity)
 *
 * WHY USE MAPPERS?
 * 1. Separation of Concerns: Domain logic stays in domain layer
 * 2. Persistence Ignorance: Domain doesn't know about database
 * 3. Flexibility: Can change database without affecting domain
 * 4. Testability: Each layer can be tested independently
 *
 * WHAT ARE WE TESTING?
 * 1. toDomain(): Converting ORM entity to domain entity
 * 2. toPersistence(): Converting domain entity to ORM entity
 * 3. Round-trip mapping: toPersistence(toDomain(x)) maintains data integrity
 */

import { UserMapper } from '@users/infrastructure/persistence/mappers/user.mapper';
import { UserOrmEntity } from '@users/infrastructure/persistence/entities/user.orm-entity';
import { User, UserRole } from '@users/domain/entities/user.entity';
import { Email } from '@users/domain/value-objects/email.vo';
import { Password } from '@users/domain/value-objects/password.vo';

describe('UserMapper', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST DATA SETUP (Test Fixtures)
   * =========================================================================
   */

  // Helper to create a valid UserOrmEntity (database representation)
  const createOrmEntity = (
    overrides: Partial<UserOrmEntity> = {},
  ): UserOrmEntity => {
    const entity = new UserOrmEntity();
    entity.id = 'user-123';
    entity.email = 'test@example.com';
    entity.password = '$2b$10$hashedPasswordValue123456789012345678901234';
    entity.firstName = 'John';
    entity.lastName = 'Doe';
    entity.age = 30;
    entity.role = UserRole.USER;
    entity.isActive = true;
    entity.avatarUrl = 'https://example.com/avatar.jpg';
    entity.createdAt = new Date('2024-01-01T10:00:00Z');
    entity.updatedAt = new Date('2024-01-02T15:30:00Z');

    // Apply overrides
    Object.assign(entity, overrides);
    return entity;
  };

  // Helper to create a valid User domain entity
  const createDomainEntity = async (
    overrides: Partial<{
      id: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      age: number | null;
      role: UserRole;
      isActive: boolean;
      avatarUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = {},
  ): Promise<User> => {
    const defaults = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      role: UserRole.USER,
      isActive: true,
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-02T15:30:00Z'),
    };

    const merged = { ...defaults, ...overrides };

    return new User({
      id: merged.id,
      email: new Email(merged.email),
      password: await Password.create(merged.password),
      firstName: merged.firstName,
      lastName: merged.lastName,
      age: merged.age,
      role: merged.role,
      isActive: merged.isActive,
      avatarUrl: merged.avatarUrl,
      createdAt: merged.createdAt,
      updatedAt: merged.updatedAt,
    });
  };

  /**
   * =========================================================================
   * SECTION 2: toDomain() METHOD TESTS
   * =========================================================================
   *
   * toDomain() converts a database record (UserOrmEntity) to a rich
   * domain object (User) with proper value objects.
   */
  describe('toDomain', () => {
    it('should convert ORM entity to domain entity with all properties', () => {
      /**
       * TEST: Basic conversion from ORM to domain
       *
       * Verifies that all primitive values from the database are
       * correctly mapped to the domain entity.
       */

      // Arrange
      const ormEntity = createOrmEntity();

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity).toBeInstanceOf(User);
      expect(domainEntity.id).toBe('user-123');
      expect(domainEntity.firstName).toBe('John');
      expect(domainEntity.lastName).toBe('Doe');
      expect(domainEntity.age).toBe(30);
      expect(domainEntity.role).toBe(UserRole.USER);
      expect(domainEntity.isActive).toBe(true);
      expect(domainEntity.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should create Email value object from string', () => {
      /**
       * TEST: Email value object creation
       *
       * The ORM stores email as a plain string, but the domain
       * uses an Email value object for validation and behavior.
       */

      // Arrange
      const ormEntity = createOrmEntity({ email: 'user@domain.com' });

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity.email).toBeInstanceOf(Email);
      expect(domainEntity.email.getValue()).toBe('user@domain.com');
    });

    it('should create Password value object from hash using fromHash()', () => {
      /**
       * TEST: Password value object creation from hash
       *
       * IMPORTANT: When loading from database, we use Password.fromHash()
       * NOT Password.create(). This is because:
       * - The password is already hashed in the database
       * - We don't want to re-hash an already hashed value
       * - fromHash() skips validation since the password was validated on creation
       */

      // Arrange
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv';
      const ormEntity = createOrmEntity({ password: hashedPassword });

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity.password).toBeInstanceOf(Password);
      expect(domainEntity.password.getValue()).toBe(hashedPassword);
    });

    it('should preserve timestamps from ORM entity', () => {
      /**
       * TEST: Timestamp preservation
       *
       * createdAt and updatedAt should be preserved exactly
       * from the database, not regenerated.
       */

      // Arrange
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-06-15T08:45:00Z');
      const ormEntity = createOrmEntity({ createdAt, updatedAt });

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity.createdAt).toEqual(createdAt);
      expect(domainEntity.updatedAt).toEqual(updatedAt);
    });

    it('should handle null values for optional fields', () => {
      /**
       * TEST: Nullable fields handling
       *
       * age and avatarUrl are nullable in the database.
       * The mapper should preserve null values.
       */

      // Arrange
      const ormEntity = createOrmEntity({
        age: null,
        avatarUrl: null,
      });

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity.age).toBeNull();
      expect(domainEntity.avatarUrl).toBeNull();
    });

    it('should handle ADMIN role correctly', () => {
      /**
       * TEST: Admin role mapping
       *
       * Verify enum values are preserved during conversion.
       */

      // Arrange
      const ormEntity = createOrmEntity({ role: UserRole.ADMIN });

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity.role).toBe(UserRole.ADMIN);
    });

    it('should handle inactive users', () => {
      /**
       * TEST: Inactive user mapping
       *
       * isActive = false should be preserved.
       */

      // Arrange
      const ormEntity = createOrmEntity({ isActive: false });

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity.isActive).toBe(false);
    });

    it('should normalize email to lowercase via Email value object', () => {
      /**
       * TEST: Email normalization
       *
       * The Email value object normalizes emails to lowercase.
       * Even if the database stores mixed case, domain will be lowercase.
       */

      // Arrange
      const ormEntity = createOrmEntity({ email: 'User@EXAMPLE.com' });

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity.email.getValue()).toBe('user@example.com');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: toPersistence() METHOD TESTS
   * =========================================================================
   *
   * toPersistence() converts a domain entity back to an ORM entity
   * for database storage. It extracts primitive values from value objects.
   */
  describe('toPersistence', () => {
    it('should convert domain entity to ORM entity with all properties', async () => {
      /**
       * TEST: Basic conversion from domain to ORM
       *
       * Verifies that all domain properties are correctly
       * extracted and mapped to the ORM entity.
       */

      // Arrange
      const domainEntity = await createDomainEntity();

      // Act
      const ormEntity = UserMapper.toPersistence(domainEntity);

      // Assert
      expect(ormEntity).toBeInstanceOf(UserOrmEntity);
      expect(ormEntity.id).toBe('user-123');
      expect(ormEntity.firstName).toBe('John');
      expect(ormEntity.lastName).toBe('Doe');
      expect(ormEntity.age).toBe(30);
      expect(ormEntity.role).toBe(UserRole.USER);
      expect(ormEntity.isActive).toBe(true);
      expect(ormEntity.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should extract email string from Email value object', async () => {
      /**
       * TEST: Email extraction
       *
       * The ORM entity needs a plain string, so we call
       * email.getValue() to extract it from the value object.
       */

      // Arrange
      const domainEntity = await createDomainEntity({
        email: 'user@domain.com',
      });

      // Act
      const ormEntity = UserMapper.toPersistence(domainEntity);

      // Assert
      expect(typeof ormEntity.email).toBe('string');
      expect(ormEntity.email).toBe('user@domain.com');
    });

    it('should extract hashed password from Password value object', async () => {
      /**
       * TEST: Password hash extraction
       *
       * The ORM entity stores the hashed password, not the plain text.
       * password.getValue() returns the bcrypt hash.
       */

      // Arrange
      const domainEntity = await createDomainEntity();

      // Act
      const ormEntity = UserMapper.toPersistence(domainEntity);

      // Assert
      expect(typeof ormEntity.password).toBe('string');
      // Bcrypt hashes start with $2a$ or $2b$
      expect(ormEntity.password).toMatch(/^\$2[ab]\$/);
    });

    it('should preserve timestamps in ORM entity', async () => {
      /**
       * TEST: Timestamp preservation
       *
       * Timestamps should be transferred exactly to the ORM entity.
       */

      // Arrange
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-06-15T08:45:00Z');
      const domainEntity = await createDomainEntity({ createdAt, updatedAt });

      // Act
      const ormEntity = UserMapper.toPersistence(domainEntity);

      // Assert
      expect(ormEntity.createdAt).toEqual(createdAt);
      expect(ormEntity.updatedAt).toEqual(updatedAt);
    });

    it('should handle null values for optional fields', async () => {
      /**
       * TEST: Nullable fields handling
       *
       * null values should be preserved in the ORM entity.
       */

      // Arrange
      const domainEntity = await createDomainEntity({
        age: null,
        avatarUrl: null,
      });

      // Act
      const ormEntity = UserMapper.toPersistence(domainEntity);

      // Assert
      expect(ormEntity.age).toBeNull();
      expect(ormEntity.avatarUrl).toBeNull();
    });

    it('should handle ADMIN role correctly', async () => {
      /**
       * TEST: Admin role persistence
       *
       * Enum values should be preserved for database storage.
       */

      // Arrange
      const domainEntity = await createDomainEntity({ role: UserRole.ADMIN });

      // Act
      const ormEntity = UserMapper.toPersistence(domainEntity);

      // Assert
      expect(ormEntity.role).toBe(UserRole.ADMIN);
    });

    it('should create a new UserOrmEntity instance', async () => {
      /**
       * TEST: New instance creation
       *
       * toPersistence should create a new UserOrmEntity instance,
       * not modify an existing one.
       */

      // Arrange
      const domainEntity = await createDomainEntity();

      // Act
      const ormEntity1 = UserMapper.toPersistence(domainEntity);
      const ormEntity2 = UserMapper.toPersistence(domainEntity);

      // Assert - Should be different instances with same values
      expect(ormEntity1).not.toBe(ormEntity2);
      expect(ormEntity1.id).toBe(ormEntity2.id);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: ROUND-TRIP MAPPING TESTS
   * =========================================================================
   *
   * These tests verify that data survives a complete round-trip:
   * ORM -> Domain -> ORM (or Domain -> ORM -> Domain)
   *
   * This is crucial for data integrity.
   */
  describe('round-trip mapping', () => {
    it('should preserve data in ORM -> Domain -> ORM conversion', () => {
      /**
       * TEST: Full round-trip from ORM
       *
       * Data that comes from the database, gets converted to domain,
       * and then back to ORM should maintain all values.
       */

      // Arrange
      const originalOrm = createOrmEntity();

      // Act
      const domain = UserMapper.toDomain(originalOrm);
      const resultOrm = UserMapper.toPersistence(domain);

      // Assert - All primitive values should match
      expect(resultOrm.id).toBe(originalOrm.id);
      expect(resultOrm.email).toBe(originalOrm.email);
      expect(resultOrm.password).toBe(originalOrm.password);
      expect(resultOrm.firstName).toBe(originalOrm.firstName);
      expect(resultOrm.lastName).toBe(originalOrm.lastName);
      expect(resultOrm.age).toBe(originalOrm.age);
      expect(resultOrm.role).toBe(originalOrm.role);
      expect(resultOrm.isActive).toBe(originalOrm.isActive);
      expect(resultOrm.avatarUrl).toBe(originalOrm.avatarUrl);
      expect(resultOrm.createdAt).toEqual(originalOrm.createdAt);
      expect(resultOrm.updatedAt).toEqual(originalOrm.updatedAt);
    });

    it('should preserve null values through round-trip', () => {
      /**
       * TEST: Null values round-trip
       *
       * Nullable fields should remain null through the entire conversion.
       */

      // Arrange
      const originalOrm = createOrmEntity({
        age: null,
        avatarUrl: null,
      });

      // Act
      const domain = UserMapper.toDomain(originalOrm);
      const resultOrm = UserMapper.toPersistence(domain);

      // Assert
      expect(resultOrm.age).toBeNull();
      expect(resultOrm.avatarUrl).toBeNull();
    });

    it('should preserve ADMIN role through round-trip', () => {
      /**
       * TEST: Enum round-trip
       *
       * UserRole enum should be preserved correctly.
       */

      // Arrange
      const originalOrm = createOrmEntity({ role: UserRole.ADMIN });

      // Act
      const domain = UserMapper.toDomain(originalOrm);
      const resultOrm = UserMapper.toPersistence(domain);

      // Assert
      expect(resultOrm.role).toBe(UserRole.ADMIN);
    });
  });

  /**
   * =========================================================================
   * SECTION 5: STATIC METHOD TESTS
   * =========================================================================
   */
  describe('static methods', () => {
    it('toDomain should be a static method', () => {
      /**
       * TEST: toDomain is static
       *
       * Verify the method can be called without instantiating UserMapper.
       */

      expect(typeof UserMapper.toDomain).toBe('function');
    });

    it('toPersistence should be a static method', () => {
      /**
       * TEST: toPersistence is static
       *
       * Verify the method can be called without instantiating UserMapper.
       */

      expect(typeof UserMapper.toPersistence).toBe('function');
    });
  });
});
