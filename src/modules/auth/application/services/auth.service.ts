import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { INJECTION_TOKENS } from '@shared';
import { UserService } from '@users/application/services';
import {
  TokenRepositoryPort,
  RefreshToken,
  LoginCommand,
  AuthTokens,
  RegisterCommand,
  RegisterResult,
} from '@auth/domain';

/**
 * Interface representing the payload structure of JWT tokens.
 */
export interface JwtPayload {
  /** Subject claim - the user's unique identifier */
  sub: string;
  /** User's email address */
  email: string;
  /** User's role for authorization */
  role: string;
}

/**
 * Application service implementing authentication-related use cases.
 * Handles user login, registration, token generation, and token management.
 * Uses JWT for access and refresh token generation.
 */
@Injectable()
export class AuthService {
  /**
   * Creates a new instance of AuthService.
   * @param userService - Service for user-related operations
   * @param jwtService - NestJS JWT service for token generation and verification
   * @param configService - NestJS config service for accessing JWT secrets
   * @param tokenRepository - Repository port for refresh token persistence
   */
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(INJECTION_TOKENS.TOKEN_REPOSITORY)
    private readonly tokenRepository: TokenRepositoryPort,
  ) {}

  /**
   * Authenticates a user with email and password credentials.
   * Validates credentials and generates new access and refresh tokens.
   * @param command - Object containing login credentials (email and password)
   * @returns Promise resolving to AuthTokens containing access and refresh tokens
   * @throws UnauthorizedException if credentials are invalid or user is disabled
   */
  async login(command: LoginCommand): Promise<AuthTokens> {
    const user = await this.userService.findByEmail(command.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(command.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    return this.generateTokens(user.id, user.email.getValue(), user.role);
  }

  /**
   * Registers a new user in the system.
   * Creates a user account and generates initial authentication tokens.
   * @param command - Object containing registration data (email, password, name, etc.)
   * @returns Promise resolving to RegisterResult with tokens and user ID
   * @throws ConflictException if the email is already registered
   */
  async register(command: RegisterCommand): Promise<RegisterResult> {
    const existingUser = await this.userService.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.userService.createUser({
      email: command.email,
      password: command.password,
      firstName: command.firstName,
      lastName: command.lastName,
      age: command.age,
      role: command.role,
      avatarUrl: command.avatarUrl,
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email.getValue(),
      user.role,
    );

    return {
      ...tokens,
      userId: user.id,
    };
  }

  /**
   * Refreshes authentication tokens using a valid refresh token.
   * Revokes the old refresh token and generates new access and refresh tokens.
   * @param refreshToken - The current refresh token to validate and exchange
   * @returns Promise resolving to new AuthTokens
   * @throws UnauthorizedException if refresh token is invalid, expired, or user is disabled
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const storedToken =
      await this.tokenRepository.findRefreshToken(refreshToken);

    if (!storedToken || !storedToken.isValid()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userService.findById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or disabled');
    }

    await this.tokenRepository.revokeRefreshToken(refreshToken);

    return this.generateTokens(user.id, user.email.getValue(), user.role);
  }

  /**
   * Logs out a user by revoking their refresh token.
   * Invalidates the specified refresh token preventing further token refresh.
   * @param refreshToken - The refresh token to revoke
   * @returns Promise resolving when the token is revoked
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenRepository.revokeRefreshToken(refreshToken);
  }

  /**
   * Logs out a user from all devices by revoking all their refresh tokens.
   * Invalidates all refresh tokens associated with the user.
   * @param userId - The unique identifier of the user to log out
   * @returns Promise resolving when all tokens are revoked
   */
  async logoutAll(userId: string): Promise<void> {
    await this.tokenRepository.revokeAllUserTokens(userId);
  }

  /**
   * Generates new access and refresh tokens for a user.
   * Creates JWT tokens with configured secrets and expiration times.
   * Persists the refresh token in the repository for later validation.
   * @param userId - The unique identifier of the user
   * @param email - The user's email address
   * @param role - The user's role for authorization
   * @returns Promise resolving to AuthTokens containing access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessSecret = this.configService.get<string>('jwt.accessSecret')!;
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;

    const accessOptions: JwtSignOptions = {
      secret: accessSecret,
      expiresIn: 900, // 15 minutes in seconds
    };

    const refreshOptions: JwtSignOptions = {
      secret: refreshSecret,
      expiresIn: 604800, // 7 days in seconds
    };

    const accessToken = this.jwtService.sign(payload, accessOptions);
    const refreshToken = this.jwtService.sign(payload, refreshOptions);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenEntity = new RefreshToken({
      id: uuidv4(),
      token: refreshToken,
      userId,
      expiresAt,
      isRevoked: false,
    });

    await this.tokenRepository.saveRefreshToken(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  /**
   * Validates an access token and extracts its payload.
   * Verifies the token signature and expiration using the configured secret.
   * @param token - The JWT access token to validate
   * @returns The decoded JwtPayload if valid, or null if invalid/expired
   */
  validateAccessToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });
    } catch {
      return null;
    }
  }
}
