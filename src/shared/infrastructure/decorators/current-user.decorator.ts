import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extended Express Request interface that includes an optional user property.
 * Used to type requests after authentication middleware has attached user data.
 */
interface RequestWithUser extends Request {
  user?: Record<string, unknown>;
}

/**
 * Custom parameter decorator that extracts the current authenticated user from the request.
 * Can be used to get the entire user object or a specific property.
 *
 * @example
 * // Get the entire user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) { ... }
 *
 * @example
 * // Get a specific user property
 * @Get('profile')
 * getProfile(@CurrentUser('id') userId: string) { ... }
 *
 * @param data - Optional property name to extract from the user object
 * @returns The entire user object if no data parameter is provided, or the specified property value
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
