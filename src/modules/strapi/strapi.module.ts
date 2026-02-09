import { Module } from '@nestjs/common';
import { AuthModule } from '@auth';
import {
  StrapiModuleController,
  StrapiTabsMenuController,
  StrapiModuleRepositoryAdapter,
  StrapiTabsMenuRepositoryAdapter,
} from '@strapi/infrastructure/adapters';
import {
  StrapiModuleService,
  StrapiTabsMenuService,
} from '@strapi/application/services';
import { strapiProviders } from '@strapi/infrastructure/providers';

@Module({
  imports: [AuthModule],
  controllers: [StrapiModuleController, StrapiTabsMenuController],
  providers: [
    StrapiModuleService,
    StrapiTabsMenuService,
    StrapiModuleRepositoryAdapter,
    StrapiTabsMenuRepositoryAdapter,
    ...strapiProviders,
  ],
  exports: [StrapiModuleService, StrapiTabsMenuService],
})
export class StrapiModule {}
