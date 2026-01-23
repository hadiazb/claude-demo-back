export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  userId?: string;

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
