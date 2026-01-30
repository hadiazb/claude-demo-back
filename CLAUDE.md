# Instrucciones del Proyecto

## Formato de Commits (Conventional Commits)

Usar el siguiente formato para todos los mensajes de commit:

```
tipo(alcance): descripción corta

Descripción detallada (opcional)

BREAKING CHANGE: descripción (si aplica)
```

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

## Versionamiento

Este proyecto usa **Semantic Versioning** con **standard-version**.

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
├── domain/           # Entidades, Value Objects, Ports
├── application/      # Servicios, DTOs, Use Cases
└── infrastructure/   # Adapters, Controllers, Repositories
```

## Testing

- **Tests unitarios**: `npm run test:unit`
- **Coverage mínimo**: 70% (statements, branches, functions, lines)
- **Ubicación**: `test/unit/` siguiendo la estructura de `src/`

## Comandos Útiles

```bash
npm run start:dev     # Desarrollo
npm run lint          # Linter
npm run test:unit     # Tests unitarios
npm run test:cov      # Coverage
npm run release:dry   # Simular release
```
