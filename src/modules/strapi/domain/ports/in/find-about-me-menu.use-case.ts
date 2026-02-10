import { StrapiAboutMeMenu } from '../../entities';

export interface FindAboutMeMenuQuery {
  locale?: string;
  country?: string;
  menuType?: string;
}

export interface FindAboutMeMenuUseCase {
  findAll(query?: FindAboutMeMenuQuery): Promise<StrapiAboutMeMenu[]>;
  findById(
    id: number,
    query?: FindAboutMeMenuQuery,
  ): Promise<StrapiAboutMeMenu>;
}
