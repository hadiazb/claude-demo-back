import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StrapiAboutMeMenu } from '@strapi/domain';

export class StrapiAboutMeMenuResponseDto {
  @ApiProperty({ description: 'About me menu item ID' })
  id: number;

  @ApiProperty({ description: 'Whether the menu item is enabled' })
  enable: boolean;

  @ApiProperty({ description: 'Display order' })
  order: number;

  @ApiProperty({ description: 'Menu name' })
  menuName: string;

  @ApiProperty({ description: 'Menu type' })
  menuType: string;

  @ApiProperty({ description: 'Country code' })
  country: string;

  @ApiProperty({ description: 'Whether maintenance mode is active' })
  maintenance_mode: boolean;

  @ApiPropertyOptional({ description: 'Menu item title' })
  title?: string;

  @ApiPropertyOptional({ description: 'Menu item description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Locale' })
  locale?: string;

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
