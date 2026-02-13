import { StrapiModule } from '../../entities';

/**
 * Query parameters for filtering Strapi module repository operations.
 * Passed to the repository adapter for API-level and post-fetch filtering.
 */
export interface StrapiModuleQueryParams {
  /** Optional locale code for internationalized content */
  locale?: string;
  /** Optional country code to filter modules by availability */
  country?: string;
}

/**
 * Output port interface for the Strapi module repository.
 * Defines the contract for persisting and retrieving Strapi modules.
 * Part of the Hexagonal Architecture's output ports (driven side).
 */
export interface StrapiModuleRepositoryPort {
  /**
   * Retrieves all Strapi modules from the external API.
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to an array of StrapiModule entities
   */
  findAll(params?: StrapiModuleQueryParams): Promise<StrapiModule[]>;
  /**
   * Retrieves a single Strapi module by its document identifier.
   * @param documentId - The Strapi document ID of the module
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to the matching StrapiModule or null if not found
   */
  findByDocumentId(
    documentId: string,
    params?: StrapiModuleQueryParams,
  ): Promise<StrapiModule | null>;
  /**
   * Retrieves a single Strapi module by its module name.
   * @param moduleName - The name identifier of the module
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to the matching StrapiModule or null if not found
   */
  findByModuleName(
    moduleName: string,
    params?: StrapiModuleQueryParams,
  ): Promise<StrapiModule | null>;
}
