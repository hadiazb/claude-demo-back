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

@Injectable()
export class StrapiModuleRepositoryAdapter implements StrapiModuleRepositoryPort {
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
