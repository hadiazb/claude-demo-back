import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for token refresh requests.
 * Contains the refresh token required to obtain new access tokens.
 * Uses class-validator decorators for input validation.
 */
export class RefreshTokenDto {
  /**
   * JWT refresh token for obtaining a new access token.
   * Must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
