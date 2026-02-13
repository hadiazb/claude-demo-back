import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { StrapiTabsMenuService } from '@strapi/application/services';
import {
  StrapiTabsMenuResponseDto,
  StrapiTabsMenuQueryDto,
} from '@strapi/application/dto';

/**
 * REST controller for Strapi tabs menu operations.
 * Provides endpoints for retrieving tabs menu items with filtering support.
 * Protected by JWT authentication with Redis caching and rate limiting.
 * @route /strapi/tabs-menu
 */
@ApiTags('Strapi - Tabs Menu')
@ApiBearerAuth()
@Throttle({ default: { ttl: 60000, limit: 200 } })
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('strapi/tabs-menu')
export class StrapiTabsMenuController {
  /**
   * Creates a new StrapiTabsMenuController instance.
   * @param strapiTabsMenuService - The service for tabs menu operations
   */
  constructor(private readonly strapiTabsMenuService: StrapiTabsMenuService) {}

  /**
   * Retrieves all tabs menu items with optional locale, country, and menu type filters.
   * @param query - Query parameters for filtering results
   * @returns Promise resolving to an array of StrapiTabsMenuResponseDto
   */
  @Get()
  @Cacheable({ key: 'strapi:tabs-menu:all', ttl: 86400 })
  @ApiOperation({ summary: 'Get all Strapi tabs menu items' })
  @ApiResponse({
    status: 200,
    description: 'List of tabs menu items',
    type: [StrapiTabsMenuResponseDto],
  })
  async findAll(
    @Query() query: StrapiTabsMenuQueryDto,
  ): Promise<StrapiTabsMenuResponseDto[]> {
    const items = await this.strapiTabsMenuService.findAll(query);
    return items.map((item) => StrapiTabsMenuResponseDto.fromDomain(item));
  }

  /**
   * Retrieves a single tabs menu item by its numeric identifier.
   * @param id - The numeric ID of the tabs menu item
   * @param query - Query parameters for filtering results
   * @returns Promise resolving to the matching StrapiTabsMenuResponseDto
   * @throws NotFoundException if no tabs menu item matches the given ID
   */
  @Get(':id')
  @Cacheable({ key: 'strapi:tabs-menu:one', ttl: 86400 })
  @ApiOperation({ summary: 'Get a Strapi tabs menu item by ID' })
  @ApiParam({ name: 'id', description: 'Tabs menu item numeric ID' })
  @ApiResponse({
    status: 200,
    description: 'Tabs menu item found',
    type: StrapiTabsMenuResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tabs menu item not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: StrapiTabsMenuQueryDto,
  ): Promise<StrapiTabsMenuResponseDto> {
    const item = await this.strapiTabsMenuService.findById(id, query);
    return StrapiTabsMenuResponseDto.fromDomain(item);
  }
}
