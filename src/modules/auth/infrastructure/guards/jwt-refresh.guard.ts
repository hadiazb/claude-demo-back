import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Authentication guard for protecting routes that require refresh token validation.
 * Extends Passport's AuthGuard to use the 'jwt-refresh' strategy.
 * Apply this guard to endpoints that handle token refresh operations.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
