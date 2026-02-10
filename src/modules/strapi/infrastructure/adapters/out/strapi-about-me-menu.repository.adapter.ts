import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INJECTION_TOKENS } from '@shared';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';
import {
  StrapiAboutMeMenu,
  StrapiAboutMeMenuRepositoryPort,
  StrapiAboutMeMenuQueryParams,
} from '@strapi/domain';
import { StrapiAboutMeMenuMapper } from '../../mappers';

@Injectable()
export class StrapiAboutMeMenuRepositoryAdapter implements StrapiAboutMeMenuRepositoryPort {
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

  async findAll(
    params?: StrapiAboutMeMenuQueryParams,
  ): Promise<StrapiAboutMeMenu[]> {
    return this.fetchAndFilter(params);
  }

  async findById(
    id: number,
    params?: StrapiAboutMeMenuQueryParams,
  ): Promise<StrapiAboutMeMenu | null> {
    try {
      const items = await this.fetchAndFilter(params);
      return items.find((item) => item.id === id) ?? null;
    } catch {
      return null;
    }
  }

  private async fetchAndFilter(
    params?: StrapiAboutMeMenuQueryParams,
  ): Promise<StrapiAboutMeMenu[]> {
    const queryParams: Record<string, string> = {
      populate: '*',
    };

    if (params?.locale) {
      queryParams.locale = params.locale;
    }

    const response = await this.httpClient.get(
      `${this.baseUrl}api/about-me-menus`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
        params: queryParams,
      },
    );

    let items = StrapiAboutMeMenuMapper.toDomainList(response.data as any);

    if (params?.country) {
      items = items.filter((item) => item.country === params.country);
    }

    if (params?.menuType) {
      items = items.filter((item) => item.menuType === params.menuType);
    }

    return items;
  }
}
