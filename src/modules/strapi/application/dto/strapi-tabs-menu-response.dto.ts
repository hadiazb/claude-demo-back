import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StrapiTabsMenu } from '@strapi/domain';

/**
 * Data Transfer Object for Strapi tabs menu item API responses.
 * Maps domain StrapiTabsMenu entities to the API response format.
 * Includes Swagger documentation for OpenAPI specification.
 */
export class StrapiTabsMenuResponseDto {
  /** Numeric identifier of the tabs menu item */
  @ApiProperty({ description: 'Tab menu item ID' })
  id: number;

  /** Display label for the tab */
  @ApiProperty({ description: 'Tab label' })
  label: string;

  /** Whether the tab is currently active */
  @ApiProperty({ description: 'Whether the tab is enabled' })
  enabled: boolean;

  /** Icon identifier for the tab display */
  @ApiProperty({ description: 'Tab icon identifier' })
  icon: string;

  /** Navigation route associated with the tab */
  @ApiProperty({ description: 'Tab route path' })
  route: string;

  /** Unique identifier for the menu group */
  @ApiProperty({ description: 'Menu identifier' })
  menuId: string;

  /** Name of the menu group */
  @ApiProperty({ description: 'Menu name' })
  menuName: string;

  /** Type classification of the menu */
  @ApiProperty({ description: 'Menu type' })
  menuType: string;

  /** Country code where this tab is available */
  @ApiProperty({ description: 'Country code' })
  country: string;

  /** Optional description of the tab */
  @ApiPropertyOptional({ description: 'Tab description' })
  description?: string;

  /** Optional custom font size for the tab label */
  @ApiPropertyOptional({ description: 'Font size' })
  fontSize?: string;

  /** Optional locale code for the content */
  @ApiPropertyOptional({ description: 'Locale' })
  locale?: string;

  /**
   * Creates a StrapiTabsMenuResponseDto from a domain StrapiTabsMenu entity.
   * @param tabsMenu - The domain entity to convert
   * @returns A new StrapiTabsMenuResponseDto instance
   */
  static fromDomain(tabsMenu: StrapiTabsMenu): StrapiTabsMenuResponseDto {
    const dto = new StrapiTabsMenuResponseDto();
    dto.id = tabsMenu.id;
    dto.label = tabsMenu.label;
    dto.enabled = tabsMenu.enabled;
    dto.icon = tabsMenu.icon;
    dto.route = tabsMenu.route;
    dto.menuId = tabsMenu.menuId;
    dto.menuName = tabsMenu.menuName;
    dto.menuType = tabsMenu.menuType;
    dto.country = tabsMenu.country;
    dto.description = tabsMenu.description;
    dto.fontSize = tabsMenu.fontSize;
    dto.locale = tabsMenu.locale;
    return dto;
  }
}
