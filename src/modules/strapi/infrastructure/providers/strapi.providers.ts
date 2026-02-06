import { Provider } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import { StrapiModuleRepositoryAdapter } from '@strapi/infrastructure/adapters';

export const strapiProviders: Provider[] = [
  {
    provide: INJECTION_TOKENS.STRAPI_MODULE_REPOSITORY,
    useClass: StrapiModuleRepositoryAdapter,
  },
];
