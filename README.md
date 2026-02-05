# Claude Initial Demo API

REST API built with NestJS following Clean Architecture (Hexagonal Architecture) principles.

## Table of Contents

- [Description](#description)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Development Setup](#development-setup)
- [Available Environments](#available-environments)
- [API Endpoints](#api-endpoints)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Docker](#docker)
- [Contributing](#contributing)

## Description

This project is a REST API that implements an authentication and user management system. It includes:

- User registration and authentication (JWT with access/refresh token rotation)
- Role-based access control (RBAC)
- User CRUD operations
- Redis-backed caching layer with decorators
- Transactional email sending (Resend)
- Structured logging with Winston (file rotation, request tracing, data sanitization)
- HTTP client abstraction (Axios)
- Rate limiting (Throttler)
- Security headers (Helmet)
- Standardized response structure
- Data validation with class-validator
- Global exception handling
- API documentation with Swagger/OpenAPI
- Automatic database migrations (TypeORM)

## Technologies

### Core

| Technology | Version | Description |
|------------|---------|-------------|
| Node.js | >= 18.x | Runtime environment |
| NestJS | 11.0.1 | Backend framework |
| TypeScript | 5.7.3 | Programming language |
| PostgreSQL | 15+ | Relational database |
| Redis | 6+ | Cache store |

### Main Dependencies

| Library | Version | Description |
|---------|---------|-------------|
| @nestjs/common | 11.0.1 | NestJS common module |
| @nestjs/core | 11.0.1 | NestJS core |
| @nestjs/config | 4.0.2 | Configuration management |
| @nestjs/jwt | 11.0.2 | JSON Web Tokens handling |
| @nestjs/passport | 11.0.5 | Passport.js integration |
| @nestjs/typeorm | 11.0.0 | TypeORM integration |
| @nestjs/platform-express | 11.0.1 | Express platform |
| @nestjs/swagger | 11.2.5 | OpenAPI/Swagger documentation |
| @nestjs/throttler | 6.5.0 | Rate limiting |
| typeorm | 0.3.28 | TypeScript ORM |
| pg | 8.17.2 | PostgreSQL driver |
| ioredis | 5.9.2 | Redis client |
| bcrypt | 6.0.0 | Password hashing |
| class-validator | 0.14.3 | DTO validation |
| class-transformer | 0.5.1 | Object transformation |
| passport | 0.7.0 | Authentication middleware |
| passport-jwt | 4.0.1 | JWT strategy for Passport |
| helmet | 8.1.0 | Security HTTP headers |
| axios | 1.13.4 | HTTP client |
| resend | 6.9.1 | Transactional email service |
| winston | 3.19.0 | Logging library |
| winston-daily-rotate-file | 5.0.0 | Log file rotation |
| uuid | 9.0.1 | UUID generation |
| rxjs | 7.8.1 | Reactive programming |

### Development Dependencies

| Library | Version | Description |
|---------|---------|-------------|
| @nestjs/cli | 11.0.0 | NestJS CLI |
| @nestjs/testing | 11.0.1 | Testing utilities |
| jest | 29.7.0 | Testing framework |
| supertest | 7.0.0 | HTTP testing |
| eslint | 9.18.0 | Code linter |
| prettier | 3.4.2 | Code formatter |
| ts-jest | 29.2.5 | Jest for TypeScript |
| cross-env | 10.1.0 | Cross-platform environment variables |
| husky | 9.1.7 | Git hooks |
| commitlint | 20.4.0 | Commit message linting |
| lint-staged | 16.2.7 | Run linters on staged files |
| standard-version | 9.5.0 | Semantic versioning and changelog |

## Architecture

The project follows **Hexagonal Architecture (Ports & Adapters)** with the following organization:

```
src/
├── config/                          # Configurations (database, jwt, logger, email, cache)
│   └── validators/                  # Secret validation on startup
├── shared/                          # Shared modules
│   ├── cache/                       # Redis caching module
│   │   ├── domain/ports/            # Cache port interface
│   │   └── infrastructure/
│   │       ├── adapters/            # Redis cache adapter
│   │       ├── decorators/          # @Cacheable decorator
│   │       └── interceptors/        # Cache interceptor
│   ├── email/                       # Email module (Resend)
│   │   ├── domain/ports/            # Email port interface
│   │   └── infrastructure/
│   │       ├── adapters/            # Resend email adapter
│   │       └── templates/           # Email templates (welcome)
│   ├── http-client/                 # HTTP client module (Axios)
│   │   ├── domain/ports/            # HTTP client port interface
│   │   └── infrastructure/adapters/ # Axios adapter
│   ├── logging/                     # Logging module (Winston)
│   │   ├── domain/ports/            # Logger port interface
│   │   └── infrastructure/
│   │       ├── adapters/            # Winston logger adapter
│   │       ├── context/             # Async context service (request tracing)
│   │       ├── middleware/           # Request ID middleware
│   │       └── sanitizers/          # Data sanitizer (sensitive data)
│   ├── constants/                   # Injection tokens
│   ├── domain/                      # Base entity
│   ├── infrastructure/              # Shared filters, interceptors, decorators
│   │   ├── decorators/              # @CurrentUser, @Roles
│   │   ├── filters/                 # HTTP exception filter
│   │   └── interceptors/            # Response interceptor
│   └── interfaces/                  # API response interfaces
└── modules/
    ├── auth/                        # Authentication module
    │   ├── application/
    │   │   ├── dto/                 # Login, Register, RefreshToken, AuthResponse DTOs
    │   │   └── services/            # Auth service
    │   ├── domain/
    │   │   ├── entities/            # RefreshToken entity
    │   │   └── ports/
    │   │       ├── in/              # Login, Register, RefreshToken use cases
    │   │       └── out/             # Token repository port
    │   └── infrastructure/
    │       ├── adapters/
    │       │   ├── in/              # Auth controller
    │       │   └── out/             # Token repository adapter
    │       ├── guards/              # JWT auth, JWT refresh, Roles guards
    │       ├── persistence/entities/# RefreshToken ORM entity
    │       └── strategies/          # JWT, JWT refresh strategies
    └── users/                       # Users module
        ├── application/
        │   ├── dto/                 # UpdateUser, UserResponse DTOs
        │   └── services/            # User service
        ├── domain/
        │   ├── entities/            # User entity
        │   ├── value-objects/       # Email, Password VOs
        │   └── ports/
        │       ├── in/              # CreateUser, FindUser, UpdateUser use cases
        │       └── out/             # User repository port
        └── infrastructure/
            ├── adapters/
            │   ├── in/              # User controller
            │   └── out/             # User repository adapter
            ├── persistence/
            │   ├── entities/        # User ORM entity
            │   └── mappers/         # User mapper (domain <-> ORM)
            └── providers/           # Dependency injection providers
```

### Architecture Layers

| Layer | Description |
|-------|-------------|
| **Domain** | Business entities, Value Objects, port interfaces (use cases and repository contracts) |
| **Application** | DTOs, application services implementing use cases |
| **Infrastructure** | Controllers, repository adapters, ORM entities, mappers, guards, strategies |

## Project Structure

```
claude-initial-demo/
├── .husky/                    # Git hooks (commit-msg, pre-commit)
├── environment/               # Environment configuration files
│   ├── .env.dev              # Development
│   ├── .env.stg              # Staging
│   ├── .env.uat              # UAT
│   ├── .env.prod             # Production
│   └── .env.example          # Example template
├── src/
│   ├── config/               # App, database, JWT, logger, email, cache configs
│   ├── modules/              # Application modules (auth, users)
│   ├── shared/               # Shared modules (cache, email, http-client, logging)
│   ├── app.module.ts         # Main module
│   └── main.ts               # Entry point
├── test/
│   ├── unit/                 # Unit tests (mirrors src/ structure)
│   ├── fixtures/             # Test data (auth, user fixtures)
│   ├── helpers/              # Test helpers (database, test app)
│   ├── mocks/                # Mocks (logger, repository, services)
│   ├── jest.unit.config.ts   # Unit test configuration
│   ├── jest.integration.config.ts # Integration test configuration
│   ├── jest.e2e.config.ts    # E2E test configuration
│   └── setup.ts              # Test setup
├── logs/                      # Log files (auto-generated, gitignored)
├── .versionrc.json            # standard-version configuration
├── commitlint.config.js       # Commit message rules
├── docker-compose.yml         # Docker configuration (PostgreSQL)
├── eslint.config.mjs          # ESLint configuration
├── .prettierrc                # Prettier configuration
├── tsconfig.json              # TypeScript configuration
├── CHANGELOG.md               # Auto-generated changelog
├── CLAUDE.md                  # Project conventions for Claude
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Requirements

### Required Software

| Software | Minimum Version | Description |
|----------|-----------------|-------------|
| Node.js | 18.x | JavaScript runtime environment |
| npm | 9.x | Package manager |
| Docker | 20.x | Containers (for PostgreSQL and Redis) |
| Docker Compose | 2.x | Container orchestration |

### Verify Installation

```bash
# Verify Node.js
node --version

# Verify npm
npm --version

# Verify Docker
docker --version

# Verify Docker Compose
docker compose version
```

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd claude-initial-demo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
# Copy the example file
cp environment/.env.example environment/.env.dev

# Edit with your configurations
nano environment/.env.dev
```

## Environment Variables Configuration

### Available Variables

#### Database

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `claude_demo` |

#### JWT

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_ACCESS_SECRET` | Secret for access tokens | - |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |

#### Application

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Execution environment | `development` |
| `PORT` | Application port | `3000` |
| `API_VERSION` | API version for prefix | `v1` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |

#### Logging

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Log level (debug, info, warn, error) | `debug` |
| `LOG_FORMAT` | Log format (pretty, json) | `pretty` |
| `LOG_TO_FILE` | Enable file logging | `false` |
| `LOG_DIRECTORY` | Log directory path | `logs` |
| `LOG_REQUEST_BODY` | Log request bodies | `true` |
| `APP_NAME` | Application name in logs | `claude-demo` |

#### Email (Resend)

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key | - |
| `EMAIL_FROM` | Sender email address | `onboarding@resend.dev` |
| `APP_LOGIN_URL` | Login URL for email templates | `http://localhost:3000/login` |

#### Redis / Cache

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Full Redis connection URL | `redis://localhost:6379` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (optional) | - |
| `CACHE_DEFAULT_TTL` | Default cache TTL in seconds | `3600` |
| `CACHE_KEY_PREFIX` | Cache key prefix | `app:` |

#### Migrations

| Variable | Description | Default |
|----------|-------------|---------|
| `RUN_MIGRATIONS` | Auto-run pending migrations on startup | `true` |

### Example .env file

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=claude_demo

# JWT
JWT_ACCESS_SECRET=your-access-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3000
API_VERSION=v1
CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty
LOG_TO_FILE=false
LOG_DIRECTORY=logs
LOG_REQUEST_BODY=true
APP_NAME=claude-demo

# Email (Resend)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=onboarding@resend.dev
APP_LOGIN_URL=http://localhost:3000/login

# Redis / Cache
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_DEFAULT_TTL=3600
CACHE_KEY_PREFIX=app:

# Migrations
RUN_MIGRATIONS=true
```

## Development Setup

### 1. Start the database with Docker

```bash
# Start PostgreSQL
docker compose up -d

# Verify the container is running
docker ps
```

### 2. Start the application

```bash
# Development mode with hot-reload
npm run start:dev
```

### 3. Verify the application is running

```bash
# The application will be available at:
# http://localhost:3000/api/v1

# Swagger documentation:
# http://localhost:3000/docs

# Test with curl
curl http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","firstName":"John","lastName":"Doe"}'
```

## Available Environments

| Environment | Command | Port | Config File |
|-------------|---------|------|-------------|
| Development | `npm run start:dev` | 3000 | `.env.dev` |
| Staging | `npm run start:stg` | 3001 | `.env.stg` |
| UAT | `npm run start:uat` | 3002 | `.env.uat` |
| Production | `npm run start:prod` | 3000 | `.env.prod` |

### Switch Environment

```bash
# Development
npm run start:dev

# Staging
npm run start:stg

# UAT
npm run start:uat

# Production (requires prior build)
npm run build
npm run start:prod
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/auth/register` | Register new user | No | 10/600s |
| POST | `/auth/login` | Login | No | 10/300s |
| POST | `/auth/refresh` | Refresh tokens | No | 30/60s |
| POST | `/auth/logout` | Logout current session | JWT | Default |
| POST | `/auth/logout-all` | Logout from all sessions | JWT | Default |

### Users (`/users`)

| Method | Endpoint | Description | Auth | Admin Only |
|--------|----------|-------------|------|------------|
| GET | `/users/me` | Get current profile | JWT | No |
| PATCH | `/users/me` | Update current profile | JWT | No |
| GET | `/users/:id` | Get user by ID | JWT | No |
| GET | `/users` | List all users | JWT | Yes |
| PATCH | `/users/:id/role` | Update user role | JWT | Yes |

### Rate Limiting

Global default: 200 requests per 60 seconds. Specific limits apply to auth endpoints as shown above.

### Response Structure

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": { ... },
  "timestamp": "2026-01-23T15:00:00.000Z",
  "path": "/api/users/me"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "email must be an email" }
  ],
  "timestamp": "2026-01-23T15:00:00.000Z",
  "path": "/api/auth/register"
}
```

## API Documentation (Swagger)

Interactive API documentation is available via Swagger UI at:

```
http://localhost:3000/docs
```

Swagger supports JWT authentication — use the "Authorize" button to set your Bearer token for protected endpoints.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start in normal mode |
| `npm run start:dev` | Start in development (hot-reload) |
| `npm run start:stg` | Start in staging |
| `npm run start:uat` | Start in UAT |
| `npm run start:prod` | Start in production |
| `npm run start:debug` | Start in debug mode |
| `npm run build` | Run tests and build the project |
| `npm run lint` | Run linter with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run all tests (unit + integration + e2e) |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:cov` | Run unit tests with coverage |
| `npm run migration:generate` | Generate a new migration |
| `npm run migration:create` | Create an empty migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:show` | Show migration status |
| `npm run release` | Create release (auto version bump + changelog) |
| `npm run release:patch` | Force patch release (0.0.X) |
| `npm run release:minor` | Force minor release (0.X.0) |
| `npm run release:major` | Force major release (X.0.0) |
| `npm run release:dry` | Simulate release (no changes) |

## Testing

Tests are located in the `test/` directory with separate configurations for each level:

| Level | Config | Command | Location |
|-------|--------|---------|----------|
| Unit | `jest.unit.config.ts` | `npm run test:unit` | `test/unit/` |
| Integration | `jest.integration.config.ts` | `npm run test:integration` | `test/integration/` |
| E2E | `jest.e2e.config.ts` | `npm run test:e2e` | `test/e2e/` |

### Coverage

Minimum coverage threshold: **70%** (statements, branches, functions, lines).

```bash
# Run tests with coverage report
npm run test:cov
```

### Test Infrastructure

- **Fixtures** (`test/fixtures/`): Reusable test data for auth and user entities
- **Mocks** (`test/mocks/`): Mock implementations for logger, repositories, and services
- **Helpers** (`test/helpers/`): Database and test app setup utilities

## Docker

### Useful Commands

```bash
# Start containers
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Stop and remove volumes
docker compose down -v

# Restart containers
docker compose restart
```

## Contributing

1. Create a branch from `develop`
2. Make your changes following [Conventional Commits](CLAUDE.md)
3. Run `npm run lint` and `npm run test`
4. Create a Pull Request

## License

This project is private and for internal use only.
