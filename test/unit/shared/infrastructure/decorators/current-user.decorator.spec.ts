/**
 * ============================================================================
 * UNIT TESTS: CurrentUser Decorator
 * ============================================================================
 *
 * This file contains unit tests for the CurrentUser parameter decorator.
 *
 * WHAT IS CurrentUser?
 * A custom parameter decorator that extracts the authenticated user
 * or a specific property from the request object.
 *
 * TESTING APPROACH:
 * Mock ExecutionContext and verify decorator extracts user data correctly.
 */

import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '@shared/infrastructure/decorators/current-user.decorator';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

describe('CurrentUser Decorator', () => {
  // Helper to get decorator factory
  const getParamDecoratorFactory = () => {
    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@CurrentUser() user: unknown) {}
    }

    const args = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    );
    const key = Object.keys(args)[0];
    return args[key].factory;
  };

  const getParamDecoratorFactoryWithData = (data: string) => {
    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@CurrentUser(data) user: unknown) {}
    }

    const args = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    );
    const key = Object.keys(args)[0];
    return args[key].factory;
  };

  // Helper to create mock ExecutionContext
  const createMockContext = (
    user: Record<string, unknown> | undefined,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  /**
   * =========================================================================
   * SECTION 1: EXTRACT FULL USER TESTS
   * =========================================================================
   */
  describe('extract full user', () => {
    it('should return entire user object when no data parameter', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactory();

      const result = factory(undefined, ctx);

      expect(result).toEqual(user);
    });

    it('should return undefined when user is not set', () => {
      const ctx = createMockContext(undefined);
      const factory = getParamDecoratorFactory();

      const result = factory(undefined, ctx);

      expect(result).toBeUndefined();
    });

    it('should return user with all properties', () => {
      const user = {
        id: 'user-456',
        email: 'admin@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactory();

      const result = factory(undefined, ctx);

      expect(result).toHaveProperty('id', 'user-456');
      expect(result).toHaveProperty('email', 'admin@example.com');
      expect(result).toHaveProperty('role', 'admin');
      expect(result).toHaveProperty('firstName', 'John');
      expect(result).toHaveProperty('lastName', 'Doe');
      expect(result).toHaveProperty('isActive', true);
    });
  });

  /**
   * =========================================================================
   * SECTION 2: EXTRACT SPECIFIC PROPERTY TESTS
   * =========================================================================
   */
  describe('extract specific property', () => {
    it('should return specific property when data parameter is provided', () => {
      const user = {
        id: 'user-789',
        email: 'specific@example.com',
        role: 'user',
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('id');

      const result = factory('id', ctx);

      expect(result).toBe('user-789');
    });

    it('should return email property', () => {
      const user = {
        id: 'user-101',
        email: 'email@example.com',
        role: 'user',
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('email');

      const result = factory('email', ctx);

      expect(result).toBe('email@example.com');
    });

    it('should return role property', () => {
      const user = {
        id: 'user-102',
        email: 'role@example.com',
        role: 'admin',
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('role');

      const result = factory('role', ctx);

      expect(result).toBe('admin');
    });

    it('should return undefined for non-existent property', () => {
      const user = {
        id: 'user-103',
        email: 'exists@example.com',
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('nonExistent');

      const result = factory('nonExistent', ctx);

      expect(result).toBeUndefined();
    });

    it('should return undefined when user is undefined and property requested', () => {
      const ctx = createMockContext(undefined);
      const factory = getParamDecoratorFactoryWithData('id');

      const result = factory('id', ctx);

      expect(result).toBeUndefined();
    });
  });

  /**
   * =========================================================================
   * SECTION 3: EDGE CASES
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle nested object properties', () => {
      const user = {
        id: 'user-nested',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('profile');

      const result = factory('profile', ctx);

      expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
    });

    it('should handle null user property values', () => {
      const user = {
        id: 'user-null',
        avatarUrl: null,
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('avatarUrl');

      const result = factory('avatarUrl', ctx);

      expect(result).toBeNull();
    });

    it('should handle boolean properties', () => {
      const user = {
        id: 'user-bool',
        isActive: false,
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('isActive');

      const result = factory('isActive', ctx);

      expect(result).toBe(false);
    });

    it('should handle numeric properties', () => {
      const user = {
        id: 'user-num',
        age: 25,
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('age');

      const result = factory('age', ctx);

      expect(result).toBe(25);
    });

    it('should handle array properties', () => {
      const user = {
        id: 'user-array',
        roles: ['admin', 'user'],
      };
      const ctx = createMockContext(user);
      const factory = getParamDecoratorFactoryWithData('roles');

      const result = factory('roles', ctx);

      expect(result).toEqual(['admin', 'user']);
    });
  });
});
