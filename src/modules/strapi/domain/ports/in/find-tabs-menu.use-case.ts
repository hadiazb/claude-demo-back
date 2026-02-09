import { StrapiTabsMenu } from '../../entities';

export interface FindTabsMenuQuery {
  locale?: string;
  country?: string;
  menuType?: string;
}

export interface FindTabsMenuUseCase {
  findAll(query?: FindTabsMenuQuery): Promise<StrapiTabsMenu[]>;
  findById(id: number, query?: FindTabsMenuQuery): Promise<StrapiTabsMenu>;
}
