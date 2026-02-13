import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Country } from '@strapi/domain';

/**
 * Base Data Transfer Object for Strapi query parameters.
 * Provides common filtering options shared across all Strapi endpoints.
 * Extended by specific query DTOs for tabs menu and about me menu.
 */
export class StrapiQueryDto {
  /** Optional locale code for retrieving internationalized content */
  @ApiPropertyOptional({ description: 'Locale code (e.g. en, es)' })
  @IsOptional()
  @IsString()
  locale?: string;

  /** Optional country code to filter content by geographic availability */
  @ApiPropertyOptional({
    enum: Country,
    description: 'Country filter',
  })
  @IsOptional()
  @IsEnum(Country)
  country?: string;
}
