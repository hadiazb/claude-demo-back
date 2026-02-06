import { StrapiModule } from '../../entities';

export interface FindModulesQuery {
  locale?: string;
  country?: string;
}

export interface FindModulesUseCase {
  findAll(query?: FindModulesQuery): Promise<StrapiModule[]>;
  findByDocumentId(
    documentId: string,
    query?: FindModulesQuery,
  ): Promise<StrapiModule>;
  findByModuleName(
    moduleName: string,
    query?: FindModulesQuery,
  ): Promise<StrapiModule>;
}
