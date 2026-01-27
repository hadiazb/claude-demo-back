import { registerAs } from '@nestjs/config';

/**
 * Database configuration factory.
 * Registers the 'database' namespace configuration using NestJS ConfigModule.
 *
 * @returns Configuration object containing database connection settings
 * @property type - Database type (PostgreSQL)
 * @property host - Database host. Defaults to 'localhost'
 * @property port - Database port. Defaults to 5432
 * @property username - Database username. Defaults to 'postgres'
 * @property password - Database password. Defaults to 'postgres'
 * @property database - Database name. Defaults to 'claude_demo'
 * @property autoLoadEntities - Enables automatic entity loading by TypeORM
 * @property synchronize - Disabled to use migrations for schema management
 */
export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'claude_demo',
  autoLoadEntities: true,
  // IMPORTANT: Use false when working with migrations
  // synchronize: true only for quick prototypes without important data
  synchronize: false,
}));
