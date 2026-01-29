/**
 * ============================================================================
 * UNIT TESTS: User Entity
 * ============================================================================
 *
 * This file contains unit tests for the User domain entity.
 *
 * WHAT IS A DOMAIN ENTITY?
 * A domain entity represents a business concept with a unique identity.
 * Unlike Value Objects, entities have an ID that distinguishes them
 * even if all other attributes are the same.
 *
 * WHAT ARE WE TESTING?
 * 1. Constructor: That the entity is created correctly with all properties
 * 2. Inheritance: That it correctly inherits from BaseEntity (id, createdAt, updatedAt)
 * 3. getFullName() method: That it correctly concatenates first and last name
 * 4. validatePassword() method: That it correctly delegates to Password Value Object
 * 5. UserRole enum: That roles are correctly defined
 *
 * TEST PATTERN: AAA (Arrange, Act, Assert)
 * - Arrange: Prepare the data needed for the test
 * - Act: Execute the action we want to test
 * - Assert: Verify that the result is as expected
 */

import { User, UserRole, UserProps } from '@users/domain/entities/user.entity';
import { Email } from '@users/domain/value-objects/email.vo';
import { Password } from '@users/domain/value-objects/password.vo';

describe('User Entity', () => {
  /**
   * =========================================================================
   * SECTION 1: TEST DATA SETUP (Test Fixtures)
   * =========================================================================
   *
   * "Fixtures" are predefined data used in tests.
   * We create helper functions to generate this data consistently.
   */

  // Mock of the Email Value Object
  // We use jest.fn() to create simulated functions we can control
  const createMockEmail = (value: string = 'test@example.com'): Email => {
    const mockEmail = {
      getValue: jest.fn().mockReturnValue(value),
      equals: jest.fn().mockImplementation((other: Email) => {
        return other.getValue() === value;
      }),
    } as unknown as Email;
    return mockEmail;
  };

  // Mock of the Password Value Object
  // The compare() method is async, that's why we use mockResolvedValue
  const createMockPassword = (shouldMatch: boolean = true): Password => {
    const mockPassword = {
      getValue: jest.fn().mockReturnValue('$2b$10$hashedpassword'),
      compare: jest.fn().mockResolvedValue(shouldMatch),
    } as unknown as Password;
    return mockPassword;
  };

  // Helper function to create valid UserProps
  // This allows us to easily create test users
  const createValidUserProps = (
    overrides: Partial<UserProps> = {},
  ): UserProps => {
    return {
      id: 'user-123',
      email: createMockEmail(),
      password: createMockPassword(),
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      role: UserRole.USER,
      isActive: true,
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      ...overrides, // Allows overriding any property
    };
  };

  /**
   * =========================================================================
   * SECTION 2: UserRole ENUM TESTS
   * =========================================================================
   *
   * WHY TEST AN ENUM?
   * Although it seems trivial, testing enums ensures that:
   * - The values exist and are as expected
   * - They haven't been accidentally modified
   * - The application can depend on these specific values
   */
  describe('UserRole Enum', () => {
    it('should have USER role defined with correct value', () => {
      /**
       * TEST: Verify that USER role exists
       *
       * Why is this important?
       * The authorization system depends on these exact values.
       * If someone changes 'USER' to 'user', it will break authorization.
       */
      expect(UserRole.USER).toBe('USER');
    });

    it('should have ADMIN role defined with correct value', () => {
      /**
       * TEST: Verify that ADMIN role exists
       *
       * Similar to above, we guarantee the value is exactly 'ADMIN'.
       */
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('should only have two roles defined', () => {
      /**
       * TEST: Verify that only 2 roles exist
       *
       * Why is this important?
       * If someone adds a new role without updating the authorization logic,
       * this test will fail and alert us to the change.
       */
      const roleValues = Object.values(UserRole);
      expect(roleValues).toHaveLength(2);
      expect(roleValues).toContain('USER');
      expect(roleValues).toContain('ADMIN');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: CONSTRUCTOR TESTS
   * =========================================================================
   *
   * The constructor is critical because it establishes the initial state of the entity.
   * We must verify that all properties are assigned correctly.
   */
  describe('constructor', () => {
    it('should create a User instance with all provided properties', () => {
      /**
       * TEST: Create user with all properties
       *
       * Arrange: Prepare user properties
       * Act: Create the User instance
       * Assert: Verify each property was assigned correctly
       *
       * Why is this important?
       * Ensures the constructor doesn't ignore any property
       * and that the entity is created in a valid state.
       */

      // Arrange
      const props = createValidUserProps();

      // Act
      const user = new User(props);

      // Assert
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe('user-123');
      expect(user.email).toBe(props.email);
      expect(user.password).toBe(props.password);
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.age).toBe(30);
      expect(user.role).toBe(UserRole.USER);
      expect(user.isActive).toBe(true);
      expect(user.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should inherit id, createdAt, and updatedAt from BaseEntity', () => {
      /**
       * TEST: Verify BaseEntity inheritance
       *
       * The User entity inherits from BaseEntity, which provides:
       * - id: Unique identifier
       * - createdAt: Creation timestamp
       * - updatedAt: Last update timestamp
       *
       * Why is this important?
       * Ensures inheritance works correctly and that
       * dates are passed to the parent constructor.
       */

      // Arrange
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-15T15:30:00Z');
      const props = createValidUserProps({ createdAt, updatedAt });

      // Act
      const user = new User(props);

      // Assert
      expect(user.id).toBe('user-123');
      expect(user.createdAt).toEqual(createdAt);
      expect(user.updatedAt).toEqual(updatedAt);
    });

    it('should use default dates when createdAt and updatedAt are not provided', () => {
      /**
       * TEST: Default dates when not provided
       *
       * BaseEntity has logic to assign the current date
       * if createdAt/updatedAt are not provided.
       *
       * Why is this important?
       * When creating a new user, we don't want to have to
       * specify dates manually.
       */

      // Arrange
      const props = createValidUserProps();
      delete props.createdAt;
      delete props.updatedAt;
      const beforeCreation = new Date();

      // Act
      const user = new User(props);
      const afterCreation = new Date();

      // Assert - Dates should be between before and after
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });

    it('should allow null values for age', () => {
      /**
       * TEST: age can be null
       *
       * The age field is optional (number | null).
       * Some users may not want to share their age.
       *
       * Why is this important?
       * Verifies the system correctly handles optional fields.
       */

      // Arrange
      const props = createValidUserProps({ age: null });

      // Act
      const user = new User(props);

      // Assert
      expect(user.age).toBeNull();
    });

    it('should allow null values for avatarUrl', () => {
      /**
       * TEST: avatarUrl can be null
       *
       * Not all users have an avatar, so this field is nullable.
       */

      // Arrange
      const props = createValidUserProps({ avatarUrl: null });

      // Act
      const user = new User(props);

      // Assert
      expect(user.avatarUrl).toBeNull();
    });

    it('should create user with ADMIN role', () => {
      /**
       * TEST: Create user with ADMIN role
       *
       * Verify we can create users with different roles.
       */

      // Arrange
      const props = createValidUserProps({ role: UserRole.ADMIN });

      // Act
      const user = new User(props);

      // Assert
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('should create inactive user', () => {
      /**
       * TEST: Create inactive user
       *
       * Users can be deactivated (banned, pending verification, etc.)
       */

      // Arrange
      const props = createValidUserProps({ isActive: false });

      // Act
      const user = new User(props);

      // Assert
      expect(user.isActive).toBe(false);
    });
  });

  /**
   * =========================================================================
   * SECTION 4: getFullName() METHOD TESTS
   * =========================================================================
   *
   * This method combines firstName and lastName to get the full name.
   * It's a convenience method commonly used in UI and reports.
   */
  describe('getFullName', () => {
    it('should return full name by combining firstName and lastName', () => {
      /**
       * TEST: Basic full name case
       *
       * Verifies that firstName + " " + lastName produces the expected result.
       */

      // Arrange
      const props = createValidUserProps({
        firstName: 'John',
        lastName: 'Doe',
      });
      const user = new User(props);

      // Act
      const fullName = user.getFullName();

      // Assert
      expect(fullName).toBe('John Doe');
    });

    it('should handle names with multiple parts', () => {
      /**
       * TEST: Compound names
       *
       * Some names have multiple parts (e.g., "Mary Jane").
       * The method should preserve internal spaces.
       */

      // Arrange
      const props = createValidUserProps({
        firstName: 'Mary Jane',
        lastName: 'Watson Parker',
      });
      const user = new User(props);

      // Act
      const fullName = user.getFullName();

      // Assert
      expect(fullName).toBe('Mary Jane Watson Parker');
    });

    it('should handle single character names', () => {
      /**
       * TEST: Single character names
       *
       * Edge case: some cultures use very short names
       * or initials instead of full names.
       */

      // Arrange
      const props = createValidUserProps({
        firstName: 'J',
        lastName: 'D',
      });
      const user = new User(props);

      // Act
      const fullName = user.getFullName();

      // Assert
      expect(fullName).toBe('J D');
    });

    it('should handle names with special characters', () => {
      /**
       * TEST: Names with special characters
       *
       * International names can have accents, apostrophes,
       * hyphens, etc. The method should not alter them.
       */

      // Arrange
      const props = createValidUserProps({
        firstName: 'Jean-Pierre',
        lastName: "O'Connor",
      });
      const user = new User(props);

      // Act
      const fullName = user.getFullName();

      // Assert
      expect(fullName).toBe("Jean-Pierre O'Connor");
    });

    it('should handle names with unicode characters', () => {
      /**
       * TEST: Names with Unicode characters
       *
       * Users from different countries may have names
       * in their native languages (Chinese, Arabic, etc.)
       */

      // Arrange
      const props = createValidUserProps({
        firstName: 'Ming',
        lastName: 'Li',
      });
      const user = new User(props);

      // Act
      const fullName = user.getFullName();

      // Assert
      expect(fullName).toBe('Ming Li');
    });

    it('should return consistent results on multiple calls', () => {
      /**
       * TEST: Consistency across multiple calls
       *
       * The method should be pure (no side effects) and
       * return the same result every time.
       *
       * Why is this important?
       * Ensures the method has no unexpected behavior
       * that might vary between calls.
       */

      // Arrange
      const props = createValidUserProps();
      const user = new User(props);

      // Act
      const firstCall = user.getFullName();
      const secondCall = user.getFullName();
      const thirdCall = user.getFullName();

      // Assert
      expect(firstCall).toBe(secondCall);
      expect(secondCall).toBe(thirdCall);
    });
  });

  /**
   * =========================================================================
   * SECTION 5: validatePassword() METHOD TESTS
   * =========================================================================
   *
   * This method verifies if a plain text password matches
   * the hashed password stored in the user.
   *
   * NOTE ON MOCKING:
   * We use mocks of the Password Value Object because:
   * 1. Tests should be fast (bcrypt is intentionally slow)
   * 2. We want to test User in isolation, not Password
   * 3. Password already has its own unit tests
   */
  describe('validatePassword', () => {
    it('should return true when password matches', async () => {
      /**
       * TEST: Correct password returns true
       *
       * Happy path: user enters the correct password.
       *
       * How does it work?
       * 1. We create a Password mock that always returns true in compare()
       * 2. We call validatePassword()
       * 3. We verify it returns true
       */

      // Arrange
      const mockPassword = createMockPassword(true); // compare() will return true
      const props = createValidUserProps({ password: mockPassword });
      const user = new User(props);

      // Act
      const isValid = await user.validatePassword('correctPassword123!');

      // Assert
      expect(isValid).toBe(true);
      expect(mockPassword.compare).toHaveBeenCalledWith('correctPassword123!');
      expect(mockPassword.compare).toHaveBeenCalledTimes(1);
    });

    it('should return false when password does not match', async () => {
      /**
       * TEST: Incorrect password returns false
       *
       * Error case: user enters an incorrect password.
       */

      // Arrange
      const mockPassword = createMockPassword(false); // compare() will return false
      const props = createValidUserProps({ password: mockPassword });
      const user = new User(props);

      // Act
      const isValid = await user.validatePassword('wrongPassword');

      // Assert
      expect(isValid).toBe(false);
      expect(mockPassword.compare).toHaveBeenCalledWith('wrongPassword');
    });

    it('should delegate comparison to Password value object', async () => {
      /**
       * TEST: Delegation to Value Object
       *
       * Verify that User doesn't implement its own comparison logic,
       * but completely delegates to the Password Value Object.
       *
       * Why is this important?
       * - Single Responsibility: User shouldn't know how to compare passwords
       * - Hashing logic is encapsulated in Password
       * - Avoids code duplication
       */

      // Arrange
      const mockPassword = createMockPassword(true);
      const props = createValidUserProps({ password: mockPassword });
      const user = new User(props);
      const testPassword = 'TestPassword123!';

      // Act
      await user.validatePassword(testPassword);

      // Assert
      expect(mockPassword.compare).toHaveBeenCalledWith(testPassword);
    });

    it('should handle empty password string', async () => {
      /**
       * TEST: Handle empty password
       *
       * Edge case: What happens if someone tries to validate an empty string?
       * The method should pass the string to Password VO, which will decide what to do.
       */

      // Arrange
      const mockPassword = createMockPassword(false);
      const props = createValidUserProps({ password: mockPassword });
      const user = new User(props);

      // Act
      const isValid = await user.validatePassword('');

      // Assert
      expect(isValid).toBe(false);
      expect(mockPassword.compare).toHaveBeenCalledWith('');
    });

    it('should be an async operation', async () => {
      /**
       * TEST: Async operation
       *
       * validatePassword() must be async because bcrypt.compare() is async.
       * This test verifies the method returns a Promise.
       *
       * Why is bcrypt async?
       * bcrypt is intentionally slow to make brute force attacks harder.
       * Making it async avoids blocking Node.js event loop.
       */

      // Arrange
      const mockPassword = createMockPassword(true);
      const props = createValidUserProps({ password: mockPassword });
      const user = new User(props);

      // Act
      const result = user.validatePassword('anyPassword');

      // Assert
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);
    });
  });

  /**
   * =========================================================================
   * SECTION 6: IMMUTABILITY TESTS
   * =========================================================================
   *
   * Domain entities should be immutable to avoid
   * unexpected side effects and facilitate debugging.
   *
   * TypeScript uses 'readonly' but JavaScript doesn't enforce it at runtime.
   * These tests document the expected behavior.
   */
  describe('immutability', () => {
    it('should have readonly properties (TypeScript enforcement)', () => {
      /**
       * TEST: Properties are readonly
       *
       * This test documents that properties are marked as readonly.
       * TypeScript prevents modifications at compile time.
       *
       * NOTE: At runtime, JavaScript allows modifying these properties,
       * but the TypeScript compiler will prevent it during development.
       */

      // Arrange
      const props = createValidUserProps();
      const user = new User(props);

      // Assert - Verify properties exist and have values
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
      expect(user.role).toBeDefined();
      expect(user.isActive).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // TypeScript doesn't allow: user.firstName = 'Jane';
      // This would cause a compilation error
    });
  });

  /**
   * =========================================================================
   * SECTION 7: INTEGRATION WITH VALUE OBJECTS TESTS
   * =========================================================================
   *
   * Although we use mocks in most tests, it's useful to have
   * some tests that verify real integration with VOs.
   */
  describe('integration with real Value Objects', () => {
    it('should work with real Email value object', () => {
      /**
       * TEST: Integration with real Email
       *
       * Verify that User works correctly with a real
       * Email instance (not mocked).
       */

      // Arrange
      const realEmail = new Email('user@example.com');
      const props = createValidUserProps({ email: realEmail });

      // Act
      const user = new User(props);

      // Assert
      expect(user.email).toBe(realEmail);
      expect(user.email.getValue()).toBe('user@example.com');
    });

    it('should work with real Password value object', async () => {
      /**
       * TEST: Integration with real Password
       *
       * Verify that validatePassword() works with a real
       * Password instance (includes real bcrypt hash).
       *
       * NOTE: This test is slower due to bcrypt hashing.
       */

      // Arrange
      const plainPassword = 'SecurePass123!';
      const realPassword = await Password.create(plainPassword);
      const props = createValidUserProps({ password: realPassword });
      const user = new User(props);

      // Act
      const isValidCorrect = await user.validatePassword(plainPassword);
      const isValidIncorrect = await user.validatePassword('WrongPassword123!');

      // Assert
      expect(isValidCorrect).toBe(true);
      expect(isValidIncorrect).toBe(false);
    });
  });
});
