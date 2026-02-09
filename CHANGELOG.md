# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.4.0](https://github.com/hadiazb/claude-demo-back/compare/v0.3.7...v0.4.0) (2026-02-09)


### ✨ Features

* **strapi:** add tabs-menu content type integration ([391534c](https://github.com/hadiazb/claude-demo-back/commit/391534c07457d9a018a04170b50888815ae3d435))

### [0.3.7](https://github.com/hadiazb/claude-demo-back/compare/v0.3.6...v0.3.7) (2026-02-09)


### 📚 Documentation

* update README.md with strapi module documentation ([983f3d5](https://github.com/hadiazb/claude-demo-back/commit/983f3d564ff44783e33cb37bbd1d57e980f2f7a1))

### [0.3.6](https://github.com/hadiazb/claude-demo-back/compare/v0.3.5...v0.3.6) (2026-02-06)


### 📚 Documentation

* **strapi:** add strapi module documentation to CLAUDE.md ([7db0b73](https://github.com/hadiazb/claude-demo-back/commit/7db0b737a6893338cab94564fbe2e2b57a4ec2c6))

### [0.3.5](https://github.com/hadiazb/claude-demo-back/compare/v0.3.4...v0.3.5) (2026-02-06)


### 📚 Documentation

* update CLAUDE.md and README.md to reflect current project state ([65b3fef](https://github.com/hadiazb/claude-demo-back/commit/65b3fef76910dc8c07f9a384be13416b4da0a5d4))


### ✨ Features

* **strapi:** add module integration with Strapi CMS ([6833eb5](https://github.com/hadiazb/claude-demo-back/commit/6833eb53d27119d396414e8f6362eb88df3ab563))

### [0.3.4](https://github.com/hadiazb/claude-demo-back/compare/v0.3.3...v0.3.4) (2026-02-03)


### ✨ Features

* **cache:** add @Cacheable decorator for declarative caching ([617b301](https://github.com/hadiazb/claude-demo-back/commit/617b3010fa76addb3eee861bfc45027716e092b9))

### [0.3.3](https://github.com/hadiazb/claude-demo-back/compare/v0.3.2...v0.3.3) (2026-02-02)


### 🐛 Bug Fixes

* **cache:** add diagnostic logging for Redis connection issues ([8d83ed7](https://github.com/hadiazb/claude-demo-back/commit/8d83ed79049a505cd8e20cb7dd3132f898d3b4ba))

### [0.3.2](https://github.com/hadiazb/claude-demo-back/compare/v0.3.1...v0.3.2) (2026-02-02)


### 🐛 Bug Fixes

* **cache:** add TLS support for Railway Redis connections ([6b03b7d](https://github.com/hadiazb/claude-demo-back/commit/6b03b7dbe7efe212f2e66ff209589b8f8d80fed1))

### [0.3.1](https://github.com/hadiazb/claude-demo-back/compare/v0.3.0...v0.3.1) (2026-02-02)


### ✨ Features

* **cache:** add Redis cache layer with hexagonal architecture ([45ba040](https://github.com/hadiazb/claude-demo-back/commit/45ba040666440709c338df2a2898a06ce2382f26))

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
