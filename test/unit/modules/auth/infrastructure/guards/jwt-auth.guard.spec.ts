/**
 * ============================================================================
 * UNIT TESTS: JwtAuthGuard
 * ============================================================================
 *
 * This file contains unit tests for the JwtAuthGuard.
 *
 * WHAT IS JwtAuthGuard?
 * JwtAuthGuard is a NestJS guard that protects routes requiring authentication.
 * It extends Passport's AuthGuard and uses the 'jwt' strategy to validate
 * access tokens from the Authorization header.
 *
 * HOW DOES IT WORK?
 * 1. Intercepts incoming requests to protected routes
 * 2. Extracts the Bearer token from the Authorization header
 * 3. Delegates validation to the 'jwt' Passport strategy
 * 4. Allows or denies access based on token validity
 *
 * TESTING APPROACH:
 * Since JwtAuthGuard is a thin wrapper around Passport's AuthGuard,
 * we focus on verifying:
 * - Correct instantiation
 * - Proper extension of AuthGuard
 * - Correct strategy name ('jwt')
 */

import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  /**
   * =========================================================================
   * SECTION 1: INSTANTIATION TESTS
   * =========================================================================
   */
  describe('instantiation', () => {
    it('should create an instance of JwtAuthGuard', () => {
      /**
       * TEST: Basic instantiation
       *
       * Verify that the guard can be instantiated without errors.
       */
      const guard = new JwtAuthGuard();

      expect(guard).toBeDefined();
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });

    it('should extend AuthGuard', () => {
      /**
       * TEST: Inheritance verification
       *
       * JwtAuthGuard must extend Passport's AuthGuard to leverage
       * the authentication infrastructure.
       */
      const guard = new JwtAuthGuard();

      // AuthGuard('jwt') returns a class, and our guard should be an instance of it
      const JwtAuthGuardBase = AuthGuard('jwt');
      expect(guard).toBeInstanceOf(JwtAuthGuardBase);
    });
  });

  /**
   * =========================================================================
   * SECTION 2: GUARD INTERFACE TESTS
   * =========================================================================
   */
  describe('CanActivate interface', () => {
    it('should have canActivate method from AuthGuard', () => {
      /**
       * TEST: CanActivate implementation
       *
       * Guards must implement the CanActivate interface which requires
       * a canActivate method that returns boolean or Promise<boolean>.
       */
      const guard = new JwtAuthGuard();

      expect(typeof guard.canActivate).toBe('function');
    });

    it('should have getRequest method from AuthGuard', () => {
      /**
       * TEST: Request extraction method
       *
       * AuthGuard provides getRequest method used internally
       * for extracting the request from the execution context.
       */
      const guard = new JwtAuthGuard();

      expect(typeof guard.getRequest).toBe('function');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: STRATEGY CONFIGURATION TESTS
   * =========================================================================
   */
  describe('strategy configuration', () => {
    it('should use jwt strategy name', () => {
      /**
       * TEST: Strategy name verification
       *
       * The guard must use 'jwt' as the strategy name to connect
       * with the JwtStrategy that handles token validation.
       *
       * Note: We can't directly access the strategy name, but we verify
       * by checking that the guard is an instance of AuthGuard('jwt').
       */
      const guard = new JwtAuthGuard();
      const JwtAuthGuardBase = AuthGuard('jwt');

      // If the guard uses a different strategy, this would fail
      expect(guard).toBeInstanceOf(JwtAuthGuardBase);
    });

    it('should not be instance of AuthGuard with different strategy', () => {
      /**
       * TEST: Strategy specificity
       *
       * Verify the guard specifically uses 'jwt' and not another strategy.
       * This ensures we're using the access token strategy, not refresh.
       */
      const guard = new JwtAuthGuard();
      const RefreshGuardBase = AuthGuard('jwt-refresh');

      // JwtAuthGuard should NOT be an instance of jwt-refresh guard
      expect(guard).not.toBeInstanceOf(RefreshGuardBase);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: DECORATOR TESTS
   * =========================================================================
   */
  describe('decorator application', () => {
    it('should be a class that can be used as a guard', () => {
      /**
       * TEST: Guard usability
       *
       * Verify the guard is a proper class that can be applied
       * via @UseGuards() decorator.
       */
      expect(JwtAuthGuard).toBeDefined();
      expect(typeof JwtAuthGuard).toBe('function');
      expect(JwtAuthGuard.prototype).toBeDefined();
    });

    it('should be instantiable without constructor arguments', () => {
      /**
       * TEST: No-arg constructor
       *
       * Guards applied via @UseGuards() are instantiated by NestJS
       * and should work without explicit constructor arguments.
       */
      expect(() => new JwtAuthGuard()).not.toThrow();
    });
  });
});
