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
- [Available Scripts](#available-scripts)

## Description

This project is a REST API that implements an authentication and user management system. It includes:

- User registration and authentication (JWT)
- Refresh tokens for persistent sessions
- User CRUD operations
- Standardized response structure
- Data validation with class-validator
- Global exception handling

## Technologies

### Core

| Technology | Version | Description |
|------------|---------|-------------|
| Node.js | >= 18.x | Runtime environment |
| NestJS | 11.0.1 | Backend framework |
| TypeScript | 5.7.3 | Programming language |
| PostgreSQL | 15+ | Relational database |

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
| typeorm | 0.3.28 | TypeScript ORM |
| pg | 8.17.2 | PostgreSQL driver |
| bcrypt | 6.0.0 | Password hashing |
| class-validator | 0.14.3 | DTO validation |
| class-transformer | 0.5.1 | Object transformation |
| passport | 0.7.0 | Authentication middleware |
| passport-jwt | 4.0.1 | JWT strategy for Passport |
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

## Architecture

The project follows **Hexagonal Architecture (Ports & Adapters)** with the following organization:

```
src/
├── config/                 # Configurations (database, jwt)
├── shared/                 # Shared code
│   ├── constants/         # Injection tokens
│   ├── domain/            # Base entities
│   ├── infrastructure/    # Filters, interceptors, decorators
│   └── interfaces/        # API response interfaces
└── modules/
    ├── auth/              # Authentication module
    │   ├── application/   # DTOs, Services
    │   ├── domain/        # Entities, Ports
    │   └── infrastructure/# Controllers, Guards, Strategies
    └── users/             # Users module
        ├── application/   # DTOs, Services
        ├── domain/        # Entities, Value Objects, Ports
        └── infrastructure/# Controllers, Repositories, Mappers
```

### Architecture Layers

| Layer | Description |
|-------|-------------|
| **Domain** | Business entities, Value Objects, port interfaces |
| **Application** | Use cases, DTOs, application services |
| **Infrastructure** | Controllers, repositories, external adapters |

## Project Structure

```
claude-initial-demo/
├── environment/            # Environment configuration files
│   ├── .env.dev           # Development
│   ├── .env.stg           # Staging
│   ├── .env.uat           # UAT
│   ├── .env.prod          # Production
│   └── .env.example       # Example template
├── src/
│   ├── config/            # Configurations
│   ├── modules/           # Application modules
│   ├── shared/            # Shared code
│   ├── app.module.ts      # Main module
│   └── main.ts            # Entry point
├── test/                  # E2E tests
├── docker-compose.yml     # Docker configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Requirements

### Required Software

| Software | Minimum Version | Description |
|----------|-----------------|-------------|
| Node.js | 18.x | JavaScript runtime environment |
| npm | 9.x | Package manager |
| Docker | 20.x | Containers (for PostgreSQL) |
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

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `claude_demo` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | `your-secret-key` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `your-refresh-secret` |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `NODE_ENV` | Execution environment | `development` |
| `PORT` | Application port | `3000` |

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
# http://localhost:3000/api

# Test with curl
curl http://localhost:3000/api/auth/register \
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

Base URL: `http://localhost:3000/api`

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login | No |
| POST | `/auth/refresh` | Refresh tokens | No |
| POST | `/auth/logout` | Logout | JWT |
| POST | `/auth/logout-all` | Logout from all sessions | JWT |

### Users (`/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current profile | JWT |
| PATCH | `/users/me` | Update current profile | JWT |
| GET | `/users/:id` | Get user by ID | JWT |
| GET | `/users` | List all users | JWT |

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

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start in normal mode |
| `npm run start:dev` | Start in development (hot-reload) |
| `npm run start:stg` | Start in staging |
| `npm run start:uat` | Start in UAT |
| `npm run start:prod` | Start in production |
| `npm run start:debug` | Start in debug mode |
| `npm run build` | Build the project |
| `npm run lint` | Run linter |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |

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
2. Make your changes
3. Run `npm run lint` and `npm run test`
4. Create a Pull Request

## License

This project is private and for internal use only.
