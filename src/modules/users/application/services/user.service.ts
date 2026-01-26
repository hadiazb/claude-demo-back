import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
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

@Injectable()
export class UserService {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

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
      age: command.age,
      role: command.role || UserRole.USER,
      isActive: true,
      avatarUrl: command.avatarUrl || null,
    });

    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

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
}
