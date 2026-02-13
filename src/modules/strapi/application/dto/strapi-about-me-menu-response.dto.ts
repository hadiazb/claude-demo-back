import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StrapiAboutMeMenu } from '@strapi/domain';

/**
 * Data Transfer Object for Strapi about me menu item API responses.
 * Maps domain StrapiAboutMeMenu entities to the API response format.
 * Includes Swagger documentation for OpenAPI specification.
 */
export class StrapiAboutMeMenuResponseDto {
  /** Numeric identifier of the about me menu item */
  @ApiProperty({ description: 'About me menu item ID' })
  id: number;

  /** Whether the menu item is currently active */
  @ApiProperty({ description: 'Whether the menu item is enabled' })
  enable: boolean;

  /** Display order position of the menu item */
  @ApiProperty({ description: 'Display order' })
  order: number;

  /** Name of the menu group */
  @ApiProperty({ description: 'Menu name' })
  menuName: string;

  /** Type classification of the menu */
  @ApiProperty({ description: 'Menu type' })
  menuType: string;

  /** Country code where this item is available */
  @ApiProperty({ description: 'Country code' })
  country: string;

  /** Whether the menu item is in maintenance mode */
  @ApiProperty({ description: 'Whether maintenance mode is active' })
  maintenance_mode: boolean;

  /** Optional display title for the menu item */
  @ApiPropertyOptional({ description: 'Menu item title' })
  title?: string;

  /** Optional description of the menu item */
  @ApiPropertyOptional({ description: 'Menu item description' })
  description?: string;

  /** Optional locale code for the content */
  @ApiPropertyOptional({ description: 'Locale' })
  locale?: string;

  /**
   * Creates a StrapiAboutMeMenuResponseDto from a domain StrapiAboutMeMenu entity.
   * @param aboutMeMenu - The domain entity to convert
   * @returns A new StrapiAboutMeMenuResponseDto instance
   */
  static fromDomain(
    aboutMeMenu: StrapiAboutMeMenu,
  ): StrapiAboutMeMenuResponseDto {
    const dto = new StrapiAboutMeMenuResponseDto();
    dto.id = aboutMeMenu.id;
    dto.enable = aboutMeMenu.enable;
    dto.order = aboutMeMenu.order;
    dto.menuName = aboutMeMenu.menuName;
    dto.menuType = aboutMeMenu.menuType;
    dto.country = aboutMeMenu.country;
    dto.maintenance_mode = aboutMeMenu.maintenance_mode;
    dto.title = aboutMeMenu.title;
    dto.description = aboutMeMenu.description;
    dto.locale = aboutMeMenu.locale;
    return dto;
  }
}
