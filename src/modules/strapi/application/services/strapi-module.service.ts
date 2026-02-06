import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import {
  StrapiModule,
  StrapiModuleRepositoryPort,
  FindModulesQuery,
  FindModulesUseCase,
} from '@strapi/domain';

@Injectable()
export class StrapiModuleService implements FindModulesUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.STRAPI_MODULE_REPOSITORY)
    private readonly moduleRepository: StrapiModuleRepositoryPort,
  ) {}

  async findAll(query?: FindModulesQuery): Promise<StrapiModule[]> {
    return this.moduleRepository.findAll(query);
  }

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
