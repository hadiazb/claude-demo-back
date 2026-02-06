import { Module } from '@nestjs/common';
import { AuthModule } from '@auth';
import { StrapiModuleController } from '@strapi/infrastructure/adapters';
import { StrapiModuleService } from '@strapi/application/services';
import { StrapiModuleRepositoryAdapter } from '@strapi/infrastructure/adapters';
import { strapiProviders } from '@strapi/infrastructure/providers';

@Module({
  imports: [AuthModule],
  controllers: [StrapiModuleController],
  providers: [
    StrapiModuleService,
    StrapiModuleRepositoryAdapter,
    ...strapiProviders,
  ],
  exports: [StrapiModuleService],
})
export class StrapiModule {}
