import { StrapiModule, StrapiModuleConfig } from '@strapi/domain';

interface StrapiModuleApiData {
  documentId: string;
  locale?: string;
  config: StrapiModuleConfig;
  [key: string]: unknown;
}

interface StrapiModuleApiResponse {
  data: StrapiModuleApiData[];
  meta: unknown;
}

interface StrapiModuleSingleApiResponse {
  data: StrapiModuleApiData;
  meta: unknown;
}

export class StrapiModuleMapper {
  static toDomainList(response: StrapiModuleApiResponse): StrapiModule[] {
    return response.data.map((item) => StrapiModuleMapper.toDomain(item));
  }

  static toDomain(data: StrapiModuleApiData): StrapiModule {
    return new StrapiModule(data.documentId, data.config, data.locale);
  }

  static toDomainFromSingle(
    response: StrapiModuleSingleApiResponse,
  ): StrapiModule {
    return StrapiModuleMapper.toDomain(response.data);
  }
}
