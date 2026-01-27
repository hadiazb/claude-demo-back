import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@users/application/services';
import { JwtPayload } from '@auth/application/services';

/**
 * Passport JWT authentication strategy for validating access tokens.
 * Extends PassportStrategy to integrate with NestJS authentication guards.
 * Extracts JWT from the Authorization header as a Bearer token.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  /**
   * Creates a new instance of JwtStrategy.
   * Configures the JWT validation options including secret and token extraction.
   * @param configService - NestJS config service for accessing JWT configuration
   * @param userService - Service for user-related operations
   * @throws Error if JWT access secret is not configured
   */
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const secretOrKey = configService.get<string>('jwt.accessSecret');
    if (!secretOrKey) {
      throw new Error('JWT access secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  /**
   * Validates the JWT payload after token verification.
   * Called automatically by Passport after successful token decoding.
   * Verifies that the user exists and is active in the system.
   * @param payload - The decoded JWT payload containing user information
   * @returns Object containing userId and email for the authenticated request
   * @throws UnauthorizedException if user is not found or is disabled
   */
  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or disabled');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
