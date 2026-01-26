import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MIGRACIÓN PASO 1: Agregar columna 'age' como NULLABLE
 *
 * En producción, primero agregamos la columna permitiendo NULL
 * para no afectar los registros existentes.
 */
export class AddAgeColumnNullable1706300000000 implements MigrationInterface {
  name = 'AddAgeColumnNullable1706300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna age como nullable (permite NULL)
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "age" INTEGER
    `);

    console.log('✅ Columna "age" agregada como NULLABLE');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: eliminar la columna
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "age"
    `);

    console.log('✅ Columna "age" eliminada');
  }
}
