import { StrapiTabsMenu } from '../../entities';

export interface StrapiTabsMenuQueryParams {
  locale?: string;
  country?: string;
  menuType?: string;
}

export interface StrapiTabsMenuRepositoryPort {
  findAll(params?: StrapiTabsMenuQueryParams): Promise<StrapiTabsMenu[]>;
  findById(
    id: number,
    params?: StrapiTabsMenuQueryParams,
  ): Promise<StrapiTabsMenu | null>;
}
