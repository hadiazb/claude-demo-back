import { StrapiTabsMenu } from '@strapi/domain';

interface StrapiTabsMenuApiData {
  id: number;
  label: string;
  enabled: boolean;
  icon: string;
  route: string;
  menuId: string;
  menuName: string;
  menuType: string;
  country: string;
  description?: string;
  fontSize?: string;
  locale?: string;
  [key: string]: unknown;
}

interface StrapiTabsMenuApiResponse {
  data: StrapiTabsMenuApiData[];
  meta: unknown;
}

interface StrapiTabsMenuSingleApiResponse {
  data: StrapiTabsMenuApiData;
  meta: unknown;
}

export class StrapiTabsMenuMapper {
  static toDomainList(response: StrapiTabsMenuApiResponse): StrapiTabsMenu[] {
    return response.data.map((item) => StrapiTabsMenuMapper.toDomain(item));
  }

  static toDomain(data: StrapiTabsMenuApiData): StrapiTabsMenu {
    return new StrapiTabsMenu(
      data.id,
      data.label,
      data.enabled,
      data.icon,
      data.route,
      data.menuId,
      data.menuName,
      data.menuType,
      data.country,
      data.description,
      data.fontSize,
      data.locale,
    );
  }

  static toDomainFromSingle(
    response: StrapiTabsMenuSingleApiResponse,
  ): StrapiTabsMenu {
    return StrapiTabsMenuMapper.toDomain(response.data);
  }
}
