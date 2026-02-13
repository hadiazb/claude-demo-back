import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@auth/infrastructure/guards';
import { CacheInterceptor, Cacheable } from '@shared/cache';
import { StrapiModuleService } from '@strapi/application/services';
import {
  StrapiModuleResponseDto,
  StrapiQueryDto,
} from '@strapi/application/dto';

/**
 * REST controller for Strapi module operations.
 * Provides endpoints for retrieving modules by various criteria.
 * Protected by JWT authentication with Redis caching and rate limiting.
 * @route /strapi/modules
 */
@ApiTags('Strapi - Modules')
@ApiBearerAuth()
@Throttle({ default: { ttl: 60000, limit: 200 } })
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('strapi/modules')
export class StrapiModuleController {
  /**
   * Creates a new StrapiModuleController instance.
   * @param strapiModuleService - The service for Strapi module operations
   */
  constructor(private readonly strapiModuleService: StrapiModuleService) {}

  /**
   * Retrieves all Strapi modules with optional locale and country filters.
   * @param query - Query parameters for filtering results
   * @returns Promise resolving to an array of StrapiModuleResponseDto
   */
  @Get()
  @Cacheable({ key: 'strapi:modules:all', ttl: 86400 })
  @ApiOperation({ summary: 'Get all Strapi modules' })
  @ApiResponse({
    status: 200,
    description: 'List of modules',
    type: [StrapiModuleResponseDto],
  })
  async findAll(
    @Query() query: StrapiQueryDto,
  ): Promise<StrapiModuleResponseDto[]> {
    const modules = await this.strapiModuleService.findAll(query);
    return modules.map((m) => StrapiModuleResponseDto.fromDomain(m));
  }

  /**
   * Retrieves a single Strapi module by its module name.
   * @param moduleName - The name identifier of the module
   * @param query - Query parameters for filtering results
   * @returns Promise resolving to the matching StrapiModuleResponseDto
   * @throws NotFoundException if no module matches the given name
   */
  @Get('by-name/:moduleName')
  @Cacheable({ key: 'strapi:modules:by-name', ttl: 86400 })
  @ApiOperation({ summary: 'Get a Strapi module by module name' })
  @ApiParam({ name: 'moduleName', description: 'Module name' })
  @ApiResponse({
    status: 200,
    description: 'Module found',
    type: StrapiModuleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async findByModuleName(
    @Param('moduleName') moduleName: string,
    @Query() query: StrapiQueryDto,
  ): Promise<StrapiModuleResponseDto> {
    const module = await this.strapiModuleService.findByModuleName(
      moduleName,
      query,
    );
    return StrapiModuleResponseDto.fromDomain(module);
  }

  /**
   * Retrieves a single Strapi module by its document identifier.
   * @param documentId - The Strapi document ID of the module
   * @param query - Query parameters for filtering results
   * @returns Promise resolving to the matching StrapiModuleResponseDto
   * @throws NotFoundException if no module matches the given document ID
   */
  @Get(':documentId')
  @Cacheable({ key: 'strapi:modules:one', ttl: 86400 })
  @ApiOperation({ summary: 'Get a Strapi module by document ID' })
  @ApiParam({ name: 'documentId', description: 'Strapi document ID' })
  @ApiResponse({
    status: 200,
    description: 'Module found',
    type: StrapiModuleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async findOne(
    @Param('documentId') documentId: string,
    @Query() query: StrapiQueryDto,
  ): Promise<StrapiModuleResponseDto> {
    const module = await this.strapiModuleService.findByDocumentId(
      documentId,
      query,
    );
    return StrapiModuleResponseDto.fromDomain(module);
  }
}
