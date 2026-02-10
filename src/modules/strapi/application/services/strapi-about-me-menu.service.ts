import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import {
  StrapiAboutMeMenu,
  StrapiAboutMeMenuRepositoryPort,
  FindAboutMeMenuQuery,
  FindAboutMeMenuUseCase,
} from '@strapi/domain';

@Injectable()
export class StrapiAboutMeMenuService implements FindAboutMeMenuUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.STRAPI_ABOUT_ME_MENU_REPOSITORY)
    private readonly aboutMeMenuRepository: StrapiAboutMeMenuRepositoryPort,
  ) {}

  async findAll(query?: FindAboutMeMenuQuery): Promise<StrapiAboutMeMenu[]> {
    return await this.aboutMeMenuRepository.findAll(query);
  }

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
