import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Authentication guard for protecting routes that require a valid access token.
 * Extends Passport's AuthGuard to use the 'jwt' strategy.
 * Apply this guard to endpoints that require authenticated user access.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
