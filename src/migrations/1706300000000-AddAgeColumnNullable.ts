import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration Step 1: Add 'age' column as NULLABLE.
 *
 * In production environments, we first add the column allowing NULL values
 * to avoid affecting existing records.
 */
export class AddAgeColumnNullable1706300000000 implements MigrationInterface {
  /** Unique name identifier for this migration */
  name = 'AddAgeColumnNullable1706300000000';

  /**
   * Executes the migration to add the 'age' column.
   * Adds an INTEGER column that allows NULL values to the users table.
   * @param queryRunner - TypeORM query runner instance for executing database queries
   * @returns Promise that resolves when the migration is complete
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add age column as nullable (allows NULL)
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "age" INTEGER
    `);

    console.log('Column "age" added as NULLABLE');
  }

  /**
   * Reverts the migration by removing the 'age' column.
   * Drops the age column from the users table.
   * @param queryRunner - TypeORM query runner instance for executing database queries
   * @returns Promise that resolves when the rollback is complete
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: drop the column
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "age"
    `);

    console.log('Column "age" removed');
  }
}
