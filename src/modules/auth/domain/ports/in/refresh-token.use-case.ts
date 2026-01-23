import { AuthTokens } from './login.use-case';

export interface RefreshTokenUseCase {
  execute(refreshToken: string): Promise<AuthTokens>;
}
