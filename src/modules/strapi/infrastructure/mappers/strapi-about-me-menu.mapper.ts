import { StrapiAboutMeMenu } from '@strapi/domain';

/**
 * Interface representing a single about me menu data item from the Strapi API response.
 */
interface StrapiAboutMeMenuApiData {
  /** Numeric identifier of the about me menu item */
  id: number;
  /** Whether the menu item is currently active */
  enable: boolean;
  /** Display order position of the menu item */
  order: number;
  /** Name of the menu group */
  menuName: string;
  /** Type classification of the menu */
  menuType: string;
  /** Country code where this item is available */
  country: string;
  /** Whether the menu item is in maintenance mode */
  maintenance_mode: boolean;
  /** Optional display title for the menu item */
  title?: string;
  /** Optional description of the menu item */
  description?: string;
  /** Optional locale code for the content */
  locale?: string;
  /** Additional dynamic properties from the API */
  [key: string]: unknown;
}

/**
 * Interface representing the Strapi API list response for about me menu items.
 */
interface StrapiAboutMeMenuApiResponse {
  /** Array of about me menu data items */
  data: StrapiAboutMeMenuApiData[];
  /** API response metadata */
  meta: unknown;
}

/**
 * Interface representing the Strapi API single-item response for about me menu items.
 */
interface StrapiAboutMeMenuSingleApiResponse {
  /** Single about me menu data item */
  data: StrapiAboutMeMenuApiData;
  /** API response metadata */
  meta: unknown;
}

/**
 * Mapper class for converting Strapi about me menu API responses to domain entities.
 * Handles both list and single-item response formats from the Strapi API.
 */
export class StrapiAboutMeMenuMapper {
  /**
   * Maps a list API response to an array of StrapiAboutMeMenu domain entities.
   * @param response - The Strapi API list response
   * @returns Array of StrapiAboutMeMenu domain entities
   */
  static toDomainList(
    response: StrapiAboutMeMenuApiResponse,
  ): StrapiAboutMeMenu[] {
    return response.data.map((item) => StrapiAboutMeMenuMapper.toDomain(item));
  }

  /**
   * Maps a single API data item to a StrapiAboutMeMenu domain entity.
   * @param data - The Strapi API data item
   * @returns A new StrapiAboutMeMenu domain entity
   */
  static toDomain(data: StrapiAboutMeMenuApiData): StrapiAboutMeMenu {
    return new StrapiAboutMeMenu(
      data.id,
      data.enable,
      data.order,
      data.menuName,
      data.menuType,
      data.country,
      data.maintenance_mode,
      data.title,
      data.description,
      data.locale,
    );
  }

  /**
   * Maps a single-item API response to a StrapiAboutMeMenu domain entity.
   * @param response - The Strapi API single-item response
   * @returns A new StrapiAboutMeMenu domain entity
   */
  static toDomainFromSingle(
    response: StrapiAboutMeMenuSingleApiResponse,
  ): StrapiAboutMeMenu {
    return StrapiAboutMeMenuMapper.toDomain(response.data);
  }
}
