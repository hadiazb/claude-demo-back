/**
 * ============================================================================
 * UNIT TESTS: RolesGuard
 * ============================================================================
 *
 * This file contains unit tests for the RolesGuard.
 *
 * WHAT IS A GUARD?
 * A guard in NestJS is a class that determines whether a request should be
 * handled by the route handler. Guards are used for:
 * - Authentication (is the user logged in?)
 * - Authorization (does the user have permission?)
 *
 * WHAT DOES RolesGuard DO?
 * RolesGuard implements Role-Based Access Control (RBAC):
 * 1. Reads required roles from route metadata (set by @Roles decorator)
 * 2. Compares against the authenticated user's role
 * 3. Allows access if user has one of the required roles
 *
 * BUSINESS RULES:
 * - If no roles are required (@Roles not used), allow access
 * - If roles are required but user has no role, deny access
 * - If user's role matches ANY required role, allow access
 * - Must be used AFTER JwtAuthGuard (user must be authenticated first)
 */

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '@auth/infrastructure/guards/roles.guard';
import { UserRole } from '@users/domain/entities/user.entity';
import { ROLES_KEY } from '@shared/infrastructure/decorators/roles.decorator';

describe('RolesGuard', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST SETUP AND MOCKS
   * =========================================================================
   */

  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;

  // Helper to create mock ExecutionContext with a user
  const createMockExecutionContext = (
    user: { role: UserRole } | null | undefined,
  ) => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as jest.Mocked<ExecutionContext>;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
      getAllAndMerge: jest.fn(),
    } as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
    mockExecutionContext = createMockExecutionContext({ role: UserRole.USER });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================================================
   * SECTION 2: CONSTRUCTOR TESTS
   * =========================================================================
   */
  describe('constructor', () => {
    it('should create an instance of RolesGuard', () => {
      expect(guard).toBeInstanceOf(RolesGuard);
    });

    it('should implement CanActivate interface', () => {
      expect(typeof guard.canActivate).toBe('function');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: NO ROLES REQUIRED TESTS
   * =========================================================================
   */
  describe('when no roles are required', () => {
    it('should return true when @Roles decorator is not used (null)', () => {
      /**
       * TEST: Route without @Roles decorator
       *
       * If a route doesn't use @Roles, it means no specific role is required.
       * Any authenticated user should be able to access it.
       */
      reflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when @Roles decorator is not used (undefined)', () => {
      /**
       * TEST: Route without @Roles decorator (undefined case)
       */
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when @Roles decorator has empty array', () => {
      /**
       * TEST: @Roles() with no arguments
       *
       * Edge case: decorator used but no roles specified.
       */
      reflector.getAllAndOverride.mockReturnValue([]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should call reflector.getAllAndOverride with correct parameters', () => {
      /**
       * TEST: Verify reflector is called correctly
       *
       * The guard should look for roles metadata using the ROLES_KEY
       * and check both handler and class level.
       */
      reflector.getAllAndOverride.mockReturnValue(null);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: USER WITH REQUIRED ROLE TESTS
   * =========================================================================
   */
  describe('when user has required role', () => {
    it('should return true when user has the exact required role', () => {
      /**
       * TEST: User with matching role
       *
       * Simple case: route requires ADMIN, user is ADMIN.
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.ADMIN,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when user role matches one of multiple required roles', () => {
      /**
       * TEST: Multiple allowed roles
       *
       * Route allows both ADMIN and USER, user is USER.
       * Should pass because USER is in the allowed list.
       */
      reflector.getAllAndOverride.mockReturnValue([
        UserRole.ADMIN,
        UserRole.USER,
      ]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.USER,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when ADMIN accesses route requiring ADMIN or USER', () => {
      /**
       * TEST: Higher privilege user accessing mixed-role route
       *
       * ADMIN should be able to access routes that allow ADMIN or USER.
       */
      reflector.getAllAndOverride.mockReturnValue([
        UserRole.ADMIN,
        UserRole.USER,
      ]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.ADMIN,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true for USER accessing USER-only route', () => {
      /**
       * TEST: Standard user accessing user route
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.USER,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });

  /**
   * =========================================================================
   * SECTION 5: USER WITHOUT REQUIRED ROLE TESTS
   * =========================================================================
   */
  describe('when user does not have required role', () => {
    it('should return false when USER tries to access ADMIN-only route', () => {
      /**
       * TEST: Insufficient privileges
       *
       * Standard user trying to access admin route should be denied.
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.USER,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user role does not match any required role', () => {
      /**
       * TEST: No matching role in list
       *
       * If route requires specific roles and user has none of them, deny.
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.USER,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });
  });

  /**
   * =========================================================================
   * SECTION 6: MISSING USER OR ROLE TESTS
   * =========================================================================
   */
  describe('when user or role is missing', () => {
    it('should return false when user is null', () => {
      /**
       * TEST: No user in request
       *
       * This happens if RolesGuard is used without JwtAuthGuard.
       * Should deny access as we can't verify the user's role.
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext(null);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user is undefined', () => {
      /**
       * TEST: User undefined in request
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user exists but has no role property', () => {
      /**
       * TEST: User object without role
       *
       * Edge case: user object exists but role is missing.
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      const contextWithUserNoRole = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: {} }),
        }),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as jest.Mocked<ExecutionContext>;

      const result = guard.canActivate(contextWithUserNoRole);

      expect(result).toBe(false);
    });

    it('should return false when user.role is null', () => {
      /**
       * TEST: User with null role
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      const contextWithNullRole = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: null } }),
        }),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as jest.Mocked<ExecutionContext>;

      const result = guard.canActivate(contextWithNullRole);

      expect(result).toBe(false);
    });

    it('should return false when user.role is undefined', () => {
      /**
       * TEST: User with undefined role
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      const contextWithUndefinedRole = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: undefined } }),
        }),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as jest.Mocked<ExecutionContext>;

      const result = guard.canActivate(contextWithUndefinedRole);

      expect(result).toBe(false);
    });
  });

  /**
   * =========================================================================
   * SECTION 7: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle single role in array', () => {
      /**
       * TEST: Single role requirement
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.ADMIN,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should use strict equality for role comparison', () => {
      /**
       * TEST: Role comparison is strict
       *
       * The guard uses === for comparison, not loose equality.
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.ADMIN,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should check handler metadata before class metadata', () => {
      /**
       * TEST: Metadata priority
       *
       * getAllAndOverride checks handler first, then class.
       * Handler-level @Roles should override class-level.
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);

      guard.canActivate(mockExecutionContext);

      // Verify the order: handler first, then class
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        ROLES_KEY,
        expect.arrayContaining([
          mockExecutionContext.getHandler(),
          mockExecutionContext.getClass(),
        ]),
      );
    });

    it('should allow access even without roles when no roles required', () => {
      /**
       * TEST: No roles required, user has no role
       *
       * If the route doesn't require any roles, even a user without
       * a role should be allowed (useful for public authenticated routes).
       */
      reflector.getAllAndOverride.mockReturnValue(null);
      mockExecutionContext = createMockExecutionContext(null);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });

  /**
   * =========================================================================
   * SECTION 8: INTEGRATION-LIKE TESTS
   * =========================================================================
   */
  describe('realistic scenarios', () => {
    it('should protect admin dashboard from regular users', () => {
      /**
       * SCENARIO: Admin dashboard protection
       *
       * Route: GET /admin/dashboard
       * Required: ADMIN role
       * User: Regular USER
       * Expected: Denied
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.USER,
      });

      expect(guard.canActivate(mockExecutionContext)).toBe(false);
    });

    it('should allow admin to access admin dashboard', () => {
      /**
       * SCENARIO: Admin accessing admin route
       *
       * Route: GET /admin/dashboard
       * Required: ADMIN role
       * User: ADMIN
       * Expected: Allowed
       */
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.ADMIN,
      });

      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });

    it('should allow any authenticated user to access shared routes', () => {
      /**
       * SCENARIO: Shared route for all authenticated users
       *
       * Route: GET /profile
       * Required: ADMIN or USER
       * User: USER
       * Expected: Allowed
       */
      reflector.getAllAndOverride.mockReturnValue([
        UserRole.ADMIN,
        UserRole.USER,
      ]);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.USER,
      });

      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });

    it('should allow unprotected authenticated routes', () => {
      /**
       * SCENARIO: Route without role requirements
       *
       * Route: GET /public-data (after auth)
       * Required: None (no @Roles decorator)
       * User: Any authenticated user
       * Expected: Allowed
       */
      reflector.getAllAndOverride.mockReturnValue(null);
      mockExecutionContext = createMockExecutionContext({
        role: UserRole.USER,
      });

      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });
  });
});
