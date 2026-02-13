import { Provider } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import {
  StrapiModuleRepositoryAdapter,
  StrapiTabsMenuRepositoryAdapter,
  StrapiAboutMeMenuRepositoryAdapter,
} from '@strapi/infrastructure/adapters';

/**
 * Dependency injection providers for the Strapi module.
 * Binds repository port tokens to their infrastructure adapter implementations.
 */
export const strapiProviders: Provider[] = [
  {
    provide: INJECTION_TOKENS.STRAPI_MODULE_REPOSITORY,
    useClass: StrapiModuleRepositoryAdapter,
  },
  {
    provide: INJECTION_TOKENS.STRAPI_TABS_MENU_REPOSITORY,
    useClass: StrapiTabsMenuRepositoryAdapter,
  },
  {
    provide: INJECTION_TOKENS.STRAPI_ABOUT_ME_MENU_REPOSITORY,
    useClass: StrapiAboutMeMenuRepositoryAdapter,
  },
];
