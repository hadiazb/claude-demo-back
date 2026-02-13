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

/**
 * Infrastructure adapter implementing the StrapiAboutMeMenuRepositoryPort.
 * Fetches about me menu data from the Strapi CMS API via HTTP and maps responses
 * to domain entities. Applies post-fetch filtering for country and menu type.
 */
@Injectable()
export class StrapiAboutMeMenuRepositoryAdapter implements StrapiAboutMeMenuRepositoryPort {
  /** Base URL of the Strapi API */
  private readonly baseUrl: string;
  /** API token for authenticating Strapi requests */
  private readonly apiToken: string;

  /**
   * Creates a new StrapiAboutMeMenuRepositoryAdapter instance.
   * @param httpClient - The HTTP client port for making API requests
   * @param configService - The NestJS config service for reading Strapi configuration
   */
  constructor(
    @Inject(INJECTION_TOKENS.HTTP_CLIENT)
    private readonly httpClient: HttpClientPort,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('strapi.apiUrl', '');
    this.apiToken = this.configService.get<string>('strapi.apiToken', '');
  }

  /**
   * Retrieves all about me menu items from the API with optional filtering.
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to an array of StrapiAboutMeMenu domain entities
   */
  async findAll(
    params?: StrapiAboutMeMenuQueryParams,
  ): Promise<StrapiAboutMeMenu[]> {
    return this.fetchAndFilter(params);
  }

  /**
   * Retrieves a single about me menu item by its numeric identifier.
   * Fetches all items and finds the matching one by ID.
   * @param id - The numeric ID of the about me menu item
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to the matching StrapiAboutMeMenu or null if not found
   */
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

  /**
   * Fetches all about me menu items from the Strapi API and applies post-fetch filtering.
   * Locale filtering is applied at the API level; country and menuType are filtered locally.
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to filtered array of StrapiAboutMeMenu entities
   */
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
