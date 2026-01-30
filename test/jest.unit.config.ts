import type { Config } from 'jest';

const config: Config = {
  displayName: 'unit',
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
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
    '!src/config/*.config.ts',
    '!src/config/validators/*.ts',
    '!src/migrations/*.ts',
    '!src/**/providers/*.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  verbose: true,
};

export default config;
