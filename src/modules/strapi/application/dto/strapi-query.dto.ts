import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Country } from '@strapi/domain';

export class StrapiQueryDto {
  @ApiPropertyOptional({ description: 'Locale code (e.g. en, es)' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({
    enum: Country,
    description: 'Country filter',
  })
  @IsOptional()
  @IsEnum(Country)
  country?: string;
}
