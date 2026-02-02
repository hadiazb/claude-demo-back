# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/hadiazb/claude-demo-back/compare/v0.2.0...v0.3.0) (2026-02-02)


### ✨ Features

* **users:** add role management with business rules ([cbeb596](https://github.com/hadiazb/claude-demo-back/commit/cbeb59659d5f389c6c1a464948d9f3542982aef6))

## [0.2.0](https://github.com/hadiazb/claude-demo-back/compare/v0.1.0...v0.2.0) (2026-02-01)


### ✨ Features

* **api:** add X-App-Version header to responses ([cb27c85](https://github.com/hadiazb/claude-demo-back/commit/cb27c853e2a42fa5ee22fc2574978de7284d9487))
* **db:** consolidate migrations and add auto-run on startup ([f49574d](https://github.com/hadiazb/claude-demo-back/commit/f49574d331885ff5731ba64051e971f027f8a14f))
* **email:** integrate Resend for registration notifications ([a481a29](https://github.com/hadiazb/claude-demo-back/commit/a481a2993f65dbd4d7bcfd65d25127814ae82552))

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
