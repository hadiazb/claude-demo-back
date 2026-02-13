import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { StrapiQueryDto } from './strapi-query.dto';

/**
 * Data Transfer Object for tabs menu query parameters.
 * Extends the base StrapiQueryDto with menu type filtering.
 */
export class StrapiTabsMenuQueryDto extends StrapiQueryDto {
  /** Optional menu type to filter tabs by classification */
  @ApiPropertyOptional({ description: 'Menu type filter' })
  @IsOptional()
  @IsString()
  menuType?: string;
}
