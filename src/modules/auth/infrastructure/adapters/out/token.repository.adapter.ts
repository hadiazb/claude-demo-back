import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken, TokenRepositoryPort } from '@auth/domain';
import { RefreshTokenOrmEntity } from '@auth/infrastructure/persistence';

/**
 * Infrastructure adapter implementing the TokenRepositoryPort interface.
 * Handles persistence of refresh tokens using TypeORM.
 * Part of the Hexagonal Architecture's output adapters (driven side).
 */
@Injectable()
export class TokenRepositoryAdapter implements TokenRepositoryPort {
  /**
   * Creates a new instance of TokenRepositoryAdapter.
   * @param tokenRepository - TypeORM repository for RefreshTokenOrmEntity operations
   */
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly tokenRepository: Repository<RefreshTokenOrmEntity>,
  ) {}

  /**
   * Persists a refresh token to the database.
   * Converts the domain entity to ORM entity before saving.
   * @param token - The RefreshToken domain entity to save
   * @returns Promise resolving to the saved RefreshToken domain entity
   */
  async saveRefreshToken(token: RefreshToken): Promise<RefreshToken> {
    const ormEntity = this.toOrmEntity(token);
    const savedEntity = await this.tokenRepository.save(ormEntity);
    return this.toDomain(savedEntity);
  }

  /**
   * Retrieves a refresh token from the database by its token string.
   * @param token - The JWT refresh token string to search for
   * @returns Promise resolving to the RefreshToken domain entity if found, or null if not found
   */
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const ormEntity = await this.tokenRepository.findOne({
      where: { token },
    });
    return ormEntity ? this.toDomain(ormEntity) : null;
  }

  /**
   * Revokes a specific refresh token by marking it as invalid in the database.
   * @param token - The JWT refresh token string to revoke
   * @returns Promise resolving when the token is revoked
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.tokenRepository.update({ token }, { isRevoked: true });
  }

  /**
   * Revokes all refresh tokens belonging to a specific user.
   * Used for logging out a user from all devices/sessions.
   * @param userId - The unique identifier of the user whose tokens to revoke
   * @returns Promise resolving when all user tokens are revoked
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.tokenRepository.update({ userId }, { isRevoked: true });
  }

  /**
   * Deletes all expired tokens from the database.
   * Removes tokens where expiresAt is less than the current date.
   * @returns Promise resolving when expired tokens are deleted
   */
  async deleteExpiredTokens(): Promise<void> {
    await this.tokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  /**
   * Converts a TypeORM entity to a domain entity.
   * Maps all ORM properties to the RefreshToken domain model.
   * @param ormEntity - The TypeORM entity to convert
   * @returns The corresponding RefreshToken domain entity
   */
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

  /**
   * Converts a domain entity to a TypeORM entity.
   * Maps all domain properties to the ORM model for persistence.
   * @param domain - The RefreshToken domain entity to convert
   * @returns The corresponding TypeORM entity ready for database operations
   */
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
