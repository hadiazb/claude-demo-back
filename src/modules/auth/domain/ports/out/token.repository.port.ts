import { RefreshToken } from '../../entities/refresh-token.entity';

export interface TokenRepositoryPort {
  saveRefreshToken(token: RefreshToken): Promise<RefreshToken>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  revokeRefreshToken(token: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}
