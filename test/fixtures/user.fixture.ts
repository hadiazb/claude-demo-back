import { UserRole } from '@users/domain';

/**
 * User test fixtures.
 * Contains reusable test data for user-related tests.
 */

export const validUserData = {
  email: 'test@example.com',
  password: 'ValidPass123!',
  firstName: 'John',
  lastName: 'Doe',
  age: 25,
  role: UserRole.USER,
};

export const validAdminData = {
  email: 'admin@example.com',
  password: 'AdminPass123!',
  firstName: 'Admin',
  lastName: 'User',
  age: 30,
  role: UserRole.ADMIN,
};

export const invalidEmails = [
  '',
  'invalid',
  'invalid@',
  '@invalid.com',
  'invalid@.com',
  'invalid@com',
  'invalid @email.com',
];

export const invalidPasswords = [
  '',
  '1234567', // too short
  'lowercase123!', // no uppercase
  'UPPERCASE123!', // no lowercase
  'NoNumbers!!', // no number
  'NoSpecial123', // no special char
];

export const validPasswords = [
  'ValidPass123!',
  'Another$ecure1',
  'Test@Password99',
  'C0mplex!Pass',
];
