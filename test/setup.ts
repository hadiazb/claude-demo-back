/**
 * Global test setup file.
 * This file runs before all tests.
 */

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests (optional)
// Uncomment if you want to suppress console output during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Global beforeAll hook
beforeAll(async () => {
  // Setup code that runs once before all tests
});

// Global afterAll hook
afterAll(async () => {
  // Cleanup code that runs once after all tests
});

// Global beforeEach hook
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});
