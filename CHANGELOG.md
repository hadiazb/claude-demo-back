# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.1.0] - 2026-01-30

### ✨ Features

- **auth:** JWT authentication with access and refresh tokens
- **auth:** User registration and login endpoints
- **auth:** Role-based access control (RBAC) with guards
- **users:** Complete CRUD operations for user management
- **users:** Password hashing with bcrypt and validation
- **users:** Email value object with validation
- **logging:** Winston logger with request ID tracking
- **logging:** Data sanitization for sensitive fields
- **http-client:** Axios adapter with retry logic
- **config:** Environment-based configuration (dev, stg, uat, prod)
- **config:** Secrets validation for production
- **api:** Swagger/OpenAPI documentation
- **api:** Global response interceptor with standardized format
- **api:** HTTP exception filter with detailed error responses

### ✅ Tests

- 606 unit tests with 99%+ coverage
- Test structure mirroring source code organization
- Comprehensive mocking strategies for all layers

### 🔧 Maintenance

- Hexagonal architecture (Ports & Adapters)
- TypeORM with PostgreSQL support
- Database migrations system
- ESLint + Prettier configuration
- Husky pre-commit hooks
- Conventional commits with commitlint
- Semantic versioning with standard-version
