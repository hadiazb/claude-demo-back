import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import {
  StrapiAboutMeMenu,
  StrapiAboutMeMenuRepositoryPort,
  FindAboutMeMenuQuery,
  FindAboutMeMenuUseCase,
} from '@strapi/domain';

/**
 * Application service implementing the FindAboutMeMenuUseCase.
 * Orchestrates retrieval of Strapi about me menu items through the repository port,
 * handling not-found scenarios with appropriate exceptions.
 */
@Injectable()
export class StrapiAboutMeMenuService implements FindAboutMeMenuUseCase {
  /**
   * Creates a new StrapiAboutMeMenuService instance.
   * @param aboutMeMenuRepository - The repository port for accessing Strapi about me menu items
   */
  constructor(
    @Inject(INJECTION_TOKENS.STRAPI_ABOUT_ME_MENU_REPOSITORY)
    private readonly aboutMeMenuRepository: StrapiAboutMeMenuRepositoryPort,
  ) {}

  /**
   * Retrieves all about me menu items matching the optional filters.
   * @param query - Optional query filters for locale, country, and menu type
   * @returns Promise resolving to an array of StrapiAboutMeMenu entities
   */
  async findAll(query?: FindAboutMeMenuQuery): Promise<StrapiAboutMeMenu[]> {
    return await this.aboutMeMenuRepository.findAll(query);
  }

  /**
   * Retrieves a single about me menu item by its numeric identifier.
   * @param id - The numeric ID of the about me menu item
   * @param query - Optional query filters for locale, country, and menu type
   * @returns Promise resolving to the matching StrapiAboutMeMenu entity
   * @throws NotFoundException if no about me menu item matches the given ID
   */
  async findById(
    id: number,
    query?: FindAboutMeMenuQuery,
  ): Promise<StrapiAboutMeMenu> {
    const aboutMeMenu = await this.aboutMeMenuRepository.findById(id, query);
    if (!aboutMeMenu) {
      throw new NotFoundException(
        `About me menu item with id '${id}' not found`,
      );
    }
    return aboutMeMenu;
  }
}
