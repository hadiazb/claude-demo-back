/**
 * Auth test fixtures.
 * Contains reusable test data for authentication-related tests.
 */

export const validLoginCredentials = {
  email: 'test@example.com',
  password: 'ValidPass123!',
};

export const invalidLoginCredentials = {
  email: 'wrong@example.com',
  password: 'WrongPass123!',
};

export const validRegisterData = {
  email: 'newuser@example.com',
  password: 'ValidPass123!',
  firstName: 'New',
  lastName: 'User',
};

export const mockTokens = {
  accessToken: 'mock-access-token-jwt',
  refreshToken: 'mock-refresh-token-jwt',
};

export const mockJwtPayload = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  role: 'USER',
};
