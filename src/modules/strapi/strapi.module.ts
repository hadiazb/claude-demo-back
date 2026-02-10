import { Module } from '@nestjs/common';
import { AuthModule } from '@auth';
import {
  StrapiModuleController,
  StrapiTabsMenuController,
  StrapiAboutMeMenuController,
  StrapiModuleRepositoryAdapter,
  StrapiTabsMenuRepositoryAdapter,
  StrapiAboutMeMenuRepositoryAdapter,
} from '@strapi/infrastructure/adapters';
import {
  StrapiModuleService,
  StrapiTabsMenuService,
  StrapiAboutMeMenuService,
} from '@strapi/application/services';
import { strapiProviders } from '@strapi/infrastructure/providers';

@Module({
  imports: [AuthModule],
  controllers: [
    StrapiModuleController,
    StrapiTabsMenuController,
    StrapiAboutMeMenuController,
  ],
  providers: [
    StrapiModuleService,
    StrapiTabsMenuService,
    StrapiAboutMeMenuService,
    StrapiModuleRepositoryAdapter,
    StrapiTabsMenuRepositoryAdapter,
    StrapiAboutMeMenuRepositoryAdapter,
    ...strapiProviders,
  ],
  exports: [
    StrapiModuleService,
    StrapiTabsMenuService,
    StrapiAboutMeMenuService,
  ],
})
export class StrapiModule {}
