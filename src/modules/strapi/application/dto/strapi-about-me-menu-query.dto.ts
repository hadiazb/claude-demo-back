import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { StrapiQueryDto } from './strapi-query.dto';

/**
 * Data Transfer Object for about me menu query parameters.
 * Extends the base StrapiQueryDto with menu type filtering.
 */
export class StrapiAboutMeMenuQueryDto extends StrapiQueryDto {
  /** Optional menu type to filter about me items by classification */
  @ApiPropertyOptional({ description: 'Menu type filter' })
  @IsOptional()
  @IsString()
  menuType?: string;
}
