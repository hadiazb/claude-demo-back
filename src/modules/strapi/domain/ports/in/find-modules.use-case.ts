import { StrapiModule } from '../../entities';

/**
 * Query object containing optional filters for retrieving Strapi modules.
 * Used as input for the FindModulesUseCase.
 */
export interface FindModulesQuery {
  /** Optional locale code for internationalized content */
  locale?: string;
  /** Optional country code to filter modules by availability */
  country?: string;
}

/**
 * Input port interface for the Find Modules use case.
 * Defines the contract for retrieving Strapi modules from the system.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface FindModulesUseCase {
  /**
   * Retrieves all Strapi modules matching the optional filters.
   * @param query - Optional query filters for locale and country
   * @returns Promise resolving to an array of StrapiModule entities
   */
  findAll(query?: FindModulesQuery): Promise<StrapiModule[]>;
  /**
   * Retrieves a single Strapi module by its document identifier.
   * @param documentId - The Strapi document ID of the module
   * @param query - Optional query filters for locale and country
   * @returns Promise resolving to the matching StrapiModule entity
   */
  findByDocumentId(
    documentId: string,
    query?: FindModulesQuery,
  ): Promise<StrapiModule>;
  /**
   * Retrieves a single Strapi module by its module name.
   * @param moduleName - The name identifier of the module
   * @param query - Optional query filters for locale and country
   * @returns Promise resolving to the matching StrapiModule entity
   */
  findByModuleName(
    moduleName: string,
    query?: FindModulesQuery,
  ): Promise<StrapiModule>;
}
