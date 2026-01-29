/**
 * Repository mocks for unit testing.
 */

export const createMockUserRepository = () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

export const createMockTokenRepository = () => ({
  save: jest.fn(),
  findByToken: jest.fn(),
  findByUserId: jest.fn(),
  revokeToken: jest.fn(),
  revokeAllUserTokens: jest.fn(),
  deleteExpiredTokens: jest.fn(),
});
