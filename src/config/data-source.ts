import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde el directorio environment
const envFile = process.env.APP_ENV || 'dev';
dotenv.config({
  path: path.resolve(__dirname, `../../environment/.env.${envFile}`),
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'claude_demo',
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Siempre false cuando usas migraciones
});
