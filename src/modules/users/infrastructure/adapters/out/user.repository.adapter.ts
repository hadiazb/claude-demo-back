import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../../domain/ports/out/user.repository.port';
import { UserOrmEntity } from '../../persistence/entities/user.orm-entity';
import { UserMapper } from '../../persistence/mappers/user.mapper';

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const ormEntity = UserMapper.toPersistence(user);
    const savedEntity = await this.userRepository.save(ormEntity);
    return UserMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({ where: { id } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<User[]> {
    const ormEntities = await this.userRepository.find();
    return ormEntities.map((entity) => UserMapper.toDomain(entity));
  }

  async update(user: User): Promise<User> {
    const ormEntity = UserMapper.toPersistence(user);
    const updatedEntity = await this.userRepository.save(ormEntity);
    return UserMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }
}
