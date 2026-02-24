import { User, UserRole } from '@users/domain/entities/user.entity';
import { UserRepositoryPort } from '@users/domain/ports/out/user.repository.port';

export class InMemoryUserRepository implements UserRepositoryPort {
  private users: User[] = [];

  save(user: User): Promise<User> {
    this.users.push(user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find(
        (u) => u.email.getValue().toLowerCase() === email.toLowerCase(),
      ) ?? null,
    );
  }

  findAll(): Promise<User[]> {
    return Promise.resolve([...this.users]);
  }

  update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
    return Promise.resolve(user);
  }

  delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
    return Promise.resolve();
  }

  existsByEmail(email: string): Promise<boolean> {
    return Promise.resolve(
      this.users.some(
        (u) => u.email.getValue().toLowerCase() === email.toLowerCase(),
      ),
    );
  }

  countByRole(role: UserRole): Promise<number> {
    return Promise.resolve(this.users.filter((u) => u.role === role).length);
  }

  clear(): void {
    this.users = [];
  }
}
