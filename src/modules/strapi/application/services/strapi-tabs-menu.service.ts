import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import {
  StrapiTabsMenu,
  StrapiTabsMenuRepositoryPort,
  FindTabsMenuQuery,
  FindTabsMenuUseCase,
} from '@strapi/domain';

/**
 * Application service implementing the FindTabsMenuUseCase.
 * Orchestrates retrieval of Strapi tabs menu items through the repository port,
 * handling not-found scenarios with appropriate exceptions.
 */
@Injectable()
export class StrapiTabsMenuService implements FindTabsMenuUseCase {
  /**
   * Creates a new StrapiTabsMenuService instance.
   * @param tabsMenuRepository - The repository port for accessing Strapi tabs menu items
   */
  constructor(
    @Inject(INJECTION_TOKENS.STRAPI_TABS_MENU_REPOSITORY)
    private readonly tabsMenuRepository: StrapiTabsMenuRepositoryPort,
  ) {}

  /**
   * Retrieves all tabs menu items matching the optional filters.
   * @param query - Optional query filters for locale, country, and menu type
   * @returns Promise resolving to an array of StrapiTabsMenu entities
   */
  async findAll(query?: FindTabsMenuQuery): Promise<StrapiTabsMenu[]> {
    return await this.tabsMenuRepository.findAll(query);
  }

  /**
   * Retrieves a single tabs menu item by its numeric identifier.
   * @param id - The numeric ID of the tabs menu item
   * @param query - Optional query filters for locale, country, and menu type
   * @returns Promise resolving to the matching StrapiTabsMenu entity
   * @throws NotFoundException if no tabs menu item matches the given ID
   */
  async findById(
    id: number,
    query?: FindTabsMenuQuery,
  ): Promise<StrapiTabsMenu> {
    const tabsMenu = await this.tabsMenuRepository.findById(id, query);
    if (!tabsMenu) {
      throw new NotFoundException(`Tabs menu item with id '${id}' not found`);
    }
    return tabsMenu;
  }
}
