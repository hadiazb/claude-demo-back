import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StrapiModule } from '@strapi/domain';

class ModuleTitleDto {
  @ApiProperty({ description: 'Title text' })
  title: string;

  @ApiProperty({ description: 'Whether to show the title' })
  show: boolean;
}

class ModuleDataObjectsDto {
  @ApiPropertyOptional({ description: 'Backend data object' })
  backend: unknown;

  @ApiPropertyOptional({ description: 'Frontend data object' })
  frontend: unknown;
}

class ModuleConfigDto {
  @ApiProperty({ description: 'Module unique identifier' })
  uid: string;

  @ApiProperty({ description: 'Module name' })
  moduleName: string;

  @ApiProperty({ type: ModuleTitleDto })
  title: ModuleTitleDto;

  @ApiProperty({ description: 'Module ID' })
  moduleId: string;

  @ApiProperty({ description: 'Module description' })
  description: string;

  @ApiProperty({ type: [String], description: 'Countries' })
  country: string[];

  @ApiProperty({ type: [Object], description: 'Actions' })
  actions: Record<string, unknown>[];

  @ApiProperty({ type: [Object], description: 'Form objects' })
  form_objects: Record<string, unknown>[];

  @ApiPropertyOptional({ description: 'Formatting configuration' })
  formatting: unknown;

  @ApiProperty({ type: ModuleDataObjectsDto })
  dataObjects: ModuleDataObjectsDto;
}

export class StrapiModuleResponseDto {
  @ApiProperty({ description: 'Strapi document ID' })
  documentId: string;

  @ApiProperty({ type: ModuleConfigDto })
  config: ModuleConfigDto;

  @ApiPropertyOptional({ description: 'Locale' })
  locale?: string;

  static fromDomain(module: StrapiModule): StrapiModuleResponseDto {
    const dto = new StrapiModuleResponseDto();
    dto.documentId = module.documentId;
    dto.config = module.config;
    dto.locale = module.locale;
    return dto;
  }
}
