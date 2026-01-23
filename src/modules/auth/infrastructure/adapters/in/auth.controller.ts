import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../../../application/services/auth.service';
import { LoginDto } from '../../../application/dto/login.dto';
import { RegisterDto } from '../../../application/dto/register.dto';
import { RefreshTokenDto } from '../../../application/dto/refresh-token.dto';
import { AuthResponseDto } from '../../../application/dto/auth-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../../../../shared/infrastructure/decorators/current-user.decorator';

/**
 * Authentication Controller
 *
 * Handles all authentication-related HTTP requests including user registration,
 * login, token refresh, and logout operations. This controller serves as the
 * entry point for the authentication module's REST API.
 *
 * @class AuthController
 * @route /auth
 */
@Controller('auth')
export class AuthController {
  /**
   * Creates an instance of AuthController.
   *
   * @param {AuthService} authService - The authentication service for handling business logic
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user in the system.
   *
   * Creates a new user account with the provided credentials and returns
   * authentication tokens upon successful registration.
   *
   * @param {RegisterDto} registerDto - The registration data containing user credentials
   * @returns {Promise<AuthResponseDto>} Authentication response with access token, refresh token, and user ID
   * @throws {ConflictException} If a user with the same email already exists
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const result = await this.authService.register(registerDto);
    return AuthResponseDto.create(
      result.accessToken,
      result.refreshToken,
      result.userId,
    );
  }

  /**
   * Authenticates a user and returns access tokens.
   *
   * Validates the user credentials and generates a new pair of access
   * and refresh tokens for the authenticated session.
   *
   * @param {LoginDto} loginDto - The login credentials (email and password)
   * @returns {Promise<AuthResponseDto>} Authentication response with access and refresh tokens
   * @throws {UnauthorizedException} If the credentials are invalid
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);
    return AuthResponseDto.create(result.accessToken, result.refreshToken);
  }

  /**
   * Refreshes the authentication tokens using a valid refresh token.
   *
   * Validates the provided refresh token and issues a new pair of
   * access and refresh tokens. The old refresh token is invalidated.
   *
   * @param {RefreshTokenDto} refreshTokenDto - The DTO containing the refresh token
   * @returns {Promise<AuthResponseDto>} New authentication response with fresh tokens
   * @throws {UnauthorizedException} If the refresh token is invalid or expired
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
    );
    return AuthResponseDto.create(result.accessToken, result.refreshToken);
  }

  /**
   * Logs out the user from the current session.
   *
   * Invalidates the specified refresh token, effectively ending the
   * current session. Requires a valid JWT access token for authorization.
   *
   * @param {RefreshTokenDto} refreshTokenDto - The DTO containing the refresh token to invalidate
   * @returns {Promise<void>} No content on successful logout
   * @throws {UnauthorizedException} If the access token is invalid or missing
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  /**
   * Logs out the user from all active sessions.
   *
   * Invalidates all refresh tokens associated with the user, effectively
   * ending all active sessions across all devices. Requires a valid JWT
   * access token for authorization.
   *
   * @param {string} userId - The ID of the authenticated user (extracted from JWT)
   * @returns {Promise<void>} No content on successful logout from all sessions
   * @throws {UnauthorizedException} If the access token is invalid or missing
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser('userId') userId: string): Promise<void> {
    await this.authService.logoutAll(userId);
  }
}
