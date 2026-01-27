import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration Step 2: Populate existing data and change to NOT NULL.
 *
 * This migration:
 * 1. Updates all records that have age = NULL with a default value
 * 2. Changes the column to NOT NULL for future records
 *
 * IMPORTANT: In a real production environment, you may want to:
 * - Use a smarter value (e.g., calculate from birth date)
 * - Notify users to update their age
 * - Use a placeholder value like 0 and mark it for review
 */
export class SetAgeDefaultAndNotNull1706300000001 implements MigrationInterface {
  /** Unique name identifier for this migration */
  name = 'SetAgeDefaultAndNotNull1706300000001';

  /** Default value for existing records with NULL age */
  private readonly DEFAULT_AGE = 18;

  /**
   * Executes the migration to populate NULL ages and set NOT NULL constraint.
   * Performs three steps: counts affected records, updates NULL values, and adds constraint.
   * @param queryRunner - TypeORM query runner instance for executing database queries
   * @returns Promise that resolves when the migration is complete
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Count affected records (informational)
    const result = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "users" WHERE "age" IS NULL
    `);
    const affectedRows = result[0]?.count || 0;
    console.log(`Records with NULL age: ${affectedRows}`);

    // Step 2: Update existing records with default value
    await queryRunner.query(`
      UPDATE "users"
      SET "age" = ${this.DEFAULT_AGE}
      WHERE "age" IS NULL
    `);
    console.log(`Records updated with age = ${this.DEFAULT_AGE}`);

    // Step 3: Change column to NOT NULL
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "age" SET NOT NULL
    `);
    console.log('Column "age" changed to NOT NULL');
  }

  /**
   * Reverts the migration by removing the NOT NULL constraint.
   * Note: Does not revert the age values since original NULL records are unknown.
   * @param queryRunner - TypeORM query runner instance for executing database queries
   * @returns Promise that resolves when the rollback is complete
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: allow NULL again
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "age" DROP NOT NULL
    `);
    console.log('Column "age" changed to NULLABLE');

    // Note: We don't revert values because we don't know which ones were originally NULL
    console.log('Warning: Age values are not reverted to NULL');
  }
}
