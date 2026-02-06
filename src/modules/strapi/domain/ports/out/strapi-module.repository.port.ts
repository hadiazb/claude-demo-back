import { StrapiModule } from '../../entities';

export interface StrapiModuleQueryParams {
  locale?: string;
  country?: string;
}

export interface StrapiModuleRepositoryPort {
  findAll(params?: StrapiModuleQueryParams): Promise<StrapiModule[]>;
  findByDocumentId(
    documentId: string,
    params?: StrapiModuleQueryParams,
  ): Promise<StrapiModule | null>;
  findByModuleName(
    moduleName: string,
    params?: StrapiModuleQueryParams,
  ): Promise<StrapiModule | null>;
}
