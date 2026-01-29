import type { Config } from 'jest';

const config: Config = {
  displayName: 'e2e',
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config$': '<rootDir>/src/config',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@shared$': '<rootDir>/src/shared',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@users$': '<rootDir>/src/modules/users',
    '^@users/(.*)$': '<rootDir>/src/modules/users/$1',
    '^@auth$': '<rootDir>/src/modules/auth',
    '^@auth/(.*)$': '<rootDir>/src/modules/auth/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/index.ts',
    '!src/main.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 60000,
  verbose: true,
};

export default config;
