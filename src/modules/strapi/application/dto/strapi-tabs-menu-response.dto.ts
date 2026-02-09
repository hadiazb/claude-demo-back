import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StrapiTabsMenu } from '@strapi/domain';

export class StrapiTabsMenuResponseDto {
  @ApiProperty({ description: 'Tab menu item ID' })
  id: number;

  @ApiProperty({ description: 'Tab label' })
  label: string;

  @ApiProperty({ description: 'Whether the tab is enabled' })
  enabled: boolean;

  @ApiProperty({ description: 'Tab icon identifier' })
  icon: string;

  @ApiProperty({ description: 'Tab route path' })
  route: string;

  @ApiProperty({ description: 'Menu identifier' })
  menuId: string;

  @ApiProperty({ description: 'Menu name' })
  menuName: string;

  @ApiProperty({ description: 'Menu type' })
  menuType: string;

  @ApiProperty({ description: 'Country code' })
  country: string;

  @ApiPropertyOptional({ description: 'Tab description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Font size' })
  fontSize?: string;

  @ApiPropertyOptional({ description: 'Locale' })
  locale?: string;

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
