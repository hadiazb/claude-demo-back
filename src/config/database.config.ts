import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'claude_demo',
  autoLoadEntities: true,
  // IMPORTANTE: Usar false cuando trabajas con migraciones
  // synchronize: true solo para prototipos rápidos sin datos importantes
  synchronize: false,
}));
