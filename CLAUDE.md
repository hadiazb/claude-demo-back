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

Integración con Strapi CMS (headless) para consumir el content type **Module**. Usa `HttpClientPort` para llamar la API de Strapi.

```
src/modules/strapi/
├── domain/
│   ├── entities/              # StrapiModule (documentId, config, locale)
│   ├── value-objects/         # Country enum (CO, PY, BO, NI, SV, GT, PA, HN)
│   └── ports/
│       ├── in/                # FindModulesUseCase
│       └── out/               # StrapiModuleRepositoryPort
├── application/
│   ├── dto/                   # StrapiModuleResponseDto, StrapiQueryDto
│   └── services/              # StrapiModuleService
└── infrastructure/
    ├── adapters/
    │   ├── in/                # StrapiModuleController (JWT + Cache + Throttle 30 req/min)
    │   └── out/               # StrapiModuleRepositoryAdapter (HttpClientPort → Strapi API)
    ├── mappers/               # StrapiModuleMapper (API JSON → Domain)
    └── providers/             # STRAPI_MODULE_REPOSITORY → adapter
```

**Endpoints:**

| Método | Ruta | Descripción | Filtros |
|--------|------|-------------|---------|
| `GET` | `/api/v1/strapi/modules` | Listar módulos | `country`, `locale` |
| `GET` | `/api/v1/strapi/modules/by-name/:moduleName` | Módulo por nombre | `country`, `locale` |
| `GET` | `/api/v1/strapi/modules/:documentId` | Módulo por document ID | `locale` |

Todos protegidos por JWT. Cache con Redis (keys dinámicas por URL). Filtrado de country local (post-fetch).

**Variables de entorno:**

- `STRAPI_MODULE_REPOSITORY` - URL de la API de Strapi
- `STRAPI_API_TOKEN` - Token de API de Strapi

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

- **Tests unitarios**: `npm run test:unit`
- **Tests de integración**: `npm run test:integration`
- **Tests e2e**: `npm run test:e2e`
- **Todos los tests**: `npm run test`
- **Coverage**: `npm run test:cov`
- **Coverage mínimo**: 70% (statements, branches, functions, lines)
- **Ubicación**: `test/unit/` siguiendo la estructura de `src/`
- **Fixtures**: `test/fixtures/` (datos de prueba)
- **Mocks**: `test/mocks/` (logger, repository, services)
- **Helpers**: `test/helpers/` (database, test app)

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
