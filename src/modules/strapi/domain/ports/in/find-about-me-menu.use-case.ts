import { StrapiAboutMeMenu } from '../../entities';

/**
 * Query object containing optional filters for retrieving about me menu items.
 * Used as input for the FindAboutMeMenuUseCase.
 */
export interface FindAboutMeMenuQuery {
  /** Optional locale code for internationalized content */
  locale?: string;
  /** Optional country code to filter items by availability */
  country?: string;
  /** Optional menu type to filter items by classification */
  menuType?: string;
}

/**
 * Input port interface for the Find About Me Menu use case.
 * Defines the contract for retrieving Strapi about me menu items from the system.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface FindAboutMeMenuUseCase {
  /**
   * Retrieves all about me menu items matching the optional filters.
   * @param query - Optional query filters for locale, country, and menu type
   * @returns Promise resolving to an array of StrapiAboutMeMenu entities
   */
  findAll(query?: FindAboutMeMenuQuery): Promise<StrapiAboutMeMenu[]>;
  /**
   * Retrieves a single about me menu item by its numeric identifier.
   * @param id - The numeric ID of the about me menu item
   * @param query - Optional query filters for locale, country, and menu type
   * @returns Promise resolving to the matching StrapiAboutMeMenu entity
   */
  findById(
    id: number,
    query?: FindAboutMeMenuQuery,
  ): Promise<StrapiAboutMeMenu>;
}
