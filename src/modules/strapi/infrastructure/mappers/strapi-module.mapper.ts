import { StrapiModule, StrapiModuleConfig } from '@strapi/domain';

/**
 * Interface representing a single module data item from the Strapi API response.
 */
interface StrapiModuleApiData {
  /** The Strapi document identifier */
  documentId: string;
  /** Optional locale code for the content */
  locale?: string;
  /** The module configuration object */
  config: StrapiModuleConfig;
  /** Additional dynamic properties from the API */
  [key: string]: unknown;
}

/**
 * Interface representing the Strapi API list response for modules.
 */
interface StrapiModuleApiResponse {
  /** Array of module data items */
  data: StrapiModuleApiData[];
  /** API response metadata */
  meta: unknown;
}

/**
 * Interface representing the Strapi API single-item response for modules.
 */
interface StrapiModuleSingleApiResponse {
  /** Single module data item */
  data: StrapiModuleApiData;
  /** API response metadata */
  meta: unknown;
}

/**
 * Mapper class for converting Strapi module API responses to domain entities.
 * Handles both list and single-item response formats from the Strapi API.
 */
export class StrapiModuleMapper {
  /**
   * Maps a list API response to an array of StrapiModule domain entities.
   * @param response - The Strapi API list response
   * @returns Array of StrapiModule domain entities
   */
  static toDomainList(response: StrapiModuleApiResponse): StrapiModule[] {
    return response.data.map((item) => StrapiModuleMapper.toDomain(item));
  }

  /**
   * Maps a single API data item to a StrapiModule domain entity.
   * @param data - The Strapi API data item
   * @returns A new StrapiModule domain entity
   */
  static toDomain(data: StrapiModuleApiData): StrapiModule {
    return new StrapiModule(data.documentId, data.config, data.locale);
  }

  /**
   * Maps a single-item API response to a StrapiModule domain entity.
   * @param response - The Strapi API single-item response
   * @returns A new StrapiModule domain entity
   */
  static toDomainFromSingle(
    response: StrapiModuleSingleApiResponse,
  ): StrapiModule {
    return StrapiModuleMapper.toDomain(response.data);
  }
}
