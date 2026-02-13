import { StrapiTabsMenu } from '@strapi/domain';

/**
 * Interface representing a single tabs menu data item from the Strapi API response.
 */
interface StrapiTabsMenuApiData {
  /** Numeric identifier of the tabs menu item */
  id: number;
  /** Display label for the tab */
  label: string;
  /** Whether the tab is currently active */
  enabled: boolean;
  /** Icon identifier for the tab display */
  icon: string;
  /** Navigation route associated with the tab */
  route: string;
  /** Unique identifier for the menu group */
  menuId: string;
  /** Name of the menu group */
  menuName: string;
  /** Type classification of the menu */
  menuType: string;
  /** Country code where this tab is available */
  country: string;
  /** Optional description of the tab */
  description?: string;
  /** Optional custom font size for the tab label */
  fontSize?: string;
  /** Optional locale code for the content */
  locale?: string;
  /** Additional dynamic properties from the API */
  [key: string]: unknown;
}

/**
 * Interface representing the Strapi API list response for tabs menu items.
 */
interface StrapiTabsMenuApiResponse {
  /** Array of tabs menu data items */
  data: StrapiTabsMenuApiData[];
  /** API response metadata */
  meta: unknown;
}

/**
 * Interface representing the Strapi API single-item response for tabs menu items.
 */
interface StrapiTabsMenuSingleApiResponse {
  /** Single tabs menu data item */
  data: StrapiTabsMenuApiData;
  /** API response metadata */
  meta: unknown;
}

/**
 * Mapper class for converting Strapi tabs menu API responses to domain entities.
 * Handles both list and single-item response formats from the Strapi API.
 */
export class StrapiTabsMenuMapper {
  /**
   * Maps a list API response to an array of StrapiTabsMenu domain entities.
   * @param response - The Strapi API list response
   * @returns Array of StrapiTabsMenu domain entities
   */
  static toDomainList(response: StrapiTabsMenuApiResponse): StrapiTabsMenu[] {
    return response.data.map((item) => StrapiTabsMenuMapper.toDomain(item));
  }

  /**
   * Maps a single API data item to a StrapiTabsMenu domain entity.
   * @param data - The Strapi API data item
   * @returns A new StrapiTabsMenu domain entity
   */
  static toDomain(data: StrapiTabsMenuApiData): StrapiTabsMenu {
    return new StrapiTabsMenu(
      data.id,
      data.label,
      data.enabled,
      data.icon,
      data.route,
      data.menuId,
      data.menuName,
      data.menuType,
      data.country,
      data.description,
      data.fontSize,
      data.locale,
    );
  }

  /**
   * Maps a single-item API response to a StrapiTabsMenu domain entity.
   * @param response - The Strapi API single-item response
   * @returns A new StrapiTabsMenu domain entity
   */
  static toDomainFromSingle(
    response: StrapiTabsMenuSingleApiResponse,
  ): StrapiTabsMenu {
    return StrapiTabsMenuMapper.toDomain(response.data);
  }
}
