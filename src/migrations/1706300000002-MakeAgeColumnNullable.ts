import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Make age column nullable.
 *
 * This migration changes the age column to allow NULL values,
 * making it optional during user registration.
 */
export class MakeAgeColumnNullable1706300000002 implements MigrationInterface {
  name = 'MakeAgeColumnNullable1706300000002';

  /**
   * Makes the age column nullable.
   * @param queryRunner - TypeORM query runner instance
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "age" DROP NOT NULL
    `);
    console.log('Column "age" is now NULLABLE');
  }

  /**
   * Reverts the migration by making age NOT NULL again.
   * Sets a default value for any NULL records before adding the constraint.
   * @param queryRunner - TypeORM query runner instance
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // First, update any NULL values to a default
    await queryRunner.query(`
      UPDATE "users"
      SET "age" = 18
      WHERE "age" IS NULL
    `);

    // Then add NOT NULL constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "age" SET NOT NULL
    `);
    console.log('Column "age" is now NOT NULL');
  }
}
