import { StrapiAboutMeMenu } from '@strapi/domain';

interface StrapiAboutMeMenuApiData {
  id: number;
  enable: boolean;
  order: number;
  menuName: string;
  menuType: string;
  country: string;
  maintenance_mode: boolean;
  title?: string;
  description?: string;
  locale?: string;
  [key: string]: unknown;
}

interface StrapiAboutMeMenuApiResponse {
  data: StrapiAboutMeMenuApiData[];
  meta: unknown;
}

interface StrapiAboutMeMenuSingleApiResponse {
  data: StrapiAboutMeMenuApiData;
  meta: unknown;
}

export class StrapiAboutMeMenuMapper {
  static toDomainList(
    response: StrapiAboutMeMenuApiResponse,
  ): StrapiAboutMeMenu[] {
    return response.data.map((item) => StrapiAboutMeMenuMapper.toDomain(item));
  }

  static toDomain(data: StrapiAboutMeMenuApiData): StrapiAboutMeMenu {
    return new StrapiAboutMeMenu(
      data.id,
      data.enable,
      data.order,
      data.menuName,
      data.menuType,
      data.country,
      data.maintenance_mode,
      data.title,
      data.description,
      data.locale,
    );
  }

  static toDomainFromSingle(
    response: StrapiAboutMeMenuSingleApiResponse,
  ): StrapiAboutMeMenu {
    return StrapiAboutMeMenuMapper.toDomain(response.data);
  }
}
