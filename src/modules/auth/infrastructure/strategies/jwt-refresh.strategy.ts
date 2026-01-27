import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '@auth/application/services';

/**
 * Interface representing the expected request body for refresh token operations.
 */
interface RefreshTokenBody {
  /** The JWT refresh token string from the request body */
  refreshToken: string;
}

/**
 * Passport JWT strategy for validating refresh tokens.
 * Extends PassportStrategy to integrate with NestJS authentication guards.
 * Extracts JWT from the request body's refreshToken field.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  /**
   * Creates a new instance of JwtRefreshStrategy.
   * Configures the JWT validation options for refresh tokens.
   * @param configService - NestJS config service for accessing JWT configuration
   * @throws Error if JWT refresh secret is not configured
   */
  constructor(configService: ConfigService) {
    const secretOrKey = configService.get<string>('jwt.refreshSecret');
    if (!secretOrKey) {
      throw new Error('JWT refresh secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey,
      passReqToCallback: true,
    });
  }

  /**
   * Validates the refresh token payload after token verification.
   * Called automatically by Passport after successful token decoding.
   * Extracts and returns user information along with the refresh token.
   * @param req - The Express request object containing the refresh token in the body
   * @param payload - The decoded JWT payload containing user information
   * @returns Object containing userId, email, and the refresh token for further processing
   */
  validate(
    req: Request<unknown, unknown, RefreshTokenBody>,
    payload: JwtPayload,
  ) {
    const refreshToken = req.body.refreshToken;
    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
