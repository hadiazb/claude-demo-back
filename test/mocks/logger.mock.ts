/**
 * Logger mock for unit testing.
 */

export const createMockLogger = () => ({
  setContext: jest.fn().mockReturnThis(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});
