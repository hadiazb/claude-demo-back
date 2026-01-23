export interface LoginCommand {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginUseCase {
  execute(command: LoginCommand): Promise<AuthTokens>;
}
