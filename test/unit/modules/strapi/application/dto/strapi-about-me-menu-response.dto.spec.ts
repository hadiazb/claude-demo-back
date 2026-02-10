import { StrapiAboutMeMenuResponseDto } from '@strapi/application/dto';
import { StrapiAboutMeMenu } from '@strapi/domain';

describe('StrapiAboutMeMenuResponseDto', () => {
  const createAboutMeMenu = (
    overrides: Partial<{
      id: number;
      enable: boolean;
      order: number;
      menuName: string;
      menuType: string;
      country: string;
      maintenance_mode: boolean;
      title: string;
      description: string;
      locale: string;
    }> = {},
  ): StrapiAboutMeMenu =>
    new StrapiAboutMeMenu(
      overrides.id ?? 1,
      overrides.enable ?? true,
      overrides.order ?? 1,
      overrides.menuName ?? 'profile-menu',
      overrides.menuType ?? 'about-me',
      overrides.country ?? 'CO',
      overrides.maintenance_mode ?? false,
      overrides.title,
      overrides.description,
      overrides.locale,
    );

  describe('fromDomain', () => {
    it('should create DTO from domain entity', () => {
      const aboutMeMenu = createAboutMeMenu({ locale: 'es' });

      const dto = StrapiAboutMeMenuResponseDto.fromDomain(aboutMeMenu);

      expect(dto).toBeInstanceOf(StrapiAboutMeMenuResponseDto);
      expect(dto.id).toBe(1);
      expect(dto.menuName).toBe('profile-menu');
      expect(dto.locale).toBe('es');
    });

    it('should map all fields correctly', () => {
      const aboutMeMenu = createAboutMeMenu({
        id: 5,
        enable: false,
        order: 3,
        menuName: 'settings-menu',
        menuType: 'settings',
        country: 'PY',
        maintenance_mode: true,
        title: 'Settings Title',
        description: 'Settings description',
        locale: 'en',
      });

      const dto = StrapiAboutMeMenuResponseDto.fromDomain(aboutMeMenu);

      expect(dto.id).toBe(5);
      expect(dto.enable).toBe(false);
      expect(dto.order).toBe(3);
      expect(dto.menuName).toBe('settings-menu');
      expect(dto.menuType).toBe('settings');
      expect(dto.country).toBe('PY');
      expect(dto.maintenance_mode).toBe(true);
      expect(dto.title).toBe('Settings Title');
      expect(dto.description).toBe('Settings description');
      expect(dto.locale).toBe('en');
    });

    it('should handle undefined optional fields', () => {
      const aboutMeMenu = createAboutMeMenu();

      const dto = StrapiAboutMeMenuResponseDto.fromDomain(aboutMeMenu);

      expect(dto.title).toBeUndefined();
      expect(dto.description).toBeUndefined();
      expect(dto.locale).toBeUndefined();
    });

    it('should return a new DTO instance each time', () => {
      const aboutMeMenu = createAboutMeMenu();

      const dto1 = StrapiAboutMeMenuResponseDto.fromDomain(aboutMeMenu);
      const dto2 = StrapiAboutMeMenuResponseDto.fromDomain(aboutMeMenu);

      expect(dto1).not.toBe(dto2);
      expect(dto1.id).toBe(dto2.id);
    });
  });
});
