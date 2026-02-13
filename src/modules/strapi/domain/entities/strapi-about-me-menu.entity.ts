/**
 * Domain entity representing an "About Me" menu item from Strapi CMS.
 * About Me menus define the structure for user profile sections,
 * with country-specific filtering and maintenance mode support.
 */
export class StrapiAboutMeMenu {
  /**
   * Creates a new StrapiAboutMeMenu instance.
   * @param id - Numeric identifier of the about me menu item
   * @param enable - Whether the menu item is currently active
   * @param order - Display order position of the menu item
   * @param menuName - Name of the menu group this item belongs to
   * @param menuType - Type classification of the menu
   * @param country - Country code where this menu item is available
   * @param maintenance_mode - Whether the menu item is in maintenance mode
   * @param title - Optional display title for the menu item
   * @param description - Optional description of the menu item
   * @param locale - Optional locale code for internationalized content
   */
  constructor(
    public readonly id: number,
    public readonly enable: boolean,
    public readonly order: number,
    public readonly menuName: string,
    public readonly menuType: string,
    public readonly country: string,
    public readonly maintenance_mode: boolean,
    public readonly title?: string,
    public readonly description?: string,
    public readonly locale?: string,
  ) {}
}
