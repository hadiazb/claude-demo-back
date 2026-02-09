import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INJECTION_TOKENS } from '@shared';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';
import {
  StrapiTabsMenu,
  StrapiTabsMenuRepositoryPort,
  StrapiTabsMenuQueryParams,
} from '@strapi/domain';
import { StrapiTabsMenuMapper } from '../../mappers';

@Injectable()
export class StrapiTabsMenuRepositoryAdapter implements StrapiTabsMenuRepositoryPort {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(
    @Inject(INJECTION_TOKENS.HTTP_CLIENT)
    private readonly httpClient: HttpClientPort,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('strapi.apiUrl', '');
    this.apiToken = this.configService.get<string>('strapi.apiToken', '');
  }

  async findAll(params?: StrapiTabsMenuQueryParams): Promise<StrapiTabsMenu[]> {
    return this.fetchAndFilter(params);
  }

  async findById(
    id: number,
    params?: StrapiTabsMenuQueryParams,
  ): Promise<StrapiTabsMenu | null> {
    try {
      const items = await this.fetchAndFilter(params);
      return items.find((item) => item.id === id) ?? null;
    } catch {
      return null;
    }
  }

  private async fetchAndFilter(
    params?: StrapiTabsMenuQueryParams,
  ): Promise<StrapiTabsMenu[]> {
    const queryParams: Record<string, string> = {
      populate: '*',
    };

    if (params?.locale) {
      queryParams.locale = params.locale;
    }

    const response = await this.httpClient.get(
      `${this.baseUrl}api/tabs-menus`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
        params: queryParams,
      },
    );

    let items = StrapiTabsMenuMapper.toDomainList(response.data as any);

    if (params?.country) {
      items = items.filter((item) => item.country === params.country);
    }

    if (params?.menuType) {
      items = items.filter((item) => item.menuType === params.menuType);
    }

    return items;
  }
}
