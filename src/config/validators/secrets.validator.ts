/**
 * Secrets validation for production environments.
 * Ensures that sensitive configuration values meet security requirements.
 */

/** Minimum length required for JWT secrets */
const MIN_SECRET_LENGTH = 32;

/** Patterns that indicate unsafe default values */
const UNSAFE_PATTERNS = [
  'secret',
  'password',
  'change',
  'default',
  'example',
  'your-',
  'replace',
  'changeme',
  'xxx',
  '123',
];

/** Default values that should never be used in production */
const BLOCKED_DEFAULTS = [
  'access-secret-key',
  'refresh-secret-key',
  'your-access-secret-key-change-in-production',
  'your-refresh-secret-key-change-in-production',
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that a secret meets security requirements.
 *
 * @param name - The name of the secret (for error messages)
 * @param value - The secret value to validate
 * @returns Validation result with any errors found
 */
function validateSecret(name: string, value: string | undefined): string[] {
  const errors: string[] = [];

  if (!value) {
    errors.push(`${name} is required but not set`);
    return errors;
  }

  if (value.length < MIN_SECRET_LENGTH) {
    errors.push(
      `${name} must be at least ${MIN_SECRET_LENGTH} characters (current: ${value.length})`,
    );
  }

  if (BLOCKED_DEFAULTS.includes(value)) {
    errors.push(`${name} contains a blocked default value`);
  }

  const lowerValue = value.toLowerCase();
  for (const pattern of UNSAFE_PATTERNS) {
    if (lowerValue.includes(pattern)) {
      errors.push(`${name} contains unsafe pattern: "${pattern}"`);
      break;
    }
  }

  return errors;
}

/**
 * Validates all application secrets for production readiness.
 *
 * @returns Validation result indicating if all secrets are secure
 */
export function validateSecrets(): ValidationResult {
  const errors: string[] = [];
  const nodeEnv = process.env.NODE_ENV;

  // Only enforce strict validation in production
  if (nodeEnv !== 'production') {
    return { isValid: true, errors: [] };
  }

  // Validate JWT secrets
  errors.push(
    ...validateSecret('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET),
  );
  errors.push(
    ...validateSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
  );

  // Ensure access and refresh secrets are different
  if (
    process.env.JWT_ACCESS_SECRET &&
    process.env.JWT_REFRESH_SECRET &&
    process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET
  ) {
    errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  }

  // Validate database password in production
  const dbPassword = process.env.DB_PASSWORD;
  if (!dbPassword || dbPassword === 'postgres' || dbPassword.length < 8) {
    errors.push(
      'DB_PASSWORD must be set to a secure value (min 8 characters, not "postgres")',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates secrets and throws an error if validation fails.
 * Use this at application bootstrap to prevent starting with insecure configuration.
 *
 * @throws Error if any secret validation fails in production
 */
export function assertSecretsAreSecure(): void {
  const result = validateSecrets();

  if (!result.isValid) {
    const errorMessage = [
      '🔐 SECURITY ERROR: Invalid secrets configuration for production',
      '',
      'The following issues must be resolved:',
      ...result.errors.map((e) => `  ❌ ${e}`),
      '',
      'To generate secure secrets, run:',
      "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      '',
    ].join('\n');

    throw new Error(errorMessage);
  }
}
