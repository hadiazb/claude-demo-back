/**
 * ============================================================================
 * UNIT TESTS: UserService
 * ============================================================================
 *
 * This file contains unit tests for the UserService.
 *
 * WHAT IS UserService?
 * An application service that handles user-related business logic:
 * - Create new users with validation
 * - Find users by ID or email
 * - List all users
 * - Update user profiles
 *
 * TESTING APPROACH:
 * Mock UserRepositoryPort and verify service behavior.
 */

import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from '@users/application/services/user.service';
import { UserRepositoryPort } from '@users/domain/ports/out/user.repository.port';
import { User, UserRole } from '@users/domain/entities/user.entity';
import { Email } from '@users/domain/value-objects/email.vo';
import { Password } from '@users/domain/value-objects/password.vo';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<UserRepositoryPort>;

  // Helper to create mock repository
  const createMockRepository = (): jest.Mocked<UserRepositoryPort> => {
    return {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByEmail: jest.fn(),
    };
  };

  // Helper to create a domain User
  const createUser = (
    overrides: Partial<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    }> = {},
  ): User => {
    return new User({
      id: overrides.id || 'user-123',
      email: new Email(overrides.email || 'test@example.com'),
      password: Password.fromHash('$2b$10$hashedpassword'),
      firstName: overrides.firstName || 'John',
      lastName: overrides.lastName || 'Doe',
      age: 30,
      role: overrides.role || UserRole.USER,
      isActive: overrides.isActive ?? true,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    mockUserRepository = createMockRepository();
    service = new UserService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 1: CREATE USER TESTS
   * =========================================================================
   */
  describe('createUser', () => {
    const createUserCommand = {
      email: 'new@example.com',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('should create user and return it', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.createUser(createUserCommand);

      expect(result).toBeInstanceOf(User);
      expect(result.email.getValue()).toBe('new@example.com');
      expect(result.firstName).toBe('Jane');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(service.createUser(createUserCommand)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createUser(createUserCommand)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should check email existence before saving', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      await service.createUser(createUserCommand);

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        'new@example.com',
      );
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should not call save if email already exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(service.createUser(createUserCommand)).rejects.toThrow();

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should assign USER role by default', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.createUser(createUserCommand);

      expect(result.role).toBe(UserRole.USER);
    });

    it('should use provided role when specified', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.createUser({
        ...createUserCommand,
        role: UserRole.ADMIN,
      });

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should generate a UUID for new user', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.createUser(createUserCommand);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should set isActive to true for new users', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.createUser(createUserCommand);

      expect(result.isActive).toBe(true);
    });

    it('should hash password before saving', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.createUser(createUserCommand);

      // Password should be hashed, not plain text
      const isHashed = await result.validatePassword('SecurePass123!');
      expect(isHashed).toBe(true);
    });
  });

  /**
   * =========================================================================
   * SECTION 2: FIND BY ID TESTS
   * =========================================================================
   */
  describe('findById', () => {
    it('should return user when found', async () => {
      const user = createUser({ id: 'existing-id' });
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.findById('existing-id');

      expect(result).toBe(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('existing-id');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should call repository with correct id', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await service.findById('test-id-123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('test-id-123');
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * =========================================================================
   * SECTION 3: FIND BY EMAIL TESTS
   * =========================================================================
   */
  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const user = createUser({ email: 'found@example.com' });
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail('found@example.com');

      expect(result).toBe(user);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'found@example.com',
      );
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('should call repository with correct email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await service.findByEmail('test@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: FIND ALL TESTS
   * =========================================================================
   */
  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [
        createUser({ id: '1', email: 'user1@example.com' }),
        createUser({ id: '2', email: 'user2@example.com' }),
      ];
      mockUserRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result).toBe(users);
    });

    it('should return empty array when no users', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should call repository findAll', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      await service.findAll();

      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * =========================================================================
   * SECTION 5: UPDATE USER TESTS
   * =========================================================================
   */
  describe('updateUser', () => {
    it('should update and return user', async () => {
      const existingUser = createUser({ firstName: 'Old' });
      const updatedUser = createUser({ firstName: 'Updated' });
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser('user-123', {
        firstName: 'Updated',
      });

      expect(result.firstName).toBe('Updated');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateUser('non-existent', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateUser('non-existent', { firstName: 'Test' }),
      ).rejects.toThrow('User not found');
    });

    it('should preserve unchanged fields', async () => {
      const existingUser = createUser({
        firstName: 'John',
        lastName: 'Doe',
      });
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.updateUser('user-123', {
        firstName: 'Jane',
      });

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe');
    });

    it('should not call update if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateUser('non-existent', { firstName: 'Test' }),
      ).rejects.toThrow();

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should update multiple fields', async () => {
      const existingUser = createUser();
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.updateUser('user-123', {
        firstName: 'New',
        lastName: 'Name',
        age: 35,
      });

      expect(result.firstName).toBe('New');
      expect(result.lastName).toBe('Name');
      expect(result.age).toBe(35);
    });

    it('should preserve email and password', async () => {
      const existingUser = createUser({ email: 'original@example.com' });
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.updateUser('user-123', {
        firstName: 'New',
      });

      expect(result.email.getValue()).toBe('original@example.com');
      expect(result.password).toBe(existingUser.password);
    });

    it('should update isActive field', async () => {
      const existingUser = createUser({ isActive: true });
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.updateUser('user-123', {
        isActive: false,
      });

      expect(result.isActive).toBe(false);
    });
  });

  /**
   * =========================================================================
   * SECTION 6: ERROR HANDLING
   * =========================================================================
   */
  describe('error handling', () => {
    it('should propagate repository errors in createUser', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createUser({
          email: 'test@example.com',
          password: 'ValidPass123!',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow('Database error');
    });

    it('should propagate repository errors in findById', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Connection error'),
      );

      await expect(service.findById('id')).rejects.toThrow('Connection error');
    });

    it('should propagate repository errors in findAll', async () => {
      mockUserRepository.findAll.mockRejectedValue(new Error('Query failed'));

      await expect(service.findAll()).rejects.toThrow('Query failed');
    });

    it('should propagate repository errors in updateUser', async () => {
      const existingUser = createUser();
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.updateUser('user-123', { firstName: 'Test' }),
      ).rejects.toThrow('Update failed');
    });
  });
});
