import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import {
  StrapiModule,
  StrapiModuleRepositoryPort,
  FindModulesQuery,
  FindModulesUseCase,
} from '@strapi/domain';

/**
 * Application service implementing the FindModulesUseCase.
 * Orchestrates retrieval of Strapi modules through the repository port,
 * handling not-found scenarios with appropriate exceptions.
 */
@Injectable()
export class StrapiModuleService implements FindModulesUseCase {
  /**
   * Creates a new StrapiModuleService instance.
   * @param moduleRepository - The repository port for accessing Strapi modules
   */
  constructor(
    @Inject(INJECTION_TOKENS.STRAPI_MODULE_REPOSITORY)
    private readonly moduleRepository: StrapiModuleRepositoryPort,
  ) {}

  /**
   * Retrieves all Strapi modules matching the optional filters.
   * @param query - Optional query filters for locale and country
   * @returns Promise resolving to an array of StrapiModule entities
   */
  async findAll(query?: FindModulesQuery): Promise<StrapiModule[]> {
    return this.moduleRepository.findAll(query);
  }

  /**
   * Retrieves a single Strapi module by its document identifier.
   * @param documentId - The Strapi document ID of the module
   * @param query - Optional query filters for locale and country
   * @returns Promise resolving to the matching StrapiModule entity
   * @throws NotFoundException if no module matches the given document ID
   */
  async findByDocumentId(
    documentId: string,
    query?: FindModulesQuery,
  ): Promise<StrapiModule> {
    const module = await this.moduleRepository.findByDocumentId(
      documentId,
      query,
    );
    if (!module) {
      throw new NotFoundException(
        `Module with documentId '${documentId}' not found`,
      );
    }
    return module;
  }

  /**
   * Retrieves a single Strapi module by its module name.
   * @param moduleName - The name identifier of the module
   * @param query - Optional query filters for locale and country
   * @returns Promise resolving to the matching StrapiModule entity
   * @throws NotFoundException if no module matches the given name
   */
  async findByModuleName(
    moduleName: string,
    query?: FindModulesQuery,
  ): Promise<StrapiModule> {
    const module = await this.moduleRepository.findByModuleName(
      moduleName,
      query,
    );
    if (!module) {
      throw new NotFoundException(
        `Module with moduleName '${moduleName}' not found`,
      );
    }
    return module;
  }
}
