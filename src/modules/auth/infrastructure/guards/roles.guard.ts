import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@users/domain/entities';
import { ROLES_KEY } from '@shared/infrastructure/decorators/roles.decorator';

/**
 * Guard that enforces role-based access control on routes.
 * Works in conjunction with the @Roles() decorator.
 * Must be used after JwtAuthGuard to ensure user is authenticated.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * @Get('admin')
 * getAdminData() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current user has the required role(s) to access the route.
   *
   * @param context - The execution context containing the request
   * @returns true if no roles are required or user has a required role, false otherwise
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { role: UserRole } }>();

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
