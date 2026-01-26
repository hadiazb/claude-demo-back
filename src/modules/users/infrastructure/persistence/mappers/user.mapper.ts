import { User, Email, Password } from '@users/domain';
import { UserOrmEntity } from '@users/infrastructure/persistence/entities';

export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return new User({
      id: ormEntity.id,
      email: new Email(ormEntity.email),
      password: Password.fromHash(ormEntity.password),
      firstName: ormEntity.firstName,
      lastName: ormEntity.lastName,
      age: ormEntity.age,
      role: ormEntity.role,
      isActive: ormEntity.isActive,
      avatarUrl: ormEntity.avatarUrl,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  static toPersistence(domainEntity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.email = domainEntity.email.getValue();
    ormEntity.password = domainEntity.password.getValue();
    ormEntity.firstName = domainEntity.firstName;
    ormEntity.lastName = domainEntity.lastName;
    ormEntity.age = domainEntity.age;
    ormEntity.role = domainEntity.role;
    ormEntity.isActive = domainEntity.isActive;
    ormEntity.avatarUrl = domainEntity.avatarUrl;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    return ormEntity;
  }
}
