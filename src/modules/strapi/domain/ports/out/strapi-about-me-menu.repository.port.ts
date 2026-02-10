import { StrapiAboutMeMenu } from '../../entities';

export interface StrapiAboutMeMenuQueryParams {
  locale?: string;
  country?: string;
  menuType?: string;
}

export interface StrapiAboutMeMenuRepositoryPort {
  findAll(params?: StrapiAboutMeMenuQueryParams): Promise<StrapiAboutMeMenu[]>;
  findById(
    id: number,
    params?: StrapiAboutMeMenuQueryParams,
  ): Promise<StrapiAboutMeMenu | null>;
}
