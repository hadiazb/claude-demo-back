/**
 * ============================================================================
 * UNIT TESTS: UserRepositoryAdapter
 * ============================================================================
 *
 * This file contains unit tests for the UserRepositoryAdapter.
 *
 * WHAT IS A REPOSITORY ADAPTER?
 * In Hexagonal Architecture, a repository adapter is an "output adapter" that:
 * - Implements a domain port interface (UserRepositoryPort)
 * - Bridges the domain layer with infrastructure (TypeORM/database)
 * - Converts between domain entities and ORM entities using mappers
 *
 * WHAT DOES UserRepositoryAdapter DO?
 * 1. save(): Persist a new user to the database
 * 2. findById(): Find user by unique ID
 * 3. findByEmail(): Find user by email (case-insensitive)
 * 4. findAll(): Retrieve all users
 * 5. update(): Update an existing user
 * 6. delete(): Remove a user by ID
 * 7. existsByEmail(): Check if email is already taken
 *
 * TESTING APPROACH:
 * We mock the TypeORM Repository and verify:
 * - Correct TypeORM methods are called with proper arguments
 * - Domain entities are properly converted to/from ORM entities
 * - Null handling for not-found scenarios
 */

import { Repository } from 'typeorm';
import { UserRepositoryAdapter } from '@users/infrastructure/adapters/out/user.repository.adapter';
import { UserOrmEntity } from '@users/infrastructure/persistence/entities/user.orm-entity';
import { User, UserRole } from '@users/domain/entities/user.entity';
import { Email } from '@users/domain/value-objects/email.vo';
import { Password } from '@users/domain/value-objects/password.vo';

describe('UserRepositoryAdapter', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST SETUP AND MOCKS
   * =========================================================================
   */

  let adapter: UserRepositoryAdapter;
  let mockRepository: jest.Mocked<Repository<UserOrmEntity>>;

  // Helper to create a mock TypeORM repository
  const createMockRepository = (): jest.Mocked<Repository<UserOrmEntity>> => {
    return {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserOrmEntity>>;
  };

  // Helper to create a UserOrmEntity
  const createOrmEntity = (
    overrides: Partial<UserOrmEntity> = {},
  ): UserOrmEntity => {
    const entity = new UserOrmEntity();
    entity.id = 'user-123';
    entity.email = 'test@example.com';
    entity.password = '$2b$10$hashedPasswordValue';
    entity.firstName = 'John';
    entity.lastName = 'Doe';
    entity.age = 30;
    entity.role = UserRole.USER;
    entity.isActive = true;
    entity.avatarUrl = null;
    entity.createdAt = new Date('2024-01-01');
    entity.updatedAt = new Date('2024-01-02');
    Object.assign(entity, overrides);
    return entity;
  };

  // Helper to create a domain User entity
  const createDomainUser = (
    overrides: Partial<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    }> = {},
  ): User => {
    const defaults = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      isActive: true,
    };
    const merged = { ...defaults, ...overrides };

    return new User({
      id: merged.id,
      email: new Email(merged.email),
      password: Password.fromHash('$2b$10$hashedPasswordValue'),
      firstName: merged.firstName,
      lastName: merged.lastName,
      age: 30,
      role: merged.role,
      isActive: merged.isActive,
      avatarUrl: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    });
  };

  beforeEach(() => {
    mockRepository = createMockRepository();
    adapter = new UserRepositoryAdapter(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 2: SAVE METHOD TESTS
   * =========================================================================
   */
  describe('save', () => {
    it('should save a user and return the domain entity', async () => {
      /**
       * TEST: Successful save operation
       *
       * save() should:
       * 1. Convert domain entity to ORM entity
       * 2. Call repository.save()
       * 3. Convert saved ORM entity back to domain entity
       */
      const domainUser = createDomainUser();
      const savedOrmEntity = createOrmEntity();
      mockRepository.save.mockResolvedValue(savedOrmEntity);

      const result = await adapter.save(domainUser);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('user-123');
    });

    it('should call repository.save with ORM entity', async () => {
      /**
       * TEST: Proper entity conversion
       *
       * Verify the ORM entity passed to save has correct properties.
       */
      const domainUser = createDomainUser({ email: 'new@example.com' });
      const savedOrmEntity = createOrmEntity({ email: 'new@example.com' });
      mockRepository.save.mockResolvedValue(savedOrmEntity);

      await adapter.save(domainUser);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      );
    });

    it('should preserve user role in save operation', async () => {
      /**
       * TEST: Role preservation
       *
       * Admin role should be preserved through the conversion.
       */
      const adminUser = createDomainUser({ role: UserRole.ADMIN });
      const savedOrmEntity = createOrmEntity({ role: UserRole.ADMIN });
      mockRepository.save.mockResolvedValue(savedOrmEntity);

      const result = await adapter.save(adminUser);

      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  /**
   * =========================================================================
   * SECTION 3: FIND BY ID TESTS
   * =========================================================================
   */
  describe('findById', () => {
    it('should return user when found', async () => {
      /**
       * TEST: User found by ID
       *
       * When user exists, return domain entity.
       */
      const ormEntity = createOrmEntity();
      mockRepository.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findById('user-123');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-123');
    });

    it('should return null when user not found', async () => {
      /**
       * TEST: User not found
       *
       * When no user exists with given ID, return null.
       */
      mockRepository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should call findOne with correct where clause', async () => {
      /**
       * TEST: Correct query parameters
       *
       * Verify findOne is called with proper ID filter.
       */
      mockRepository.findOne.mockResolvedValue(null);

      await adapter.findById('specific-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'specific-id' },
      });
    });

    it('should handle UUID format IDs', async () => {
      /**
       * TEST: UUID ID format
       *
       * Real IDs are UUIDs - verify they work correctly.
       */
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const ormEntity = createOrmEntity({ id: uuid });
      mockRepository.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findById(uuid);

      expect(result?.id).toBe(uuid);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: FIND BY EMAIL TESTS
   * =========================================================================
   */
  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      /**
       * TEST: User found by email
       */
      const ormEntity = createOrmEntity({ email: 'found@example.com' });
      mockRepository.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findByEmail('found@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email.getValue()).toBe('found@example.com');
    });

    it('should return null when email not found', async () => {
      /**
       * TEST: Email not found
       */
      mockRepository.findOne.mockResolvedValue(null);

      const result = await adapter.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('should convert email to lowercase for query', async () => {
      /**
       * TEST: Case-insensitive email search
       *
       * Emails should be normalized to lowercase before querying.
       */
      mockRepository.findOne.mockResolvedValue(null);

      await adapter.findByEmail('TEST@EXAMPLE.COM');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should handle mixed case emails', async () => {
      /**
       * TEST: Mixed case normalization
       */
      mockRepository.findOne.mockResolvedValue(null);

      await adapter.findByEmail('User.Name@Domain.Com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'user.name@domain.com' },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 5: FIND ALL TESTS
   * =========================================================================
   */
  describe('findAll', () => {
    it('should return array of domain users', async () => {
      /**
       * TEST: Multiple users found
       */
      const ormEntities = [
        createOrmEntity({ id: 'user-1', email: 'user1@example.com' }),
        createOrmEntity({ id: 'user-2', email: 'user2@example.com' }),
      ];
      mockRepository.find.mockResolvedValue(ormEntities);

      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[1]).toBeInstanceOf(User);
    });

    it('should return empty array when no users exist', async () => {
      /**
       * TEST: No users in database
       */
      mockRepository.find.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should call repository.find without parameters', async () => {
      /**
       * TEST: No filter applied
       *
       * findAll retrieves all users without any where clause.
       */
      mockRepository.find.mockResolvedValue([]);

      await adapter.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith();
    });

    it('should convert all entities to domain objects', async () => {
      /**
       * TEST: All entities converted
       */
      const ormEntities = [
        createOrmEntity({ id: 'user-1', role: UserRole.ADMIN }),
        createOrmEntity({ id: 'user-2', role: UserRole.USER }),
        createOrmEntity({ id: 'user-3', role: UserRole.USER }),
      ];
      mockRepository.find.mockResolvedValue(ormEntities);

      const result = await adapter.findAll();

      expect(result[0].role).toBe(UserRole.ADMIN);
      expect(result[1].role).toBe(UserRole.USER);
      expect(result[2].role).toBe(UserRole.USER);
    });
  });

  /**
   * =========================================================================
   * SECTION 6: UPDATE TESTS
   * =========================================================================
   */
  describe('update', () => {
    it('should update user and return domain entity', async () => {
      /**
       * TEST: Successful update
       */
      const domainUser = createDomainUser({ firstName: 'Updated' });
      const updatedOrmEntity = createOrmEntity({ firstName: 'Updated' });
      mockRepository.save.mockResolvedValue(updatedOrmEntity);

      const result = await adapter.update(domainUser);

      expect(result.firstName).toBe('Updated');
    });

    it('should call repository.save for update', async () => {
      /**
       * TEST: Uses save for upsert
       *
       * TypeORM uses save() for both insert and update operations.
       */
      const domainUser = createDomainUser();
      const updatedOrmEntity = createOrmEntity();
      mockRepository.save.mockResolvedValue(updatedOrmEntity);

      await adapter.update(domainUser);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should preserve all user properties on update', async () => {
      /**
       * TEST: Full property preservation
       */
      const domainUser = createDomainUser({
        firstName: 'New',
        lastName: 'Name',
        role: UserRole.ADMIN,
      });
      const updatedOrmEntity = createOrmEntity({
        firstName: 'New',
        lastName: 'Name',
        role: UserRole.ADMIN,
      });
      mockRepository.save.mockResolvedValue(updatedOrmEntity);

      const result = await adapter.update(domainUser);

      expect(result.firstName).toBe('New');
      expect(result.lastName).toBe('Name');
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  /**
   * =========================================================================
   * SECTION 7: DELETE TESTS
   * =========================================================================
   */
  describe('delete', () => {
    it('should call repository.delete with correct id', async () => {
      /**
       * TEST: Delete by ID
       */
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await adapter.delete('user-123');

      expect(mockRepository.delete).toHaveBeenCalledWith('user-123');
    });

    it('should not throw when user does not exist', async () => {
      /**
       * TEST: Delete non-existent user
       *
       * TypeORM delete doesn't throw if record doesn't exist.
       */
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(adapter.delete('non-existent')).resolves.not.toThrow();
    });

    it('should return void on successful delete', async () => {
      /**
       * TEST: Return type
       */
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await adapter.delete('user-123');

      expect(result).toBeUndefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 8: EXISTS BY EMAIL TESTS
   * =========================================================================
   */
  describe('existsByEmail', () => {
    it('should return true when email exists', async () => {
      /**
       * TEST: Email exists
       */
      mockRepository.count.mockResolvedValue(1);

      const result = await adapter.existsByEmail('existing@example.com');

      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      /**
       * TEST: Email does not exist
       */
      mockRepository.count.mockResolvedValue(0);

      const result = await adapter.existsByEmail('new@example.com');

      expect(result).toBe(false);
    });

    it('should convert email to lowercase for check', async () => {
      /**
       * TEST: Case-insensitive email check
       */
      mockRepository.count.mockResolvedValue(0);

      await adapter.existsByEmail('TEST@EXAMPLE.COM');

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should use count instead of findOne for efficiency', async () => {
      /**
       * TEST: Efficient existence check
       *
       * count() is more efficient than findOne() for existence checks
       * because it doesn't load the entire entity.
       */
      mockRepository.count.mockResolvedValue(1);

      await adapter.existsByEmail('test@example.com');

      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });
  });

  /**
   * =========================================================================
   * SECTION 9: COUNT BY ROLE TESTS
   * =========================================================================
   */
  describe('countByRole', () => {
    it('should return count of users with specified role', async () => {
      /**
       * TEST: Count users by role
       */
      mockRepository.count.mockResolvedValue(3);

      const result = await adapter.countByRole(UserRole.ADMIN);

      expect(result).toBe(3);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
      });
    });

    it('should return zero when no users have the role', async () => {
      /**
       * TEST: No users with role
       */
      mockRepository.count.mockResolvedValue(0);

      const result = await adapter.countByRole(UserRole.ADMIN);

      expect(result).toBe(0);
    });

    it('should count USER role correctly', async () => {
      /**
       * TEST: Count USER role
       */
      mockRepository.count.mockResolvedValue(10);

      const result = await adapter.countByRole(UserRole.USER);

      expect(result).toBe(10);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { role: UserRole.USER },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 10: EDGE CASES AND ERROR HANDLING
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle database errors in save', async () => {
      /**
       * TEST: Database error propagation
       */
      mockRepository.save.mockRejectedValue(new Error('Database error'));
      const domainUser = createDomainUser();

      await expect(adapter.save(domainUser)).rejects.toThrow('Database error');
    });

    it('should handle database errors in findById', async () => {
      /**
       * TEST: Find error propagation
       */
      mockRepository.findOne.mockRejectedValue(new Error('Connection lost'));

      await expect(adapter.findById('user-123')).rejects.toThrow(
        'Connection lost',
      );
    });

    it('should handle empty string email in findByEmail', async () => {
      /**
       * TEST: Empty email query
       */
      mockRepository.findOne.mockResolvedValue(null);

      await adapter.findByEmail('');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: '' },
      });
    });

    it('should handle special characters in email', async () => {
      /**
       * TEST: Special characters in email
       */
      const specialEmail = 'user+tag@sub.domain.example.com';
      mockRepository.findOne.mockResolvedValue(null);

      await adapter.findByEmail(specialEmail);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: specialEmail.toLowerCase() },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 11: REAL-WORLD SCENARIOS
   * =========================================================================
   */
  describe('real-world scenarios', () => {
    it('should handle user registration flow', async () => {
      /**
       * SCENARIO: New user registration
       *
       * 1. Check if email exists
       * 2. Save new user
       */
      mockRepository.count.mockResolvedValue(0);
      const newUser = createDomainUser({ email: 'newuser@example.com' });
      const savedEntity = createOrmEntity({ email: 'newuser@example.com' });
      mockRepository.save.mockResolvedValue(savedEntity);

      const emailExists = await adapter.existsByEmail('newuser@example.com');
      expect(emailExists).toBe(false);

      const savedUser = await adapter.save(newUser);
      expect(savedUser.email.getValue()).toBe('newuser@example.com');
    });

    it('should handle user profile update', async () => {
      /**
       * SCENARIO: User updates their profile
       *
       * 1. Find user by ID
       * 2. Update user data
       */
      const existingEntity = createOrmEntity();
      mockRepository.findOne.mockResolvedValue(existingEntity);

      const user = await adapter.findById('user-123');
      expect(user).not.toBeNull();

      const updatedEntity = createOrmEntity({ firstName: 'UpdatedName' });
      mockRepository.save.mockResolvedValue(updatedEntity);

      const updatedUser = createDomainUser({ firstName: 'UpdatedName' });
      const result = await adapter.update(updatedUser);
      expect(result.firstName).toBe('UpdatedName');
    });

    it('should handle admin listing all users', async () => {
      /**
       * SCENARIO: Admin views all users
       */
      const users = [
        createOrmEntity({ id: '1', email: 'user1@example.com' }),
        createOrmEntity({ id: '2', email: 'user2@example.com' }),
        createOrmEntity({
          id: '3',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
        }),
      ];
      mockRepository.find.mockResolvedValue(users);

      const result = await adapter.findAll();

      expect(result).toHaveLength(3);
      const adminCount = result.filter((u) => u.role === UserRole.ADMIN).length;
      expect(adminCount).toBe(1);
    });
  });
});
