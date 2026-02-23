# Instrucciones del Proyecto

## Formato de Commits (Conventional Commits)

Usar el siguiente formato para todos los mensajes de commit:

```
tipo(alcance): descripción corta

Descripción detallada (opcional)

BREAKING CHANGE: descripción (si aplica)
```

Header máximo: 100 caracteres. Validado por `commitlint` + `husky` (pre-commit hooks).

### Tipos disponibles

| Tipo | Descripción | Bump de versión |
|------|-------------|-----------------|
| `feat` | Nueva funcionalidad | MINOR (0.X.0) |
| `fix` | Corrección de bug | PATCH (0.0.X) |
| `docs` | Documentación | - |
| `style` | Formato, espacios | - |
| `refactor` | Refactorización | - |
| `test` | Agregar tests | - |
| `chore` | Mantenimiento | - |
| `perf` | Mejoras rendimiento | PATCH (0.0.X) |
| `ci` | CI/CD | - |
| `build` | Build/dependencias | - |
| `revert` | Revertir commit | - |

### Ejemplos

```bash
# Feature nueva
feat(auth): add password reset functionality

# Bug fix
fix(users): resolve email validation error

# Con alcance opcional
docs: update API documentation

# Breaking change (bump MAJOR)
feat(api): change response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case
```

### Alcances comunes (scope)

- `auth` - Módulo de autenticación
- `users` - Módulo de usuarios
- `api` - API general
- `deps` - Dependencias
- `config` - Configuración
- `cache` - Módulo de caché (Redis)
- `email` - Módulo de email (Resend)
- `logging` - Módulo de logging (Winston)
- `http-client` - Cliente HTTP (Axios)
- `strapi` - Módulo de integración con Strapi CMS

## Versionamiento

Este proyecto usa **Semantic Versioning** con **standard-version** (configurado en `.versionrc.json`).

### Comandos de release

```bash
npm run release        # Automático según commits
npm run release:patch  # Forzar 0.0.X
npm run release:minor  # Forzar 0.X.0
npm run release:major  # Forzar X.0.0
npm run release:dry    # Simular (sin cambios)
```

### Flujo de release

1. Desarrollar en `develop` con commits convencionales
2. Merge a `main` cuando esté listo
3. Ejecutar `npm run release` en `main`
4. Push con tags: `git push --follow-tags origin main`

## Arquitectura

Este proyecto sigue **Arquitectura Hexagonal** (Ports & Adapters):

```
src/modules/{module}/
├── domain/
│   ├── entities/              # Entidades de dominio
│   ├── value-objects/         # Value Objects (ej: Email, Password)
│   └── ports/
│       ├── in/                # Puertos de entrada (Use Cases)
│       └── out/               # Puertos de salida (Repositorios)
├── application/
│   ├── dto/                   # Data Transfer Objects
│   └── services/              # Servicios de aplicación
└── infrastructure/
    ├── adapters/
    │   ├── in/                # Controllers (entrada HTTP)
    │   └── out/               # Repository adapters (salida DB)
    ├── persistence/
    │   ├── entities/          # ORM entities (TypeORM)
    │   └── mappers/           # Domain <-> ORM mappers
    ├── guards/                # Guards de autenticación/autorización
    ├── strategies/            # Estrategias Passport (JWT)
    └── providers/             # Providers de inyección de dependencias
```

### Módulo Strapi

Integración con Strapi CMS (headless) para consumir los content types **Module**, **Tabs Menu** y **About Me Menu**. Usa `HttpClientPort` para llamar la API de Strapi.

```
src/modules/strapi/
├── domain/
│   ├── entities/              # StrapiModule, StrapiTabsMenu, StrapiAboutMeMenu
│   ├── value-objects/         # Country enum (CO, PY, BO, NI, SV, GT, PA, HN)
│   └── ports/
│       ├── in/                # FindModulesUseCase, FindTabsMenuUseCase, FindAboutMeMenuUseCase
│       └── out/               # StrapiModuleRepositoryPort, StrapiTabsMenuRepositoryPort, StrapiAboutMeMenuRepositoryPort
├── application/
│   ├── dto/                   # StrapiModuleResponseDto, StrapiTabsMenuResponseDto, StrapiAboutMeMenuResponseDto, StrapiQueryDto, StrapiTabsMenuQueryDto, StrapiAboutMeMenuQueryDto, StrapiWebhookPayloadDto
│   └── services/              # StrapiModuleService, StrapiTabsMenuService, StrapiAboutMeMenuService, StrapiWebhookService
└── infrastructure/
    ├── adapters/
    │   ├── in/                # StrapiModuleController, StrapiTabsMenuController, StrapiAboutMeMenuController (JWT + Cache + Throttle 30 req/min), StrapiWebhookController
    │   └── out/               # StrapiModuleRepositoryAdapter, StrapiTabsMenuRepositoryAdapter, StrapiAboutMeMenuRepositoryAdapter (HttpClientPort → Strapi API)
    ├── guards/                # WebhookSecretGuard (valida x-webhook-secret header)
    ├── mappers/               # StrapiModuleMapper, StrapiTabsMenuMapper, StrapiAboutMeMenuMapper (API JSON → Domain)
    └── providers/             # STRAPI_MODULE_REPOSITORY, STRAPI_TABS_MENU_REPOSITORY, STRAPI_ABOUT_ME_MENU_REPOSITORY → adapters
```

**Endpoints Module:**

| Método | Ruta | Descripción | Filtros |
|--------|------|-------------|---------|
| `GET` | `/api/v1/strapi/modules` | Listar módulos | `country`, `locale` |
| `GET` | `/api/v1/strapi/modules/by-name/:moduleName` | Módulo por nombre | `country`, `locale` |
| `GET` | `/api/v1/strapi/modules/:documentId` | Módulo por document ID | `locale` |

**Endpoints Tabs Menu:**

| Método | Ruta | Descripción | Filtros |
|--------|------|-------------|---------|
| `GET` | `/api/v1/strapi/tabs-menu` | Listar items del menú | `country`, `locale`, `menuType` |
| `GET` | `/api/v1/strapi/tabs-menu/:id` | Item por ID numérico | `country`, `locale`, `menuType` |

**Endpoints About Me Menu:**

| Método | Ruta | Descripción | Filtros |
|--------|------|-------------|---------|
| `GET` | `/api/v1/strapi/about-me-menu` | Listar items del menú | `country`, `locale`, `menuType` |
| `GET` | `/api/v1/strapi/about-me-menu/:id` | Item por ID numérico | `country`, `locale`, `menuType` |

Todos protegidos por JWT. Cache con Redis (300s TTL). Throttle 30 req/min. Filtrado de country y menuType local (post-fetch).

**Endpoints Webhook (Cache Invalidation):**

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/v1/strapi/webhook/cache-invalidation` | Invalidar cache de strapi (`strapi:*`) | `x-webhook-secret` header |
| `GET` | `/api/v1/strapi/webhook/cache-timestamp` | Obtener timestamp de última invalidación | JWT (Bearer) |

- **POST cache-invalidation**: Strapi invoca este endpoint al modificar contenido. Borra todas las keys `strapi:*` de Redis y escribe la key `strapi:cache` con el timestamp actual (TTL 30 días). Autenticado con header `x-webhook-secret` (sin JWT, sin cache, sin throttle).
- **GET cache-timestamp**: Retorna `{ timestamp: string | null }` con el valor de la key `strapi:cache`. El frontend lo compara con su timestamp local para decidir si debe limpiar su cache. Protegido por JWT.

**Diferencias clave entre Module, Tabs Menu y About Me Menu:**

- **Module**: entidad con wrapper `config`, `documentId` (string), country es array → filtrado con `includes()`
- **Tabs Menu**: entidad plana (sin `config`), `id` numérico, country es string → filtrado con `===`
- **About Me Menu**: entidad plana, `id` numérico, country es string → filtrado con `===`. Campos: `enable`, `order`, `menuName`, `menuType`, `country`, `maintenance_mode`, `title?`, `description?`

**Variables de entorno:**

- `STRAPI_API_URL` - URL de la API de Strapi
- `STRAPI_API_TOKEN` - Token de API de Strapi
- `STRAPI_WEBHOOK_SECRET` - Secret compartido para autenticar webhooks de Strapi

### Módulos shared

```
src/shared/
├── cache/                     # Caché con Redis (adapter, decorators, interceptors)
├── email/                     # Email con Resend (adapter, templates)
├── http-client/               # Cliente HTTP con Axios (adapter, ports)
├── logging/                   # Logging con Winston (adapter, middleware, sanitizers)
├── constants/                 # Tokens de inyección de dependencias
├── domain/                    # Entidad base
├── infrastructure/            # Filters, interceptors, decorators compartidos
└── interfaces/                # Interfaces de respuesta API
```

## Testing

- **Tests unitarios**: `npm run test:unit` (925 tests, 51 suites)
- **Tests de integración**: `npm run test:integration` (88 tests, 9 suites)
- **Tests e2e**: `npm run test:e2e`
- **Todos los tests**: `npm run test`
- **Coverage**: `npm run test:cov`
- **Coverage mínimo**: 70% (statements, branches, functions, lines)

### Estructura de tests

```
test/
├── fixtures/                  # Datos de prueba (user.fixture.ts, auth.fixture.ts)
├── mocks/                     # Mocks reutilizables (logger, repository, services)
├── helpers/                   # Utilidades (database, test app)
├── unit/                      # Tests unitarios (espejo de src/)
├── integration/               # Tests de integración
│   ├── modules/
│   │   ├── users/
│   │   │   ├── infrastructure/   # UserRepositoryAdapter + TypeORM mock
│   │   │   └── application/      # UserService + UserRepositoryAdapter real
│   │   ├── auth/
│   │   │   ├── infrastructure/   # TokenRepositoryAdapter + TypeORM mock
│   │   │   └── application/      # AuthService + cadena completa (JwtService real)
│   │   └── strapi/
│   │       ├── infrastructure/   # 3 Repository Adapters + HttpClient mock
│   │       └── application/      # 3 Services + Adapters reales
│   └── shared/
│       └── http-client/          # AxiosHttpClientAdapter + axios mock
└── e2e/                       # Tests end-to-end
```

### Tests de integración - Enfoque

Los tests de integración verifican la **interacción entre capas** (Service + Repository Adapter) usando `@nestjs/testing` `TestingModule`. No requieren base de datos real ni servicios externos.

**Patrón:** Se inyectan los adapters reales (ej: `UserRepositoryAdapter`) pero se mockean las dependencias de infraestructura (ej: TypeORM `Repository`, `HttpClientPort`). Esto testea el mapeo Domain ↔ ORM/API y la integración entre Service y Adapter.

| Suite | Archivo | Tests | Qué verifica |
|-------|---------|-------|--------------|
| User Repository | `users/infrastructure/user-repository.integration.spec.ts` | 11 | CRUD, mapeo ORM↔Domain, normalización email |
| User Service | `users/application/user-service.integration.spec.ts` | 9 | Creación con Value Objects, reglas de negocio (roles) |
| Token Repository | `auth/infrastructure/token-repository.integration.spec.ts` | 6 | Persistencia y revocación de refresh tokens |
| Auth Service | `auth/application/auth-service.integration.spec.ts` | 10 | Flujo completo: register, login, refresh, logout |
| Strapi Module Repo | `strapi/infrastructure/strapi-module-repository.integration.spec.ts` | 7 | HTTP→Mapper→Domain, filtro country con `includes()` |
| Strapi TabsMenu Repo | `strapi/infrastructure/strapi-tabs-menu-repository.integration.spec.ts` | 8 | Filtro country `===`, menuType, findById |
| Strapi AboutMe Repo | `strapi/infrastructure/strapi-about-me-menu-repository.integration.spec.ts` | 8 | Análogo a TabsMenu |
| Strapi Services | `strapi/application/strapi-services.integration.spec.ts` | 13 | 3 services delegando a adapters, NotFoundException |
| Axios HTTP Client | `shared/http-client/axios-http-client.integration.spec.ts` | 5 | GET/POST, retry 5xx, no retry 4xx |

### Configuración de Jest

- **Unit**: `test/jest.unit.config.ts` - testMatch: `test/unit/**/*.spec.ts`
- **Integration**: `test/jest.integration.config.ts` - testMatch: `test/integration/**/*.integration.spec.ts`
- **E2E**: `test/jest.e2e.config.ts`
- **Path aliases**: `@users`, `@auth`, `@strapi`, `@shared`, `@config`, `@/`
- **Timeout**: 30s para integración y e2e
- **Setup**: `test/setup.ts` (limpia mocks en `beforeEach`)

## Comandos Útiles

```bash
npm run start:dev     # Desarrollo (hot-reload)
npm run lint          # Linter
npm run test:unit     # Tests unitarios
npm run test:cov      # Coverage
npm run release:dry   # Simular release
npm run migration:run # Ejecutar migraciones
npm run build         # Build (ejecuta tests primero)
```
