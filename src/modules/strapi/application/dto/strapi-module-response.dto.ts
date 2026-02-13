import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StrapiModule } from '@strapi/domain';

/**
 * DTO representing the title section of a module response.
 * Used as a nested type within ModuleConfigDto.
 */
class ModuleTitleDto {
  /** The display title text */
  @ApiProperty({ description: 'Title text' })
  title: string;

  /** Whether the title should be visible */
  @ApiProperty({ description: 'Whether to show the title' })
  show: boolean;
}

/**
 * DTO representing the data objects section of a module response.
 * Separates backend and frontend data object configurations.
 */
class ModuleDataObjectsDto {
  /** Backend-specific data object configuration */
  @ApiPropertyOptional({ description: 'Backend data object' })
  backend: unknown;

  /** Frontend-specific data object configuration */
  @ApiPropertyOptional({ description: 'Frontend data object' })
  frontend: unknown;
}

/**
 * DTO representing the full configuration of a module in the API response.
 * Contains all metadata, actions, and structural information.
 */
class ModuleConfigDto {
  /** Unique identifier for the module configuration */
  @ApiProperty({ description: 'Module unique identifier' })
  uid: string;

  /** Name identifier of the module */
  @ApiProperty({ description: 'Module name' })
  moduleName: string;

  /** Title configuration with display settings */
  @ApiProperty({ type: ModuleTitleDto })
  title: ModuleTitleDto;

  /** Unique module identifier */
  @ApiProperty({ description: 'Module ID' })
  moduleId: string;

  /** Human-readable description of the module */
  @ApiProperty({ description: 'Module description' })
  description: string;

  /** List of country codes where the module is available */
  @ApiProperty({ type: [String], description: 'Countries' })
  country: string[];

  /** Available actions within the module */
  @ApiProperty({ type: [Object], description: 'Actions' })
  actions: Record<string, unknown>[];

  /** Form object definitions for the module */
  @ApiProperty({ type: [Object], description: 'Form objects' })
  form_objects: Record<string, unknown>[];

  /** Formatting configuration for the module */
  @ApiPropertyOptional({ description: 'Formatting configuration' })
  formatting: unknown;

  /** Backend and frontend data object definitions */
  @ApiProperty({ type: ModuleDataObjectsDto })
  dataObjects: ModuleDataObjectsDto;
}

/**
 * Data Transfer Object for Strapi module API responses.
 * Maps domain StrapiModule entities to the API response format.
 * Includes Swagger documentation for OpenAPI specification.
 */
export class StrapiModuleResponseDto {
  /** The Strapi document identifier */
  @ApiProperty({ description: 'Strapi document ID' })
  documentId: string;

  /** The full module configuration */
  @ApiProperty({ type: ModuleConfigDto })
  config: ModuleConfigDto;

  /** Optional locale code for the content */
  @ApiPropertyOptional({ description: 'Locale' })
  locale?: string;

  /**
   * Creates a StrapiModuleResponseDto from a domain StrapiModule entity.
   * @param module - The domain entity to convert
   * @returns A new StrapiModuleResponseDto instance
   */
  static fromDomain(module: StrapiModule): StrapiModuleResponseDto {
    const dto = new StrapiModuleResponseDto();
    dto.documentId = module.documentId;
    dto.config = module.config;
    dto.locale = module.locale;
    return dto;
  }
}
