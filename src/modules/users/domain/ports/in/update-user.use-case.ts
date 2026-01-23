import { User } from '../../entities/user.entity';

export interface UpdateUserCommand {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UpdateUserUseCase {
  execute(id: string, command: UpdateUserCommand): Promise<User>;
}
