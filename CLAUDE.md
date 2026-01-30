# Instrucciones del Proyecto

## Formato de Commits

Usar el siguiente formato para todos los mensajes de commit:

```
#NNN | YYYY-MM-DD HH:MM (COT) | Descripción breve

Descripción detallada (opcional)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Ejemplo:
```
#033 | 2026-01-30 14:30 (COT) | Add user profile feature

Implement user profile endpoint with avatar upload support.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Notas:
- **NNN**: Número secuencial del commit (consultar `git log --oneline -1` para el último)
- **COT**: Zona horaria Colombia (UTC-5)
- La descripción breve debe ser concisa y en inglés
- Siempre incluir el Co-Authored-By al final

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
```
