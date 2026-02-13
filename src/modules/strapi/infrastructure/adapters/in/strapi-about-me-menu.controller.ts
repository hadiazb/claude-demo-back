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
import { StrapiAboutMeMenuService } from '@strapi/application/services';
import {
  StrapiAboutMeMenuResponseDto,
  StrapiAboutMeMenuQueryDto,
} from '@strapi/application/dto';

/**
 * REST controller for Strapi about me menu operations.
 * Provides endpoints for retrieving about me menu items with filtering support.
 * Protected by JWT authentication with Redis caching and rate limiting.
 * @route /strapi/about-me-menu
 */
@ApiTags('Strapi - About Me Menu')
@ApiBearerAuth()
@Throttle({ default: { ttl: 60000, limit: 200 } })
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('strapi/about-me-menu')
export class StrapiAboutMeMenuController {
  /**
   * Creates a new StrapiAboutMeMenuController instance.
   * @param strapiAboutMeMenuService - The service for about me menu operations
   */
  constructor(
    private readonly strapiAboutMeMenuService: StrapiAboutMeMenuService,
  ) {}

  /**
   * Retrieves all about me menu items with optional locale, country, and menu type filters.
   * @param query - Query parameters for filtering results
   * @returns Promise resolving to an array of StrapiAboutMeMenuResponseDto
   */
  @Get()
  @Cacheable({ key: 'strapi:about-me-menu:all', ttl: 86400 })
  @ApiOperation({ summary: 'Get all Strapi about me menu items' })
  @ApiResponse({
    status: 200,
    description: 'List of about me menu items',
    type: [StrapiAboutMeMenuResponseDto],
  })
  async findAll(
    @Query() query: StrapiAboutMeMenuQueryDto,
  ): Promise<StrapiAboutMeMenuResponseDto[]> {
    const items = await this.strapiAboutMeMenuService.findAll(query);
    return items.map((item) => StrapiAboutMeMenuResponseDto.fromDomain(item));
  }

  /**
   * Retrieves a single about me menu item by its numeric identifier.
   * @param id - The numeric ID of the about me menu item
   * @param query - Query parameters for filtering results
   * @returns Promise resolving to the matching StrapiAboutMeMenuResponseDto
   * @throws NotFoundException if no about me menu item matches the given ID
   */
  @Get(':id')
  @Cacheable({ key: 'strapi:about-me-menu:one', ttl: 86400 })
  @ApiOperation({ summary: 'Get a Strapi about me menu item by ID' })
  @ApiParam({ name: 'id', description: 'About me menu item numeric ID' })
  @ApiResponse({
    status: 200,
    description: 'About me menu item found',
    type: StrapiAboutMeMenuResponseDto,
  })
  @ApiResponse({ status: 404, description: 'About me menu item not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: StrapiAboutMeMenuQueryDto,
  ): Promise<StrapiAboutMeMenuResponseDto> {
    const item = await this.strapiAboutMeMenuService.findById(id, query);
    return StrapiAboutMeMenuResponseDto.fromDomain(item);
  }
}
