import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken, TokenRepositoryPort } from '@auth/domain';
import { RefreshTokenOrmEntity } from '@auth/infrastructure/persistence';

@Injectable()
export class TokenRepositoryAdapter implements TokenRepositoryPort {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly tokenRepository: Repository<RefreshTokenOrmEntity>,
  ) {}

  async saveRefreshToken(token: RefreshToken): Promise<RefreshToken> {
    const ormEntity = this.toOrmEntity(token);
    const savedEntity = await this.tokenRepository.save(ormEntity);
    return this.toDomain(savedEntity);
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const ormEntity = await this.tokenRepository.findOne({
      where: { token },
    });
    return ormEntity ? this.toDomain(ormEntity) : null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.tokenRepository.update({ token }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.tokenRepository.update({ userId }, { isRevoked: true });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.tokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  private toDomain(ormEntity: RefreshTokenOrmEntity): RefreshToken {
    return new RefreshToken({
      id: ormEntity.id,
      token: ormEntity.token,
      userId: ormEntity.userId,
      expiresAt: ormEntity.expiresAt,
      isRevoked: ormEntity.isRevoked,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  private toOrmEntity(domain: RefreshToken): RefreshTokenOrmEntity {
    const ormEntity = new RefreshTokenOrmEntity();
    ormEntity.id = domain.id;
    ormEntity.token = domain.token;
    ormEntity.userId = domain.userId;
    ormEntity.expiresAt = domain.expiresAt;
    ormEntity.isRevoked = domain.isRevoked;
    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt;
    return ormEntity;
  }
}
