import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { INJECTION_TOKENS } from '@shared';
import {
  User,
  UserRole,
  UserRepositoryPort,
  CreateUserCommand,
  UpdateUserCommand,
  Email,
  Password,
} from '@users/domain';

/**
 * Application service implementing user-related use cases.
 * Acts as an orchestrator between the domain layer and infrastructure.
 * Implements CreateUserUseCase, FindUserUseCase, and UpdateUserUseCase.
 */
@Injectable()
export class UserService {
  /**
   * Creates a new instance of UserService.
   * @param userRepository - Repository port for user persistence operations, injected via DI
   */
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  /**
   * Creates a new user in the system.
   * Validates email uniqueness, creates value objects, and persists the user.
   * @param command - Object containing the new user's data
   * @returns Promise resolving to the newly created User entity
   * @throws ConflictException if the email is already registered
   */
  async createUser(command: CreateUserCommand): Promise<User> {
    const existingUser = await this.userRepository.existsByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const email = new Email(command.email);
    const password = await Password.create(command.password);

    const user = new User({
      id: uuidv4(),
      email,
      password,
      firstName: command.firstName,
      lastName: command.lastName,
      age: command.age ?? null,
      role: command.role || UserRole.USER,
      isActive: true,
      avatarUrl: command.avatarUrl || null,
    });

    return this.userRepository.save(user);
  }

  /**
   * Finds a user by their unique identifier.
   * @param id - The unique identifier of the user to find
   * @returns Promise resolving to the User if found, or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Finds a user by their email address.
   * @param email - The email address to search for
   * @returns Promise resolving to the User if found, or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Retrieves all users from the system.
   * @returns Promise resolving to an array of all User entities
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  /**
   * Updates an existing user with partial data.
   * Preserves unchanged fields and updates only the provided ones.
   * @param id - The unique identifier of the user to update
   * @param command - Object containing the fields to update
   * @returns Promise resolving to the updated User entity
   * @throws NotFoundException if the user does not exist
   */
  async updateUser(id: string, command: UpdateUserCommand): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = new User({
      id: existingUser.id,
      email: existingUser.email,
      password: existingUser.password,
      firstName: command.firstName ?? existingUser.firstName,
      lastName: command.lastName ?? existingUser.lastName,
      age: command.age ?? existingUser.age,
      role: existingUser.role,
      isActive: command.isActive ?? existingUser.isActive,
      avatarUrl: command.avatarUrl ?? existingUser.avatarUrl,
      createdAt: existingUser.createdAt,
      updatedAt: new Date(),
    });

    return this.userRepository.update(updatedUser);
  }

  /**
   * Updates a user's role with domain validation rules.
   * Business rules enforced:
   * - Admin cannot change their own role (prevents self-demotion)
   * - Cannot demote the last admin in the system
   *
   * @param targetUserId - The ID of the user whose role will be changed
   * @param newRole - The new role to assign
   * @param requestingUserId - The ID of the admin making the request
   * @returns Promise resolving to the updated User entity
   * @throws NotFoundException if the target user does not exist
   * @throws ForbiddenException if business rules are violated
   */
  async updateUserRole(
    targetUserId: string,
    newRole: UserRole,
    requestingUserId: string,
  ): Promise<User> {
    // Rule 1: Cannot change own role
    if (targetUserId === requestingUserId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Rule 2: Cannot demote the last admin
    if (targetUser.role === UserRole.ADMIN && newRole === UserRole.USER) {
      const adminCount = await this.userRepository.countByRole(UserRole.ADMIN);
      if (adminCount <= 1) {
        throw new ForbiddenException(
          'Cannot demote the last admin. Promote another user first.',
        );
      }
    }

    // No change needed if role is the same
    if (targetUser.role === newRole) {
      return targetUser;
    }

    const updatedUser = new User({
      id: targetUser.id,
      email: targetUser.email,
      password: targetUser.password,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      age: targetUser.age,
      role: newRole,
      isActive: targetUser.isActive,
      avatarUrl: targetUser.avatarUrl,
      createdAt: targetUser.createdAt,
      updatedAt: new Date(),
    });

    return this.userRepository.update(updatedUser);
  }
}
