/**
 * Abstract base class for all domain entities.
 * Provides common properties for identification and timestamp tracking.
 */
export abstract class BaseEntity {
  /** Unique identifier for the entity */
  readonly id: string;

  /** Timestamp indicating when the entity was created */
  readonly createdAt: Date;

  /** Timestamp indicating when the entity was last updated */
  readonly updatedAt: Date;

  /**
   * Creates a new instance of the base entity.
   * @param id - Unique identifier for the entity
   * @param createdAt - Optional creation timestamp. Defaults to current date if not provided
   * @param updatedAt - Optional update timestamp. Defaults to current date if not provided
   */
  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }
}
