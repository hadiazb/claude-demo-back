/**
 * ============================================================================
 * UNIT TESTS: JwtRefreshGuard
 * ============================================================================
 *
 * This file contains unit tests for the JwtRefreshGuard.
 *
 * WHAT IS JwtRefreshGuard?
 * JwtRefreshGuard is a NestJS guard that protects routes handling token refresh.
 * It extends Passport's AuthGuard and uses the 'jwt-refresh' strategy to validate
 * refresh tokens from the request body.
 *
 * HOW DOES IT WORK?
 * 1. Intercepts incoming requests to token refresh endpoints
 * 2. Extracts the refresh token from the request body
 * 3. Delegates validation to the 'jwt-refresh' Passport strategy
 * 4. Allows or denies access based on refresh token validity
 *
 * DIFFERENCE FROM JwtAuthGuard:
 * - JwtAuthGuard: Uses access tokens from Authorization header
 * - JwtRefreshGuard: Uses refresh tokens from request body
 */

import { JwtRefreshGuard } from '@auth/infrastructure/guards/jwt-refresh.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtRefreshGuard', () => {
  /**
   * =========================================================================
   * SECTION 1: INSTANTIATION TESTS
   * =========================================================================
   */
  describe('instantiation', () => {
    it('should create an instance of JwtRefreshGuard', () => {
      /**
       * TEST: Basic instantiation
       *
       * Verify that the guard can be instantiated without errors.
       */
      const guard = new JwtRefreshGuard();

      expect(guard).toBeDefined();
      expect(guard).toBeInstanceOf(JwtRefreshGuard);
    });

    it('should extend AuthGuard', () => {
      /**
       * TEST: Inheritance verification
       *
       * JwtRefreshGuard must extend Passport's AuthGuard to leverage
       * the authentication infrastructure.
       */
      const guard = new JwtRefreshGuard();

      // AuthGuard('jwt-refresh') returns a class, and our guard should be an instance
      const JwtRefreshGuardBase = AuthGuard('jwt-refresh');
      expect(guard).toBeInstanceOf(JwtRefreshGuardBase);
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
       * a canActivate method.
       */
      const guard = new JwtRefreshGuard();

      expect(typeof guard.canActivate).toBe('function');
    });

    it('should have getRequest method from AuthGuard', () => {
      /**
       * TEST: Request extraction method
       *
       * AuthGuard provides getRequest method used internally
       * for extracting the request from the execution context.
       */
      const guard = new JwtRefreshGuard();

      expect(typeof guard.getRequest).toBe('function');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: STRATEGY CONFIGURATION TESTS
   * =========================================================================
   */
  describe('strategy configuration', () => {
    it('should use jwt-refresh strategy name', () => {
      /**
       * TEST: Strategy name verification
       *
       * The guard must use 'jwt-refresh' as the strategy name to connect
       * with the JwtRefreshStrategy that handles refresh token validation.
       */
      const guard = new JwtRefreshGuard();
      const JwtRefreshGuardBase = AuthGuard('jwt-refresh');

      expect(guard).toBeInstanceOf(JwtRefreshGuardBase);
    });

    it('should not be instance of AuthGuard with jwt strategy', () => {
      /**
       * TEST: Strategy specificity
       *
       * Verify the guard specifically uses 'jwt-refresh' and not 'jwt'.
       * This ensures we're using the refresh token strategy, not access token.
       */
      const guard = new JwtRefreshGuard();
      const AccessGuardBase = AuthGuard('jwt');

      // JwtRefreshGuard should NOT be an instance of jwt guard
      expect(guard).not.toBeInstanceOf(AccessGuardBase);
    });

    it('should be different from JwtAuthGuard', () => {
      /**
       * TEST: Guard differentiation
       *
       * JwtRefreshGuard and JwtAuthGuard should be distinct classes
       * using different strategies for different purposes.
       */
      const refreshGuard = new JwtRefreshGuard();
      const JwtAuthGuardClass = AuthGuard('jwt');

      expect(refreshGuard).not.toBeInstanceOf(JwtAuthGuardClass);
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
      expect(JwtRefreshGuard).toBeDefined();
      expect(typeof JwtRefreshGuard).toBe('function');
      expect(JwtRefreshGuard.prototype).toBeDefined();
    });

    it('should be instantiable without constructor arguments', () => {
      /**
       * TEST: No-arg constructor
       *
       * Guards applied via @UseGuards() are instantiated by NestJS
       * and should work without explicit constructor arguments.
       */
      expect(() => new JwtRefreshGuard()).not.toThrow();
    });
  });
});
