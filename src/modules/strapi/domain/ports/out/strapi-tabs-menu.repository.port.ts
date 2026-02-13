import { StrapiTabsMenu } from '../../entities';

/**
 * Query parameters for filtering Strapi tabs menu repository operations.
 * Passed to the repository adapter for API-level and post-fetch filtering.
 */
export interface StrapiTabsMenuQueryParams {
  /** Optional locale code for internationalized content */
  locale?: string;
  /** Optional country code to filter items by availability */
  country?: string;
  /** Optional menu type to filter items by classification */
  menuType?: string;
}

/**
 * Output port interface for the Strapi tabs menu repository.
 * Defines the contract for retrieving Strapi tabs menu items.
 * Part of the Hexagonal Architecture's output ports (driven side).
 */
export interface StrapiTabsMenuRepositoryPort {
  /**
   * Retrieves all tabs menu items from the external API.
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to an array of StrapiTabsMenu entities
   */
  findAll(params?: StrapiTabsMenuQueryParams): Promise<StrapiTabsMenu[]>;
  /**
   * Retrieves a single tabs menu item by its numeric identifier.
   * @param id - The numeric ID of the tabs menu item
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to the matching StrapiTabsMenu or null if not found
   */
  findById(
    id: number,
    params?: StrapiTabsMenuQueryParams,
  ): Promise<StrapiTabsMenu | null>;
}
