import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INJECTION_TOKENS } from '@shared';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';
import {
  StrapiModule,
  StrapiModuleRepositoryPort,
  StrapiModuleQueryParams,
} from '@strapi/domain';
import { StrapiModuleMapper } from '../../mappers';

/**
 * Infrastructure adapter implementing the StrapiModuleRepositoryPort.
 * Fetches module data from the Strapi CMS API via HTTP and maps responses
 * to domain entities. Applies post-fetch filtering for country.
 */
@Injectable()
export class StrapiModuleRepositoryAdapter implements StrapiModuleRepositoryPort {
  /** Base URL of the Strapi API */
  private readonly baseUrl: string;
  /** API token for authenticating Strapi requests */
  private readonly apiToken: string;

  /**
   * Creates a new StrapiModuleRepositoryAdapter instance.
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
   * Retrieves all Strapi modules from the API with optional filtering.
   * Locale filtering is applied at the API level; country filtering is post-fetch
   * since modules have a country array checked with includes().
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to an array of StrapiModule domain entities
   */
  async findAll(params?: StrapiModuleQueryParams): Promise<StrapiModule[]> {
    const queryParams: Record<string, string> = {
      populate: '*',
    };

    if (params?.locale) {
      queryParams.locale = params.locale;
    }

    const response = await this.httpClient.get(`${this.baseUrl}api/modules`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
      params: queryParams,
    });

    let modules = StrapiModuleMapper.toDomainList(response.data as any);

    if (params?.country) {
      modules = modules.filter((m) =>
        m.config.country.includes(params.country!),
      );
    }

    return modules;
  }

  /**
   * Retrieves a single Strapi module by its document identifier.
   * @param documentId - The Strapi document ID of the module
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to the matching StrapiModule or null if not found
   */
  async findByDocumentId(
    documentId: string,
    params?: StrapiModuleQueryParams,
  ): Promise<StrapiModule | null> {
    const queryParams: Record<string, string> = {
      populate: '*',
    };

    if (params?.locale) {
      queryParams.locale = params.locale;
    }

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}api/modules/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
          params: queryParams,
        },
      );

      return StrapiModuleMapper.toDomainFromSingle(response.data as any);
    } catch {
      return null;
    }
  }

  /**
   * Retrieves a single Strapi module by its module name.
   * Fetches all modules and filters locally by name and optionally by country.
   * @param moduleName - The name identifier of the module
   * @param params - Optional query parameters for filtering results
   * @returns Promise resolving to the matching StrapiModule or null if not found
   */
  async findByModuleName(
    moduleName: string,
    params?: StrapiModuleQueryParams,
  ): Promise<StrapiModule | null> {
    const queryParams: Record<string, string> = {
      populate: '*',
    };

    if (params?.locale) {
      queryParams.locale = params.locale;
    }

    try {
      const response = await this.httpClient.get(`${this.baseUrl}api/modules`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
        params: queryParams,
      });

      let modules = StrapiModuleMapper.toDomainList(response.data as any);

      modules = modules.filter((m) => m.config.moduleName === moduleName);

      if (params?.country) {
        modules = modules.filter((m) =>
          m.config.country.includes(params.country!),
        );
      }

      return modules.length > 0 ? modules[0] : null;
    } catch {
      return null;
    }
  }
}
