/**
 * Domain entity representing a tabs menu item from Strapi CMS.
 * Tabs menus define the navigation structure for tabbed interfaces,
 * with country-specific and menu-type filtering support.
 */
export class StrapiTabsMenu {
  /**
   * Creates a new StrapiTabsMenu instance.
   * @param id - Numeric identifier of the tabs menu item
   * @param label - Display label for the tab
   * @param enabled - Whether the tab is currently active
   * @param icon - Icon identifier for the tab display
   * @param route - Navigation route associated with the tab
   * @param menuId - Unique identifier for the menu group
   * @param menuName - Name of the menu group this tab belongs to
   * @param menuType - Type classification of the menu
   * @param country - Country code where this tab is available
   * @param description - Optional description of the tab
   * @param fontSize - Optional custom font size for the tab label
   * @param locale - Optional locale code for internationalized content
   */
  constructor(
    public readonly id: number,
    public readonly label: string,
    public readonly enabled: boolean,
    public readonly icon: string,
    public readonly route: string,
    public readonly menuId: string,
    public readonly menuName: string,
    public readonly menuType: string,
    public readonly country: string,
    public readonly description?: string,
    public readonly fontSize?: string,
    public readonly locale?: string,
  ) {}
}
