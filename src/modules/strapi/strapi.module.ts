import { Module } from '@nestjs/common';
import { AuthModule } from '@auth';
import {
  StrapiModuleController,
  StrapiTabsMenuController,
  StrapiAboutMeMenuController,
  StrapiWebhookController,
  StrapiModuleRepositoryAdapter,
  StrapiTabsMenuRepositoryAdapter,
  StrapiAboutMeMenuRepositoryAdapter,
} from '@strapi/infrastructure/adapters';
import {
  StrapiModuleService,
  StrapiTabsMenuService,
  StrapiAboutMeMenuService,
  StrapiWebhookService,
} from '@strapi/application/services';
import { strapiProviders } from '@strapi/infrastructure/providers';
import { WebhookSecretGuard } from '@strapi/infrastructure/guards/webhook-secret.guard';

/**
 * NestJS module for the Strapi CMS integration.
 * Configures controllers, services, repository adapters, and dependency injection
 * for Module, Tabs Menu, About Me Menu, and Webhook features.
 * Imports AuthModule for JWT authentication support.
 */
@Module({
  imports: [AuthModule],
  controllers: [
    StrapiModuleController,
    StrapiTabsMenuController,
    StrapiAboutMeMenuController,
    StrapiWebhookController,
  ],
  providers: [
    StrapiModuleService,
    StrapiTabsMenuService,
    StrapiAboutMeMenuService,
    StrapiWebhookService,
    WebhookSecretGuard,
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
