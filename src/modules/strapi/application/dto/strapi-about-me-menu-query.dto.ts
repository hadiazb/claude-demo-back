import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { StrapiQueryDto } from './strapi-query.dto';

export class StrapiAboutMeMenuQueryDto extends StrapiQueryDto {
  @ApiPropertyOptional({ description: 'Menu type filter' })
  @IsOptional()
  @IsString()
  menuType?: string;
}
