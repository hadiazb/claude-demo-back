import { StrapiTabsMenu } from '../../entities';

/**
 * Query object containing optional filters for retrieving tabs menu items.
 * Used as input for the FindTabsMenuUseCase.
 */
export interface FindTabsMenuQuery {
  /** Optional locale code for internationalized content */
  locale?: string;
  /** Optional country code to filter items by availability */
  country?: string;
  /** Optional menu type to filter items by classification */
  menuType?: string;
}

/**
 * Input port interface for the Find Tabs Menu use case.
 * Defines the contract for retrieving Strapi tabs menu items from the system.
 * Part of the Hexagonal Architecture's input ports (driving side).
 */
export interface FindTabsMenuUseCase {
  /**
   * Retrieves all tabs menu items matching the optional filters.
   * @param query - Optional query filters for locale, country, and menu type
   * @returns Promise resolving to an array of StrapiTabsMenu entities
   */
  findAll(query?: FindTabsMenuQuery): Promise<StrapiTabsMenu[]>;
  /**
   * Retrieves a single tabs menu item by its numeric identifier.
   * @param id - The numeric ID of the tabs menu item
   * @param query - Optional query filters for locale, country, and menu type
   * @returns Promise resolving to the matching StrapiTabsMenu entity
   */
  findById(id: number, query?: FindTabsMenuQuery): Promise<StrapiTabsMenu>;
}
