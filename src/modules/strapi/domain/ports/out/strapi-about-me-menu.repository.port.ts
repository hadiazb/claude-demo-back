import { StrapiAboutMeMenu } from '../../entities';

/**
 * Query parameters for filtering Strapi about me menu repository operations.
 * Passed to the repository adapter for API-level and post-fetch filtering.
 */
export interface StrapiAboutMeMenuQueryParams {
  /** Optional locale code for internationalized content */
  locale?: string;
  /** Optional country code to filter items by availability */
  country?: string;
  /** Optional menu type to filter items by classification */
  menuType?: string;
}

/**
 * Output port interface for the Strapi about me menu repository.
 * Defines the contract for retrieving Strapi about me menu items.
 * Part of the Hexagonal Architecture's output ports (driven side).
 */
export interface StrapiAboutMeMenuRepositoryPort {
  /**
   * Retrieves all about me menu items from the external API.
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to an array of StrapiAboutMeMenu entities
   */
  findAll(params?: StrapiAboutMeMenuQueryParams): Promise<StrapiAboutMeMenu[]>;
  /**
   * Retrieves a single about me menu item by its numeric identifier.
   * @param id - The numeric ID of the about me menu item
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to the matching StrapiAboutMeMenu or null if not found
   */
  findById(
    id: number,
    params?: StrapiAboutMeMenuQueryParams,
  ): Promise<StrapiAboutMeMenu | null>;
}
