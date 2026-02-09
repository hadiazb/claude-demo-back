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

@ApiTags('Strapi - Tabs Menu')
@ApiBearerAuth()
@Throttle({ default: { ttl: 60000, limit: 30 } })
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('strapi/tabs-menu')
export class StrapiTabsMenuController {
  constructor(private readonly strapiTabsMenuService: StrapiTabsMenuService) {}

  @Get()
  @Cacheable({ key: 'strapi:tabs-menu:all', ttl: 300 })
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

  @Get(':id')
  @Cacheable({ key: 'strapi:tabs-menu:one', ttl: 300 })
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
