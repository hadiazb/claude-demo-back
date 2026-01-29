# Testing Structure

This directory contains all tests for the application, organized by test type and mirroring the source code structure.

## Directory Structure

```
test/
├── unit/                    # Unit tests (isolated, mocked dependencies)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   │   ├── value-objects/
│   │   │   │   └── entities/
│   │   │   ├── application/
│   │   │   │   └── services/
│   │   │   └── infrastructure/
│   │   │       └── guards/
│   │   └── users/
│   │       ├── domain/
│   │       │   ├── value-objects/
│   │       │   └── entities/
│   │       ├── application/
│   │       │   └── services/
│   │       └── infrastructure/
│   │           └── mappers/
│   ├── shared/
│   │   └── infrastructure/
│   │       ├── filters/
│   │       └── interceptors/
│   └── config/
│       └── validators/
│
├── integration/             # Integration tests (real DB, multiple components)
│   └── modules/
│       ├── auth/
│       └── users/
│
├── e2e/                     # End-to-end tests (full HTTP flow)
│   ├── auth/
│   └── users/
│
├── fixtures/                # Test data fixtures
├── mocks/                   # Shared mock implementations
├── helpers/                 # Test utilities and helpers
│
├── jest.unit.config.ts      # Jest config for unit tests
├── jest.integration.config.ts # Jest config for integration tests
├── jest.e2e.config.ts       # Jest config for e2e tests
└── setup.ts                 # Global test setup
```

## Naming Conventions

| Test Type | File Pattern | Example |
|-----------|--------------|---------|
| Unit | `*.spec.ts` | `password.vo.spec.ts` |
| Integration | `*.integration.spec.ts` | `user.repository.integration.spec.ts` |
| E2E | `*.e2e-spec.ts` | `auth.e2e-spec.ts` |

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

# Run all e2e tests
npm run test:e2e

# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## Test Organization Rules

1. **Mirror source structure**: Test files should mirror the `src/` directory structure
2. **One test file per source file**: Each source file should have a corresponding test file
3. **Descriptive test names**: Use `describe` blocks that match class/function names
4. **AAA Pattern**: Arrange, Act, Assert in each test

## Fixtures

Place reusable test data in `fixtures/`:

```typescript
// fixtures/user.fixture.ts
export const validUserData = {
  email: 'test@example.com',
  password: 'ValidPass123!',
  firstName: 'John',
  lastName: 'Doe',
};
```

## Mocks

Place shared mocks in `mocks/`:

```typescript
// mocks/repository.mock.ts
export const mockUserRepository = {
  findById: jest.fn(),
  save: jest.fn(),
  findByEmail: jest.fn(),
};
```

## Helpers

Place test utilities in `helpers/`:

```typescript
// helpers/test-app.helper.ts
export async function createTestingApp() {
  // Create and configure test application
}
```
