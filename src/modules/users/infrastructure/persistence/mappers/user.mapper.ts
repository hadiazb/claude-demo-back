import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return new User({
      id: ormEntity.id,
      email: new Email(ormEntity.email),
      password: Password.fromHash(ormEntity.password),
      firstName: ormEntity.firstName,
      lastName: ormEntity.lastName,
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
    ormEntity.role = domainEntity.role;
    ormEntity.isActive = domainEntity.isActive;
    ormEntity.avatarUrl = domainEntity.avatarUrl;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    return ormEntity;
  }
}
