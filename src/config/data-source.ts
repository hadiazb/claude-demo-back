import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Environment file name based on APP_ENV variable.
 * Defaults to 'dev' if not specified.
 */
const envFile = process.env.APP_ENV || 'dev';

// Load environment variables from the environment directory
dotenv.config({
  path: path.resolve(__dirname, `../../environment/.env.${envFile}`),
});

/**
 * TypeORM DataSource configuration for the application.
 * Used for database connections, entity management, and migrations.
 *
 * @property type - Database type (PostgreSQL)
 * @property host - Database host. Defaults to 'localhost'
 * @property port - Database port. Defaults to 5432
 * @property username - Database username. Defaults to 'postgres'
 * @property password - Database password. Defaults to 'postgres'
 * @property database - Database name. Defaults to 'claude_demo'
 * @property entities - Glob pattern for entity files (*.orm-entity.ts)
 * @property migrations - Glob pattern for migration files
 * @property synchronize - Disabled to use migrations for schema management
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'claude_demo',
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always false when using migrations
});
