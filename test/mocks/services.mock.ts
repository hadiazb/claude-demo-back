/**
 * Service mocks for unit testing.
 */

export const createMockUserService = () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
});

export const createMockAuthService = () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshTokens: jest.fn(),
  logout: jest.fn(),
  logoutAll: jest.fn(),
  validateUser: jest.fn(),
});

export const createMockJwtService = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
});

export const createMockConfigService = () => ({
  get: jest.fn((key: string) => {
    const config: Record<string, unknown> = {
      'jwt.accessSecret': 'test-access-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.accessExpiresIn': '15m',
      'jwt.refreshExpiresIn': '7d',
      'app.port': 3000,
      'app.apiVersion': 'v1',
    };
    return config[key];
  }),
});
