import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@users/domain/entities';

export const ROLES_KEY = 'roles';

/**
 * Decorator that specifies which roles are allowed to access a route.
 * Use with RolesGuard to enforce role-based access control.
 *
 * @example
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * getAdminData() { ... }
 *
 * @example
 * @Roles(UserRole.ADMIN, UserRole.USER)
 * @Get('any-authenticated')
 * getData() { ... }
 *
 * @param roles - One or more UserRole values that are allowed access
 * @returns MethodDecorator that sets the roles metadata
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
