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

@ApiTags('Strapi - About Me Menu')
@ApiBearerAuth()
@Throttle({ default: { ttl: 60000, limit: 30 } })
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('strapi/about-me-menu')
export class StrapiAboutMeMenuController {
  constructor(
    private readonly strapiAboutMeMenuService: StrapiAboutMeMenuService,
  ) {}

  @Get()
  @Cacheable({ key: 'strapi:about-me-menu:all', ttl: 300 })
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

  @Get(':id')
  @Cacheable({ key: 'strapi:about-me-menu:one', ttl: 300 })
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
