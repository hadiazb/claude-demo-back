import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MIGRACIÓN PASO 2: Llenar datos existentes y cambiar a NOT NULL
 *
 * Esta migración:
 * 1. Actualiza todos los registros que tienen age = NULL con un valor por defecto
 * 2. Cambia la columna a NOT NULL para futuros registros
 *
 * IMPORTANTE: En producción real, podrías querer:
 * - Usar un valor más inteligente (ej: calcular desde fecha de nacimiento)
 * - Notificar a los usuarios que actualicen su edad
 * - Usar un valor placeholder como 0 y marcarlo para revisión
 */
export class SetAgeDefaultAndNotNull1706300000001 implements MigrationInterface {
  name = 'SetAgeDefaultAndNotNull1706300000001';

  // Valor por defecto para registros existentes
  private readonly DEFAULT_AGE = 18;

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Paso 1: Contar registros afectados (informativo)
    const result = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "users" WHERE "age" IS NULL
    `);
    const affectedRows = result[0]?.count || 0;
    console.log(`📊 Registros con age NULL: ${affectedRows}`);

    // Paso 2: Actualizar registros existentes con valor por defecto
    await queryRunner.query(`
      UPDATE "users"
      SET "age" = ${this.DEFAULT_AGE}
      WHERE "age" IS NULL
    `);
    console.log(`✅ Registros actualizados con age = ${this.DEFAULT_AGE}`);

    // Paso 3: Cambiar columna a NOT NULL
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "age" SET NOT NULL
    `);
    console.log('✅ Columna "age" cambiada a NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: permitir NULL nuevamente
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "age" DROP NOT NULL
    `);
    console.log('✅ Columna "age" cambiada a NULLABLE');

    // Nota: No revertimos los valores porque no sabemos cuáles eran NULL originalmente
    console.log('⚠️  Los valores de age no se revierten a NULL');
  }
}
