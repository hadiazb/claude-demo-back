/**
 * Data Transfer Object for authentication API responses.
 * Contains the JWT tokens issued after successful authentication.
 */
export class AuthResponseDto {
  /** JWT access token for authenticating API requests */
  accessToken: string;
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string;
  /** Optional unique identifier of the authenticated user */
  userId?: string;

  /**
   * Factory method that creates an AuthResponseDto instance.
   * @param accessToken - The JWT access token to include in the response
   * @param refreshToken - The JWT refresh token to include in the response
   * @param userId - Optional user identifier to include in the response
   * @returns A new AuthResponseDto instance populated with the provided tokens
   */
  static create(
    accessToken: string,
    refreshToken: string,
    userId?: string,
  ): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.accessToken = accessToken;
    dto.refreshToken = refreshToken;
    if (userId) {
      dto.userId = userId;
    }
    return dto;
  }
}
