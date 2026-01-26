import { UserRole } from '../../../../users/domain/entities/user.entity';

export interface RegisterCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  role?: UserRole;
  avatarUrl?: string;
}

export interface RegisterResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface RegisterUseCase {
  execute(command: RegisterCommand): Promise<RegisterResult>;
}
