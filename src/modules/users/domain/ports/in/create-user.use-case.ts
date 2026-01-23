import { User, UserRole } from '../../entities/user.entity';

export interface CreateUserCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface CreateUserUseCase {
  execute(command: CreateUserCommand): Promise<User>;
}
