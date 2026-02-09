import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import {
  StrapiTabsMenu,
  StrapiTabsMenuRepositoryPort,
  FindTabsMenuQuery,
  FindTabsMenuUseCase,
} from '@strapi/domain';

@Injectable()
export class StrapiTabsMenuService implements FindTabsMenuUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.STRAPI_TABS_MENU_REPOSITORY)
    private readonly tabsMenuRepository: StrapiTabsMenuRepositoryPort,
  ) {}

  async findAll(query?: FindTabsMenuQuery): Promise<StrapiTabsMenu[]> {
    return await this.tabsMenuRepository.findAll(query);
  }

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
