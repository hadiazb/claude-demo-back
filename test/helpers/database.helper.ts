import { DataSource } from 'typeorm';

/**
 * Clears all tables in the database.
 * Use this to reset the database state between tests.
 * @param dataSource - The TypeORM data source
 */
export async function clearDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
  }
}

/**
 * Creates a test data source for integration tests.
 * Uses a separate test database to avoid affecting development data.
 */
export async function createTestDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
    username: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'claude_demo_test',
    entities: ['src/**/*.orm-entity.ts'],
    synchronize: true,
    dropSchema: true,
  });

  await dataSource.initialize();

  return dataSource;
}

/**
 * Closes the test data source.
 * @param dataSource - The data source to close
 */
export async function closeTestDataSource(
  dataSource: DataSource,
): Promise<void> {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
}
