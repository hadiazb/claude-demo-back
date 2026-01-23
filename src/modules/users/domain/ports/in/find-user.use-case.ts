import { User } from '../../entities/user.entity';

export interface FindUserUseCase {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}
