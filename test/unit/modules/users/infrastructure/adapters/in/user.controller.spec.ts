/**
 * ============================================================================
 * UNIT TESTS: UserController
 * ============================================================================
 *
 * This file contains unit tests for the UserController.
 *
 * WHAT IS UserController?
 * A REST controller handling user-related HTTP endpoints:
 * - GET /users/me - Get current user profile
 * - PATCH /users/me - Update current user profile
 * - GET /users/:id - Get user by ID
 * - GET /users - List all users (Admin only)
 *
 * TESTING APPROACH:
 * Mock UserService and verify:
 * - Controller methods call service correctly
 * - Responses are transformed to DTOs
 * - NotFoundException thrown when user not found
 */

import { NotFoundException } from '@nestjs/common';
import { UserController } from '@users/infrastructure/adapters/in/user.controller';
import { UserService } from '@users/application/services/user.service';
import { User, UserRole } from '@users/domain/entities/user.entity';
import { Email } from '@users/domain/value-objects/email.vo';
import { Password } from '@users/domain/value-objects/password.vo';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;

  // Helper to create mock UserService
  const createMockUserService = (): jest.Mocked<UserService> => {
    return {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      updateUserRole: jest.fn(),
    } as unknown as jest.Mocked<UserService>;
  };

  // Helper to create a domain User
  const createUser = (
    overrides: Partial<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
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
      isActive: true,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    mockUserService = createMockUserService();
    controller = new UserController(mockUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 1: GET PROFILE TESTS
   * =========================================================================
   */
  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const user = createUser({ id: 'current-user' });
      mockUserService.findById.mockResolvedValue(user);

      const result = await controller.getProfile('current-user');

      expect(result).toBeDefined();
      expect(result.id).toBe('current-user');
      expect(mockUserService.findById).toHaveBeenCalledWith('current-user');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(controller.getProfile('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getProfile('non-existent')).rejects.toThrow(
        'User not found',
      );
    });

    it('should return UserResponseDto', async () => {
      const user = createUser({
        email: 'profile@example.com',
        firstName: 'Jane',
      });
      mockUserService.findById.mockResolvedValue(user);

      const result = await controller.getProfile('user-123');

      expect(result.email).toBe('profile@example.com');
      expect(result.firstName).toBe('Jane');
      expect(result).not.toHaveProperty('password');
    });
  });

  /**
   * =========================================================================
   * SECTION 2: UPDATE PROFILE TESTS
   * =========================================================================
   */
  describe('updateProfile', () => {
    it('should update and return user profile', async () => {
      const updatedUser = createUser({ firstName: 'Updated' });
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile('user-123', {
        firstName: 'Updated',
      });

      expect(result.firstName).toBe('Updated');
      expect(mockUserService.updateUser).toHaveBeenCalledWith('user-123', {
        firstName: 'Updated',
      });
    });

    it('should pass update dto to service', async () => {
      const updatedUser = createUser();
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const updateDto = { firstName: 'New', lastName: 'Name', age: 35 };
      await controller.updateProfile('user-123', updateDto);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        'user-123',
        updateDto,
      );
    });

    it('should return UserResponseDto without password', async () => {
      const updatedUser = createUser();
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile('user-123', {});

      expect(result).not.toHaveProperty('password');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: FIND BY ID TESTS
   * =========================================================================
   */
  describe('findById', () => {
    it('should return user by ID', async () => {
      const user = createUser({ id: 'target-user' });
      mockUserService.findById.mockResolvedValue(user);

      const result = await controller.findById('target-user');

      expect(result.id).toBe('target-user');
      expect(mockUserService.findById).toHaveBeenCalledWith('target-user');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(controller.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findById('non-existent')).rejects.toThrow(
        'User not found',
      );
    });

    it('should return UserResponseDto', async () => {
      const user = createUser({ email: 'found@example.com' });
      mockUserService.findById.mockResolvedValue(user);

      const result = await controller.findById('user-123');

      expect(result.email).toBe('found@example.com');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
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
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should return empty array when no users', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should return UserResponseDto array', async () => {
      const users = [createUser()];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).toHaveProperty('email');
    });

    it('should call userService.findAll', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * =========================================================================
   * SECTION 5: UPDATE ROLE TESTS
   * =========================================================================
   */
  describe('updateRole', () => {
    it('should update user role and return updated user', async () => {
      const updatedUser = createUser({
        id: 'target-user',
        role: UserRole.ADMIN,
      });
      mockUserService.updateUserRole.mockResolvedValue(updatedUser);

      const result = await controller.updateRole(
        'target-user',
        { role: UserRole.ADMIN },
        'admin-123',
      );

      expect(result.role).toBe(UserRole.ADMIN);
      expect(mockUserService.updateUserRole).toHaveBeenCalledWith(
        'target-user',
        UserRole.ADMIN,
        'admin-123',
      );
    });

    it('should pass correct parameters to service', async () => {
      const user = createUser({ role: UserRole.USER });
      mockUserService.updateUserRole.mockResolvedValue(user);

      await controller.updateRole(
        'user-456',
        { role: UserRole.USER },
        'admin-123',
      );

      expect(mockUserService.updateUserRole).toHaveBeenCalledWith(
        'user-456',
        UserRole.USER,
        'admin-123',
      );
    });

    it('should return UserResponseDto without password', async () => {
      const user = createUser();
      mockUserService.updateUserRole.mockResolvedValue(user);

      const result = await controller.updateRole(
        'user-123',
        { role: UserRole.ADMIN },
        'admin-456',
      );

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('role');
    });

    it('should propagate ForbiddenException from service', async () => {
      const { ForbiddenException } = await import('@nestjs/common');
      mockUserService.updateUserRole.mockRejectedValue(
        new ForbiddenException('Cannot change your own role'),
      );

      await expect(
        controller.updateRole(
          'admin-123',
          { role: UserRole.USER },
          'admin-123',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should propagate NotFoundException from service', async () => {
      mockUserService.updateUserRole.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.updateRole(
          'non-existent',
          { role: UserRole.ADMIN },
          'admin-123',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * =========================================================================
   * SECTION 6: ERROR HANDLING
   * =========================================================================
   */
  describe('error handling', () => {
    it('should propagate service errors in getProfile', async () => {
      mockUserService.findById.mockRejectedValue(new Error('Service error'));

      await expect(controller.getProfile('user-123')).rejects.toThrow(
        'Service error',
      );
    });

    it('should propagate service errors in updateProfile', async () => {
      mockUserService.updateUser.mockRejectedValue(new Error('Update failed'));

      await expect(controller.updateProfile('user-123', {})).rejects.toThrow(
        'Update failed',
      );
    });

    it('should propagate service errors in findAll', async () => {
      mockUserService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });
});
