/**
 * ============================================================================
 * UNIT TESTS: Data Sanitizer
 * ============================================================================
 *
 * This file contains unit tests for the data sanitizer utility.
 *
 * WHAT IS A DATA SANITIZER?
 * A data sanitizer removes or masks sensitive information from data before
 * it's logged or transmitted. This is crucial for:
 * - Security: Preventing exposure of passwords, tokens, API keys
 * - Compliance: GDPR, PCI-DSS require protection of sensitive data
 * - Privacy: Protecting user information in logs
 *
 * HOW IT WORKS:
 * 1. Recursively traverses objects and arrays
 * 2. Checks each key against a list of sensitive field names
 * 3. Replaces sensitive values with '[REDACTED]'
 * 4. Preserves non-sensitive data unchanged
 *
 * SENSITIVE FIELDS DETECTED:
 * password, token, secret, apikey, api_key, authorization,
 * accesstoken, access_token, refreshtoken, refresh_token,
 * creditcard, credit_card, cardnumber, card_number, cvv, ssn, pin
 */

import { sanitize } from '@shared/logging/infrastructure/sanitizers/data-sanitizer';

describe('Data Sanitizer', () => {
  /**
   * =========================================================================
   * SECTION 1: PRIMITIVE VALUES TESTS
   * =========================================================================
   *
   * The sanitizer should pass through primitive values unchanged
   * since they don't have keys to check.
   */
  describe('primitive values', () => {
    it('should return null unchanged', () => {
      /**
       * TEST: null handling
       *
       * null is a valid value that should pass through unchanged.
       */
      expect(sanitize(null)).toBeNull();
    });

    it('should return undefined unchanged', () => {
      /**
       * TEST: undefined handling
       *
       * undefined should pass through unchanged.
       */
      expect(sanitize(undefined)).toBeUndefined();
    });

    it('should return strings unchanged', () => {
      /**
       * TEST: String handling
       *
       * Strings are returned as-is because they don't have keys.
       * Even if the string contains "password", it's not redacted
       * because we only check object keys, not values.
       */
      expect(sanitize('hello')).toBe('hello');
      expect(sanitize('')).toBe('');
      expect(sanitize('password')).toBe('password');
    });

    it('should return numbers unchanged', () => {
      /**
       * TEST: Number handling
       *
       * Numbers pass through unchanged.
       */
      expect(sanitize(42)).toBe(42);
      expect(sanitize(0)).toBe(0);
      expect(sanitize(-1)).toBe(-1);
      expect(sanitize(3.14)).toBe(3.14);
    });

    it('should return booleans unchanged', () => {
      /**
       * TEST: Boolean handling
       *
       * Booleans pass through unchanged.
       */
      expect(sanitize(true)).toBe(true);
      expect(sanitize(false)).toBe(false);
    });
  });

  /**
   * =========================================================================
   * SECTION 2: SENSITIVE FIELD DETECTION TESTS
   * =========================================================================
   *
   * These tests verify that all sensitive fields are correctly detected
   * and their values are replaced with '[REDACTED]'.
   */
  describe('sensitive field detection', () => {
    describe('password fields', () => {
      it('should redact "password" field', () => {
        const data = { password: 'secret123' };
        const result = sanitize(data);
        expect(result).toEqual({ password: '[REDACTED]' });
      });

      it('should redact "userPassword" field (contains password)', () => {
        const data = { userPassword: 'secret123' };
        const result = sanitize(data);
        expect(result).toEqual({ userPassword: '[REDACTED]' });
      });

      it('should redact "PASSWORD" field (case insensitive)', () => {
        const data = { PASSWORD: 'secret123' };
        const result = sanitize(data);
        expect(result).toEqual({ PASSWORD: '[REDACTED]' });
      });
    });

    describe('token fields', () => {
      it('should redact "token" field', () => {
        const data = { token: 'jwt.token.here' };
        const result = sanitize(data);
        expect(result).toEqual({ token: '[REDACTED]' });
      });

      it('should redact "accessToken" field', () => {
        const data = { accessToken: 'eyJhbG...' };
        const result = sanitize(data);
        expect(result).toEqual({ accessToken: '[REDACTED]' });
      });

      it('should redact "access_token" field', () => {
        const data = { access_token: 'eyJhbG...' };
        const result = sanitize(data);
        expect(result).toEqual({ access_token: '[REDACTED]' });
      });

      it('should redact "refreshToken" field', () => {
        const data = { refreshToken: 'refresh.jwt.here' };
        const result = sanitize(data);
        expect(result).toEqual({ refreshToken: '[REDACTED]' });
      });

      it('should redact "refresh_token" field', () => {
        const data = { refresh_token: 'refresh.jwt.here' };
        const result = sanitize(data);
        expect(result).toEqual({ refresh_token: '[REDACTED]' });
      });
    });

    describe('API key fields', () => {
      it('should redact "apikey" field', () => {
        const data = { apikey: 'sk-123456' };
        const result = sanitize(data);
        expect(result).toEqual({ apikey: '[REDACTED]' });
      });

      it('should redact "api_key" field', () => {
        const data = { api_key: 'sk-123456' };
        const result = sanitize(data);
        expect(result).toEqual({ api_key: '[REDACTED]' });
      });

      it('should redact "apiKey" field (camelCase)', () => {
        const data = { apiKey: 'sk-123456' };
        const result = sanitize(data);
        expect(result).toEqual({ apiKey: '[REDACTED]' });
      });
    });

    describe('authorization fields', () => {
      it('should redact "authorization" field', () => {
        const data = { authorization: 'Bearer token123' };
        const result = sanitize(data);
        expect(result).toEqual({ authorization: '[REDACTED]' });
      });

      it('should redact "Authorization" header (capitalized)', () => {
        const data = { Authorization: 'Bearer token123' };
        const result = sanitize(data);
        expect(result).toEqual({ Authorization: '[REDACTED]' });
      });
    });

    describe('secret fields', () => {
      it('should redact "secret" field', () => {
        const data = { secret: 'my-secret-value' };
        const result = sanitize(data);
        expect(result).toEqual({ secret: '[REDACTED]' });
      });

      it('should redact "clientSecret" field', () => {
        const data = { clientSecret: 'oauth-secret' };
        const result = sanitize(data);
        expect(result).toEqual({ clientSecret: '[REDACTED]' });
      });

      it('should redact "jwt_secret" field', () => {
        const data = { jwt_secret: 'super-secret' };
        const result = sanitize(data);
        expect(result).toEqual({ jwt_secret: '[REDACTED]' });
      });
    });

    describe('financial fields', () => {
      it('should redact "creditcard" field', () => {
        const data = { creditcard: '4111111111111111' };
        const result = sanitize(data);
        expect(result).toEqual({ creditcard: '[REDACTED]' });
      });

      it('should redact "credit_card" field', () => {
        const data = { credit_card: '4111111111111111' };
        const result = sanitize(data);
        expect(result).toEqual({ credit_card: '[REDACTED]' });
      });

      it('should redact "cardnumber" field', () => {
        const data = { cardnumber: '4111111111111111' };
        const result = sanitize(data);
        expect(result).toEqual({ cardnumber: '[REDACTED]' });
      });

      it('should redact "card_number" field', () => {
        const data = { card_number: '4111111111111111' };
        const result = sanitize(data);
        expect(result).toEqual({ card_number: '[REDACTED]' });
      });

      it('should redact "cvv" field', () => {
        const data = { cvv: '123' };
        const result = sanitize(data);
        expect(result).toEqual({ cvv: '[REDACTED]' });
      });
    });

    describe('personal identification fields', () => {
      it('should redact "ssn" field', () => {
        const data = { ssn: '123-45-6789' };
        const result = sanitize(data);
        expect(result).toEqual({ ssn: '[REDACTED]' });
      });

      it('should redact "pin" field', () => {
        const data = { pin: '1234' };
        const result = sanitize(data);
        expect(result).toEqual({ pin: '[REDACTED]' });
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 3: NON-SENSITIVE FIELDS TESTS
   * =========================================================================
   *
   * Verify that non-sensitive fields pass through unchanged.
   */
  describe('non-sensitive fields', () => {
    it('should preserve non-sensitive string values', () => {
      const data = { username: 'john_doe', email: 'john@example.com' };
      const result = sanitize(data);
      expect(result).toEqual({
        username: 'john_doe',
        email: 'john@example.com',
      });
    });

    it('should preserve non-sensitive number values', () => {
      const data = { age: 30, count: 100 };
      const result = sanitize(data);
      expect(result).toEqual({ age: 30, count: 100 });
    });

    it('should preserve non-sensitive boolean values', () => {
      const data = { isActive: true, isAdmin: false };
      const result = sanitize(data);
      expect(result).toEqual({ isActive: true, isAdmin: false });
    });

    it('should preserve null values in objects', () => {
      const data = { name: 'John', middleName: null };
      const result = sanitize(data);
      expect(result).toEqual({ name: 'John', middleName: null });
    });
  });

  /**
   * =========================================================================
   * SECTION 4: NESTED OBJECTS TESTS
   * =========================================================================
   *
   * The sanitizer should recursively process nested objects.
   */
  describe('nested objects', () => {
    it('should sanitize sensitive fields in nested objects', () => {
      /**
       * TEST: Deep nested sensitive field
       *
       * Sensitive fields should be detected at any depth.
       */
      const data = {
        user: {
          name: 'John',
          credentials: {
            password: 'secret123',
          },
        },
      };

      const result = sanitize(data);

      expect(result).toEqual({
        user: {
          name: 'John',
          credentials: {
            password: '[REDACTED]',
          },
        },
      });
    });

    it('should preserve non-sensitive nested values', () => {
      const data = {
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      };

      const result = sanitize(data);

      expect(result).toEqual({
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      });
    });

    it('should handle multiple levels of nesting', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: {
                secretKey: 'hidden',
                publicKey: 'visible',
              },
            },
          },
        },
      };

      const result = sanitize(data);

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              level4: {
                secretKey: '[REDACTED]',
                publicKey: 'visible',
              },
            },
          },
        },
      });
    });

    it('should handle null values in nested objects', () => {
      const data = {
        user: null,
        config: {
          settings: null,
        },
      };

      const result = sanitize(data);

      expect(result).toEqual({
        user: null,
        config: {
          settings: null,
        },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 5: ARRAY HANDLING TESTS
   * =========================================================================
   *
   * The sanitizer should process arrays and sanitize objects within them.
   */
  describe('array handling', () => {
    it('should return empty array unchanged', () => {
      const result = sanitize([]);
      expect(result).toEqual([]);
    });

    it('should preserve array of primitives', () => {
      const data = [1, 'two', true, null];
      const result = sanitize(data);
      expect(result).toEqual([1, 'two', true, null]);
    });

    it('should sanitize objects within arrays', () => {
      const data = [
        { username: 'john', password: 'secret1' },
        { username: 'jane', password: 'secret2' },
      ];

      const result = sanitize(data);

      expect(result).toEqual([
        { username: 'john', password: '[REDACTED]' },
        { username: 'jane', password: '[REDACTED]' },
      ]);
    });

    it('should handle nested arrays', () => {
      /**
       * Note: The key "tokens" contains "token", so it's redacted entirely.
       * This is the expected behavior - the sanitizer checks if keys CONTAIN
       * sensitive words, not exact matches.
       */
      const data = {
        users: [
          {
            name: 'John',
            items: [{ id: 'abc123' }, { id: 'def456' }],
          },
        ],
      };

      const result = sanitize(data);

      expect(result).toEqual({
        users: [
          {
            name: 'John',
            items: [{ id: 'abc123' }, { id: 'def456' }],
          },
        ],
      });
    });

    it('should redact array field if key contains sensitive word', () => {
      /**
       * TEST: Key "tokens" contains "token" so entire value is redacted
       *
       * This documents the substring matching behavior.
       */
      const data = {
        tokens: [{ value: 'abc' }, { value: 'def' }],
      };

      const result = sanitize(data);

      expect(result).toEqual({
        tokens: '[REDACTED]',
      });
    });

    it('should handle mixed arrays (primitives and objects)', () => {
      const data = [
        'string',
        42,
        { password: 'secret' },
        null,
        { name: 'test' },
      ];

      const result = sanitize(data);

      expect(result).toEqual([
        'string',
        42,
        { password: '[REDACTED]' },
        null,
        { name: 'test' },
      ]);
    });
  });

  /**
   * =========================================================================
   * SECTION 6: REAL-WORLD SCENARIOS TESTS
   * =========================================================================
   *
   * Tests simulating actual log data that might be sanitized.
   */
  describe('real-world scenarios', () => {
    it('should sanitize login request payload', () => {
      /**
       * TEST: Login request sanitization
       *
       * A typical login request contains email and password.
       * Only password should be redacted.
       */
      const loginRequest = {
        email: 'user@example.com',
        password: 'MySecurePassword123!',
      };

      const result = sanitize(loginRequest);

      expect(result).toEqual({
        email: 'user@example.com',
        password: '[REDACTED]',
      });
    });

    it('should sanitize API response with tokens', () => {
      /**
       * TEST: Auth response sanitization
       *
       * Auth responses contain tokens that should be redacted.
       */
      const authResponse = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600,
      };

      const result = sanitize(authResponse);

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        accessToken: '[REDACTED]',
        refreshToken: '[REDACTED]',
        expiresIn: 3600,
      });
    });

    it('should sanitize HTTP request headers', () => {
      /**
       * TEST: HTTP headers sanitization
       *
       * Request headers often contain Authorization tokens.
       */
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1...',
        'X-Request-Id': 'req-12345',
      };

      const result = sanitize(headers);

      expect(result).toEqual({
        'Content-Type': 'application/json',
        Authorization: '[REDACTED]',
        'X-Request-Id': 'req-12345',
      });
    });

    it('should sanitize error log with user context', () => {
      /**
       * TEST: Error log sanitization
       *
       * Error logs might include user data with sensitive fields.
       */
      const errorLog = {
        timestamp: '2024-01-15T10:30:00Z',
        level: 'error',
        message: 'Authentication failed',
        context: {
          userId: 'user-123',
          attemptedPassword: 'wrong-password',
          ipAddress: '192.168.1.1',
        },
        stack: 'Error: Authentication failed\n    at AuthService...',
      };

      const result = sanitize(errorLog);

      expect(result).toEqual({
        timestamp: '2024-01-15T10:30:00Z',
        level: 'error',
        message: 'Authentication failed',
        context: {
          userId: 'user-123',
          attemptedPassword: '[REDACTED]',
          ipAddress: '192.168.1.1',
        },
        stack: 'Error: Authentication failed\n    at AuthService...',
      });
    });

    it('should sanitize payment information', () => {
      /**
       * TEST: Payment data sanitization
       *
       * Payment data contains multiple sensitive fields.
       */
      const paymentData = {
        orderId: 'order-123',
        amount: 99.99,
        currency: 'USD',
        paymentMethod: {
          type: 'credit_card',
          cardNumber: '4111111111111111',
          cvv: '123',
          expiryMonth: 12,
          expiryYear: 2025,
        },
      };

      const result = sanitize(paymentData);

      expect(result).toEqual({
        orderId: 'order-123',
        amount: 99.99,
        currency: 'USD',
        paymentMethod: {
          type: 'credit_card',
          cardNumber: '[REDACTED]',
          cvv: '[REDACTED]',
          expiryMonth: 12,
          expiryYear: 2025,
        },
      });
    });

    it('should sanitize user registration data', () => {
      /**
       * TEST: Registration data sanitization
       *
       * Registration includes password and possibly SSN.
       */
      const registrationData = {
        email: 'newuser@example.com',
        password: 'NewUserPass123!',
        confirmPassword: 'NewUserPass123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          ssn: '123-45-6789',
        },
      };

      const result = sanitize(registrationData);

      expect(result).toEqual({
        email: 'newuser@example.com',
        password: '[REDACTED]',
        confirmPassword: '[REDACTED]',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          ssn: '[REDACTED]',
        },
      });
    });
  });

  /**
   * =========================================================================
   * SECTION 7: EDGE CASES TESTS
   * =========================================================================
   */
  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = sanitize({});
      expect(result).toEqual({});
    });

    it('should handle object with only sensitive fields', () => {
      const data = {
        password: 'secret',
        token: 'abc',
        apiKey: '123',
      };

      const result = sanitize(data);

      expect(result).toEqual({
        password: '[REDACTED]',
        token: '[REDACTED]',
        apiKey: '[REDACTED]',
      });
    });

    it('should not mutate the original object', () => {
      /**
       * TEST: Immutability
       *
       * The sanitizer should create a new object, not modify the original.
       */
      const original = {
        username: 'john',
        password: 'secret',
      };
      const originalPassword = original.password;

      sanitize(original);

      expect(original.password).toBe(originalPassword);
      expect(original.password).toBe('secret');
    });

    it('should handle sensitive field with null value', () => {
      const data = { password: null };
      const result = sanitize(data);
      expect(result).toEqual({ password: '[REDACTED]' });
    });

    it('should handle sensitive field with undefined value', () => {
      const data = { password: undefined };
      const result = sanitize(data);
      expect(result).toEqual({ password: '[REDACTED]' });
    });

    it('should handle sensitive field with empty string', () => {
      const data = { password: '' };
      const result = sanitize(data);
      expect(result).toEqual({ password: '[REDACTED]' });
    });

    it('should handle sensitive field with number value', () => {
      const data = { pin: 1234 };
      const result = sanitize(data);
      expect(result).toEqual({ pin: '[REDACTED]' });
    });

    it('should handle sensitive field with boolean value', () => {
      const data = { hasPassword: true, password: true };
      const result = sanitize(data);
      // 'hasPassword' contains 'password' so it's redacted
      expect(result).toEqual({
        hasPassword: '[REDACTED]',
        password: '[REDACTED]',
      });
    });

    it('should handle keys with special characters', () => {
      const data = {
        'user-password': 'secret',
        'api.key': 'value',
        normal: 'value',
      };

      const result = sanitize(data);

      expect(result).toEqual({
        'user-password': '[REDACTED]',
        'api.key': 'value', // 'api.key' doesn't contain 'apikey'
        normal: 'value',
      });
    });
  });
});
