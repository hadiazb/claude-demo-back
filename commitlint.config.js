/**
 * Commitlint Configuration
 *
 * Valida que los commits sigan el formato Conventional Commits:
 *
 * tipo(alcance): descripción
 *
 * Tipos permitidos:
 * - feat:     Nueva funcionalidad (bump MINOR)
 * - fix:      Corrección de bug (bump PATCH)
 * - docs:     Documentación
 * - style:    Formato, espacios (no afecta código)
 * - refactor: Refactorización
 * - test:     Agregar o modificar tests
 * - chore:    Mantenimiento, dependencias
 * - perf:     Mejoras de rendimiento
 * - ci:       Cambios en CI/CD
 * - build:    Cambios en build o dependencias
 * - revert:   Revertir commit anterior
 *
 * Ejemplos válidos:
 * - feat(auth): add password reset
 * - fix(users): resolve email validation bug
 * - docs: update README with API examples
 * - chore(deps): upgrade nestjs to v10
 *
 * Para BREAKING CHANGES (bump MAJOR), agregar en el cuerpo:
 * BREAKING CHANGE: descripción del cambio
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tipos permitidos
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bug
        'docs', // Documentación
        'style', // Formato
        'refactor', // Refactorización
        'test', // Tests
        'chore', // Mantenimiento
        'perf', // Performance
        'ci', // CI/CD
        'build', // Build
        'revert', // Revertir
      ],
    ],
    // El tipo es obligatorio
    'type-empty': [2, 'never'],
    // La descripción es obligatoria
    'subject-empty': [2, 'never'],
    // Máximo 100 caracteres en la primera línea
    'header-max-length': [2, 'always', 100],
  },
};
