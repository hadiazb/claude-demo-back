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

/**
 * Infrastructure adapter implementing the StrapiTabsMenuRepositoryPort.
 * Fetches tabs menu data from the Strapi CMS API via HTTP and maps responses
 * to domain entities. Applies post-fetch filtering for country and menu type.
 */
@Injectable()
export class StrapiTabsMenuRepositoryAdapter implements StrapiTabsMenuRepositoryPort {
  /** Base URL of the Strapi API */
  private readonly baseUrl: string;
  /** API token for authenticating Strapi requests */
  private readonly apiToken: string;

  /**
   * Creates a new StrapiTabsMenuRepositoryAdapter instance.
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
   * Retrieves all tabs menu items from the API with optional filtering.
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to an array of StrapiTabsMenu domain entities
   */
  async findAll(params?: StrapiTabsMenuQueryParams): Promise<StrapiTabsMenu[]> {
    return this.fetchAndFilter(params);
  }

  /**
   * Retrieves a single tabs menu item by its numeric identifier.
   * Fetches all items and finds the matching one by ID.
   * @param id - The numeric ID of the tabs menu item
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to the matching StrapiTabsMenu or null if not found
   */
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

  /**
   * Fetches all tabs menu items from the Strapi API and applies post-fetch filtering.
   * Locale filtering is applied at the API level; country and menuType are filtered locally.
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to filtered array of StrapiTabsMenu entities
   */
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
