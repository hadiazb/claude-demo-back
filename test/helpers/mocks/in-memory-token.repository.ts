import { RefreshToken } from '@auth/domain/entities/refresh-token.entity';
import { TokenRepositoryPort } from '@auth/domain/ports/out/token.repository.port';

export class InMemoryTokenRepository implements TokenRepositoryPort {
  private tokens: RefreshToken[] = [];

  saveRefreshToken(token: RefreshToken): Promise<RefreshToken> {
    this.tokens.push(token);
    return Promise.resolve(token);
  }

  findRefreshToken(token: string): Promise<RefreshToken | null> {
    return Promise.resolve(this.tokens.find((t) => t.token === token) ?? null);
  }

  revokeRefreshToken(token: string): Promise<void> {
    const index = this.tokens.findIndex((t) => t.token === token);
    if (index !== -1) {
      const existing = this.tokens[index];
      this.tokens[index] = new RefreshToken({
        id: existing.id,
        token: existing.token,
        userId: existing.userId,
        expiresAt: existing.expiresAt,
        isRevoked: true,
        createdAt: existing.createdAt,
        updatedAt: new Date(),
      });
    }
    return Promise.resolve();
  }

  revokeAllUserTokens(userId: string): Promise<void> {
    this.tokens = this.tokens.map((t) => {
      if (t.userId === userId && !t.isRevoked) {
        return new RefreshToken({
          id: t.id,
          token: t.token,
          userId: t.userId,
          expiresAt: t.expiresAt,
          isRevoked: true,
          createdAt: t.createdAt,
          updatedAt: new Date(),
        });
      }
      return t;
    });
    return Promise.resolve();
  }

  deleteExpiredTokens(): Promise<void> {
    this.tokens = this.tokens.filter((t) => !t.isExpired());
    return Promise.resolve();
  }

  clear(): void {
    this.tokens = [];
  }
}
