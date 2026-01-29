import type { Config } from 'jest';

const config: Config = {
  displayName: 'integration',
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/integration/**/*.integration.spec.ts'],
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
    '!src/**/*.dto.ts',
    '!src/**/index.ts',
    '!src/main.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 30000,
  verbose: true,
};

export default config;
